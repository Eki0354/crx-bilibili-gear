/**
 * 页面 DOM 修改框架
 *
 * 由于无法在扩展中直接拦截 HTML 文档的原始响应体，
 * 等价的做法是在 DOM 就绪后通过 DOM API 进行修改。
 *
 * 职责：
 *   1. 管理 PageModifier 注册
 *   2. 在适当时机（document_end）执行匹配当前 URL 的 modifier
 */

import type { PageModifier } from "./index";
import { loopExec } from "@/utils/dom";

const modifiers: PageModifier[] = [];

/**
 * 注册一个页面 DOM 修改器。
 * 需在 `applyPageModifiers()` 之前调用。
 */
export function definePageModifier(modifier: PageModifier) {
  modifiers.push(modifier);
}

/** 判断当前页面 URL 是否匹配 */
function matchUrl(rule: PageModifier["match"]): boolean {
  const url = location.href;
  if (typeof rule === "function") return rule(url);
  if (rule instanceof RegExp) return rule.test(url);
  return url.includes(rule);
}

/**
 * 应用所有匹配当前 URL 的页面修改器。
 * 在 `document_end` 之后调用即可。
 *
 * 每个 modifier 的 modify() 通过 loopExec 执行，
 * 支持轮询等待目标 DOM 节点出现后执行。
 */
export function applyPageModifiers() {
  for (const m of modifiers) {
    if (matchUrl(m.match)) {
      loopExec(() => {
        const result = m.modify();
        // 如果是 Promise，同步返回 false（loopExec 会继续轮询并不影响）
        if (result instanceof Promise) {
          result.catch((err) =>
            console.error(`[page-mod:${m.name}] 执行出错:`, err),
          );
          return true; // 标记完成，不阻塞后续轮询
        }
        return true;
      });
    }
  }
}
