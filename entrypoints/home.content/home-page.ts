/**
 * 首页 HTML/DOM 修改器
 *
 * 在 `www.bilibili.com/` 页面加载完成后修改 DOM。
 * 等效于"拦截首页 HTML 文档响应后进行修改"。
 *
 * 注意：无法从扩展中拦截纯导航加载的 HTML 原始响应流，
 * 此文件在 DOM 就绪后通过 DOM API 进行修改。
 */

import type { PageModifier } from "../../utils/framework";

const homePageModifier: PageModifier = {
  name: "home-page",
  match: (url) => {
    const u = new URL(url);
    return (
      u.hostname === "www.bilibili.com" &&
      (u.pathname === "/" || u.pathname === "/index.html")
    );
  },
  modify() {
    const cards = document.querySelectorAll(".feed-card");

    Array.from(cards).forEach((card) => {
      const adNode = card.querySelector(".bili-video-card__stats--text");
      if (adNode?.textContent === "广告") {
        card.remove();
        return;
      }

      const durationNode = card.querySelector(
        ".bili-video-card__stats__duration",
      );
      if (!durationNode) {
        card.remove();
        return;
      }

      const videoNode: HTMLLinkElement | null = card.querySelector(
        ".bili-video-card__image--link",
      );
      if (!videoNode?.href.includes("bilibili.com/video/")) {
        card.remove();
        return;
      }
    });
  },
};

export default homePageModifier;
