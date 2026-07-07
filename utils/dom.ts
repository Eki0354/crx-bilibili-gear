/**
 * 轮询函数，回调函数中包含dom处理逻辑且有延迟加载问题时使用。
 * @param callback 回调函数
 * @returns true | false
 */
export function loopExec(callback: () => boolean | undefined) {
  if (callback()) return;

  // 每 200ms 轮询，直到内部节点就绪
  const intervalId = setInterval(() => {
    if (callback()) clearInterval(intervalId);
  }, 200);

  // 30 秒后安全清理，防止内存泄漏
  setTimeout(() => clearInterval(intervalId), 30_000);
}

// ── 递归遍历 Shadow DOM 查找目标元素 ──────────────────────────
export function queryAllDeep(root: ParentNode, selector: string): Element[] {
  const results: Element[] = [];
  results.push(...root.querySelectorAll(selector));
  for (const el of root.querySelectorAll("*")) {
    const shadow = (el as Element).shadowRoot;
    if (shadow) results.push(...queryAllDeep(shadow, selector));
  }
  return results;
}

// ── 递归建立 Shadow DOM 的 MutationObserver ──────────────────
export function observeShadowRoots(root: Node, observer: MutationObserver) {
  const walk = (node: Node) => {
    if (node instanceof Element && node.shadowRoot) {
      observer.observe(node.shadowRoot, { childList: true, subtree: true });
      walk(node.shadowRoot);
    }
    if ("querySelectorAll" in node) {
      for (const child of (node as ParentNode).querySelectorAll("*")) {
        if (child.shadowRoot) {
          observer.observe(child.shadowRoot, {
            childList: true,
            subtree: true,
          });
          walk(child.shadowRoot);
        }
      }
    }
  };
  walk(root);
}
