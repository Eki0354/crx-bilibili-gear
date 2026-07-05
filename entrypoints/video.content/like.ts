import { loopExec } from "@/utils/dom";

function initLikeBtn() {
  const wrap = document.querySelector(
    "#bilibili-player .bpx-player-control-entity",
  );
  if (!wrap) return false;

  const likeBtn = document.querySelector("#arc_toolbar_report .video-like");
  if (!likeBtn) return;

  const likeSvg = likeBtn?.firstElementChild?.cloneNode(true);
  if (!likeSvg) return;

  const newLikeBtn = document.createElement("div");

  newLikeBtn.className = likeBtn?.className || "";
  newLikeBtn.style.position = "absolute";
  newLikeBtn.style.left = "16px";
  newLikeBtn.style.top = "-16px";
  newLikeBtn.style.transform = "translateY(-100%)";
  newLikeBtn.style.width = "unset";
  newLikeBtn.style.height = "unset";
  newLikeBtn.style.margin = "unset";
  newLikeBtn.style.padding = "unset";

  newLikeBtn.addEventListener("click", (e) => {
    const motoLikeBtn = document.querySelector(
      "#arc_toolbar_report .video-like",
    );
    if (!motoLikeBtn) return;

    (motoLikeBtn as HTMLDivElement).click();
  });

  newLikeBtn.appendChild(likeSvg);
  wrap.appendChild(newLikeBtn);

  const observer = new MutationObserver((mutationsList) => {
    // 遍历所有发生的变动记录
    for (let mutation of mutationsList) {
      // 检查变动类型是否为属性变动，并且是 'class' 属性
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        newLikeBtn.className = (mutation.target as HTMLElement).className;
      }
    }
  });

  // 3. 配置观察选项，并开始观察
  const config = {
    attributes: true, // 监听属性变化
    attributeFilter: ["class"], // 只监听 'class' 属性的变化
  };
  observer.observe(likeBtn, config);

  return true;
}

export const optimizeLike = () => loopExec(initLikeBtn);
