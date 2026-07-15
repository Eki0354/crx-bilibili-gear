import { loopExec, queryAllDeep, observeShadowRoots } from "@/utils/dom";
import shareSvg from "~/assets/svg/share.svg?raw";

/**
 * 监听 bili-comment-renderer / bili-comment-reply-renderer 节点渲染，
 * 将 __data.reply_control.location 追加到时间戳节点文本末尾。
 *
 * B 站评论区使用 Web Component（Shadow DOM），querySelectorAll 和
 * MutationObserver 默认不穿透 Shadow DOM 边界，因此需要递归遍历 shadowRoot。
 */

const TARGET_SELECTOR = "bili-comment-renderer, bili-comment-reply-renderer";

const processedHosts = new WeakSet<Element>();
const locationAppended = new WeakSet<Element>();

// ── 定位 #pubdate 节点（穿越两层 Shadow DOM）─────────────────
function findPubdate(host: Element): Element | null {
  const sr = host.shadowRoot;
  if (!sr) return null;

  const tag = host.tagName;
  let actionBtns: Element | null = null;

  if (tag === "BILI-COMMENT-RENDERER") {
    actionBtns = sr.querySelector<Element>(
      "#body #main #footer bili-comment-action-buttons-renderer",
    );
  } else if (tag === "BILI-COMMENT-REPLY-RENDERER") {
    actionBtns = sr.querySelector<Element>(
      "#body #footer bili-comment-action-buttons-renderer",
    );
  }

  if (!actionBtns?.shadowRoot) return null;
  return actionBtns.shadowRoot.querySelector("#pubdate");
}

function handleShareClick(e: MouseEvent) {
  const shareBtn: HTMLElement = (e.target as any)?.closest?.("#share");
  if (!shareBtn) return;

  const com = (shareBtn.parentNode as any)?.host?.closest?.("#body")?.parentNode
    ?.host;
  if (!com) return;

  const rich =
    com.shadowRoot
      .querySelector("bili-rich-text")
      ?.shadowRoot?.querySelector("#contents")?.innerHTML || "";
  const pics =
    com.shadowRoot
      .querySelector("#content #pictures bili-comment-pictures-renderer")
      ?.shadowRoot?.querySelector("#content")?.innerHTML || "";

  const rect = shareBtn.getBoundingClientRect();

  window.postMessage(
    {
      type: "show-share-popup",
      payload: {
        rich,
        pics,
        data: com.__data,
        left: rect.left,
        top: rect.top,
      },
    },
    "*",
  );
}

// ── 处理单个目标元素 ────────────────────────────────────────
function processTargetElement(el: Element, source: string) {
  if (processedHosts.has(el)) return;
  processedHosts.add(el);

  const tryAppend = (): boolean => {
    const data = (el as any).__data;
    if (!data) return false;

    const pubdate = findPubdate(el);
    if (!pubdate) return false; // shadowRoot 内部尚未渲染，等下一轮

    if (locationAppended.has(pubdate)) return true;
    locationAppended.add(pubdate);

    const location = data.reply_control?.location;
    if (!!location) {
      pubdate.textContent += ` ${location}`;
      // console.log(`[inject-comment] ${host.tagName} location:`, location);
    }

    const parentNode = pubdate.parentNode;
    if (parentNode) {
      const moreNode = parentNode.querySelector("#more");

      if (moreNode) {
        const shareBtn = document.createElement("button");

        shareBtn.id = "share";
        shareBtn.style.position = "relative";
        shareBtn.style.textAlign = "left";

        shareBtn.addEventListener("click", handleShareClick);

        shareBtn.innerHTML = shareSvg;

        parentNode.insertBefore(shareBtn, moreNode);
      }
    }

    return true;
  };

  loopExec(tryAppend);
}

// ── 处理新增节点（包含 Shadow DOM 穿透）─────────────────────
function processAddedNode(node: Node, observer: MutationObserver) {
  if (!(node instanceof Element)) return;

  // 1. 节点本身是目标
  if (node.matches(TARGET_SELECTOR)) {
    processTargetElement(node, "observer");
  }

  // 2. 节点内部有 shadowRoot，建立观察
  if (node.shadowRoot) {
    observer.observe(node.shadowRoot, { childList: true, subtree: true });
    observeShadowRoots(node.shadowRoot, observer);
    queryAllDeep(node.shadowRoot, TARGET_SELECTOR).forEach((el) =>
      processTargetElement(el, "observer"),
    );
  }

  // 3. 节点后代中有目标元素（light DOM 范围）
  node
    .querySelectorAll(TARGET_SELECTOR)
    .forEach((el) => processTargetElement(el, "observer"));

  // 4. 后代中如果有带 shadowRoot 的元素，建立观察
  for (const child of node.querySelectorAll("*")) {
    if (child.shadowRoot) {
      observer.observe(child.shadowRoot, { childList: true, subtree: true });
      observeShadowRoots(child.shadowRoot, observer);
      queryAllDeep(child.shadowRoot, TARGET_SELECTOR).forEach((el) =>
        processTargetElement(el, "observer"),
      );
    }
  }
}

// 入口函数
export function optimizeComments() {
  queryAllDeep(document, TARGET_SELECTOR).forEach((el) =>
    processTargetElement(el, "initial"),
  );

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        processAddedNode(node, observer);
      }
    }
  });

  const target = document.body ?? document.documentElement;
  observer.observe(target, { childList: true, subtree: true });
  observeShadowRoots(target, observer);

  // console.log('[inject-comment] Watching (with Shadow DOM penetration)…');
}
