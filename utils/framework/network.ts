/**
 * 网络请求拦截框架
 *
 * 职责：
 *   1. 管理 NetworkInterceptor 注册
 *   2. 将 inject 脚本捕获的数据路由到对应的 interceptor
 *   3. 将修改后的数据返回 inject 脚本
 *
 * URL 匹配由 inject 脚本（硬编码的 BUILTIN_PATTERNS）在页面上下文中完成，
 * 本框架仅负责数据路由和修改。
 *
 * 通信协议（与 inject-home-block-ads.ts）：
 *   inject → content: { type: "bili-feed-response", url, requestId, payload }
 *   content → inject: { type: "bili-feed-modified", requestId, payload }
 */

import type { NetworkInterceptor } from "./index";

const registry = new Map<string, NetworkInterceptor>();

/**
 * 注册一个网络请求拦截器。
 * 需在 `setupNetworkInterceptors()` 之前调用。
 */
export function registerNetworkInterceptor(interceptor: NetworkInterceptor) {
  registry.set(interceptor.name, interceptor);
}

/** 判断 URL 是否匹配某个 interceptor 的规则 */
function matchUrl(rule: NetworkInterceptor["match"], url: string): boolean {
  if (typeof rule === "function") return rule(url);
  if (rule instanceof RegExp) return rule.test(url);
  return url.includes(rule);
}

/** 在所有注册的拦截器中查找匹配的第一个 */
function findInterceptor(url: string): NetworkInterceptor | undefined {
  for (const interceptor of registry.values()) {
    if (matchUrl(interceptor.match, url)) return interceptor;
  }
}

/**
 * 启动网络拦截。
 * 调用时机：所有 registerNetworkInterceptor() 完成之后。
 * 监听 message 事件，将 inject 脚本捕获的响应数据路由到对应 handler。
 */
export function setupNetworkInterceptors() {
  window.addEventListener("message", (e: MessageEvent) => {
    if (e.source !== window) return;
    if (e.data?.type !== "bili-feed-response") return;

    const { requestId, url, payload: originalData } = e.data;
    const interceptor = findInterceptor(url);

    let modified = originalData;
    if (interceptor) {
      try {
        modified = interceptor.modify(originalData, url);
      } catch (err) {
        console.error(`[interceptor:${interceptor.name}] modify 出错:`, err);
      }
    }

    window.postMessage(
      { type: "bili-feed-modified", requestId, payload: modified },
      "*",
    );
  });
}
