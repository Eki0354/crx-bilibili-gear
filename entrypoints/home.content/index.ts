import {
  registerNetworkInterceptor,
  setupNetworkInterceptors,
} from "../../utils/framework";
import { definePageModifier, applyPageModifiers } from "../../utils/framework";
import feedRcmdInterceptor from "./feed-rcmd";
import homePageModifier from "./home-page";

export default defineContentScript({
  matches: ["*://www.bilibili.com/", "*://www.bilibili.com/index.html"],
  runAt: "document_start",
  async main() {
    // ── 检测 /index.html 并重定向到 / ────────────────
    if (location.pathname === "/index.html") {
      location.replace("/");
      return; // 重定向后不再执行后续逻辑
    }

    await injectScript("/inject-home-block-ads.js");

    // ── 注册网络请求拦截器 ──────────────────────────
    registerNetworkInterceptor(feedRcmdInterceptor);

    // ── 注册页面 DOM 修改器 ─────────────────────────
    definePageModifier(homePageModifier);

    // ── 启动框架 ────────────────────────────────────
    setupNetworkInterceptors();
    applyPageModifiers();
  },
});
