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

type AdBlockRule = {
  selector: string;
  rule?: (node: Element | null) => boolean;
};

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
    const rules: AdBlockRule[] = [
      {
        selector: ".bili-video-card__stats--text",
        rule: (node) => node?.textContent === "广告",
      },
      {
        selector: ".bili-video-card__info--date",
      },
      {
        selector: ".bili-video-card__stats__duration",
      },
      {
        selector: ".bili-video-card__image--link",
        rule: (node) =>
          !(node as HTMLLinkElement | null)?.href.includes(
            "bilibili.com/video/",
          ),
      },
    ];

    const blockNodeAds = (node: Element) =>
      rules.some((item) => {
        const target = node.querySelector(item.selector);
        const isBlock = item.rule ? item.rule(target) : !target;
        if (!isBlock) return false;

        // 阿b会根据卡片顺序重新计算样式和描述信息，需要等待计算完成后移除，否则会渲染错位
        setTimeout(() => node.remove(), 100);
        return true;
      });

    const cards = document.querySelectorAll(".feed-card");
    Array.from(cards).forEach(blockNodeAds);
  },
};

export default homePageModifier;
