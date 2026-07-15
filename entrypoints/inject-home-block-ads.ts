/**
 * 网络请求拦截 — 注入脚本
 *
 * 在页面上下文中拦截 fetch / XMLHttpRequest 请求。
 * URL 模式硬编码，脚本一执行即可拦截，不依赖异步通信。
 * 数据修改通过 postMessage 交由 content script 处理。
 */

export default defineUnlistedScript(() => {
  const BUILTIN_PATTERNS: string[] = [
    "/x/web-interface/wbi/index/top/feed/rcmd",
  ];

  let urlPatterns: string[] = [...BUILTIN_PATTERNS];

  function urlMatches(url: string): boolean {
    try {
      const pathname = new URL(url, location.origin).pathname;
      return urlPatterns.some((p) => pathname === p || url.includes(p));
    } catch {
      return false;
    }
  }

  function waitForModified(
    originalData: unknown,
    requestId: string,
    timeout = 300,
  ): Promise<unknown> {
    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.source !== window) return;
        if (e.data?.type !== "bili-feed-modified") return;
        if (e.data?.requestId !== requestId) return;
        window.removeEventListener("message", handler);
        resolve(e.data.payload);
      };
      window.addEventListener("message", handler);
      setTimeout(() => {
        window.removeEventListener("message", handler);
        resolve(originalData);
      }, timeout);
    });
  }

  function notifyContent(data: unknown, url: string, requestId: string) {
    window.postMessage(
      { type: "bili-feed-response", requestId, url, payload: data },
      "*",
    );
  }

  let requestCounter = 0;

  // ── 可选：接收 content script 追加的动态模式 ──────
  window.addEventListener("message", (e: MessageEvent) => {
    if (e.source !== window) return;
    if (e.data?.type !== "bili-feed-register") return;
    if (Array.isArray(e.data.patterns)) {
      urlPatterns = [...new Set([...BUILTIN_PATTERNS, ...e.data.patterns])];
    }
  });

  // ═══════════════════════════════════════════════════
  //  Fetch 拦截
  // ═══════════════════════════════════════════════════
  const { fetch: originalFetch } = window;

  window.fetch = async function (input, init) {
    const reqUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (!urlMatches(reqUrl)) {
      return originalFetch.call(window, input, init);
    }

    const response = await originalFetch.call(window, input, init);
    if (!response.ok) return response;

    const cloned = response.clone();
    const data: unknown = await cloned.json();
    const requestId = `req_${++requestCounter}`;

    notifyContent(data, reqUrl, requestId);
    const modified = await waitForModified(data, requestId);

    return new Response(JSON.stringify(modified), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };

  // ═══════════════════════════════════════════════════
  //  XMLHttpRequest 拦截
  // ═══════════════════════════════════════════════════
  const { open: originalOpen, send: originalSend } = XMLHttpRequest.prototype;

  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...args: any[]
  ) {
    const urlStr = typeof url === "string" ? url : url.href;
    (this as any).__biliFeedUrl = urlStr;
    return (originalOpen as Function).call(this, method, url, ...args);
  } as typeof XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.send = function (...args) {
    const xhr = this;
    const urlStr = (xhr as any).__biliFeedUrl;

    if (!urlMatches(urlStr)) {
      return originalSend.apply(xhr, args);
    }

    const requestId = `req_${++requestCounter}`;
    let modifiedText: string | null = null;

    Object.defineProperty(xhr, "responseText", {
      get() {
        if (modifiedText !== null) return modifiedText;
        const proto = Object.getPrototypeOf(xhr);
        return (proto as XMLHttpRequest).responseText;
      },
      configurable: true,
      enumerable: true,
    });

    xhr.addEventListener("load", function () {
      try {
        const raw = (xhr as any).responseText;
        const data = JSON.parse(raw);
        notifyContent(data, urlStr, requestId);
        waitForModified(data, requestId).then((modified) => {
          modifiedText = JSON.stringify(modified);
        });
      } catch {
        // JSON 解析失败，不拦截
      }
    });

    return originalSend.apply(xhr, args);
  };
});
