/**
 * 首页拦截框架 — 类型定义 & 统一导出
 */

// ── 网络请求拦截器 ───────────────────────────
export interface NetworkInterceptor {
  /** 唯一标识，用于日志 */
  name: string;
  /**
   * URL 匹配规则。
   * - 字符串：URL 中包含该子串即匹配
   * - RegExp：正则测试
   * - 函数：自定义判断
   */
  match: string | RegExp | ((url: string) => boolean);
  /** 修改响应数据的回调。返回修改后的数据（可直接修改原对象）。 */
  modify(data: unknown, url: string): unknown;
}

// ── 页面 DOM 修改器 ──────────────────────────
export interface PageModifier {
  name: string;
  /** 页面 URL 匹配规则（同 match） */
  match: string | RegExp | ((url: string) => boolean);
  /** 修改 DOM 的回调。在页面加载完成、DOM 就绪后执行。 */
  modify(): void | Promise<void>;
}

// 重新导出
export { setupNetworkInterceptors, registerNetworkInterceptor } from "./network";
export { definePageModifier, applyPageModifiers } from "./page-mod";
