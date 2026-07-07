<template>
  <div v-show="visible" ref="panelRef" class="panel" :style="panelStyle">
    <div class="container" ref="containerRef">
      <UserInfo />

      <CommentContents />

      <VideoInfo />

      <ShareFooter />
    </div>

    <div class="resize-handle" @mousedown.prevent="onResizeStart"></div>

    <div class="btn copy" @click="onCopy">{{ copyText }}</div>
    <div class="btn close" @click="onClose">x</div>
  </div>
</template>

<script setup lang="ts">
import { snapdom } from "@zumer/snapdom";
import UserInfo from "./components/UserInfo.vue";
import VideoInfo from "./components/VideoInfo.vue";
import ShareFooter from "./components/ShareFooter.vue";
import CommentContents from "./components/CommentContents.vue";

const PANEL_WIDTH_KEY = "bilibili-gear-panel-width";
const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 300;
const MAX_WIDTH = 800;

const panelRef = ref<HTMLDivElement>();
const containerRef = ref<HTMLDivElement>();

const visible = ref(false);
const rootData = ref<any | null>(null);

const copyText = ref("复制");

provide("data", rootData);

const style = reactive({
  left: "0",
  top: "0",
});

// --- 宽度拖拽 ---

const panelWidth = ref(DEFAULT_WIDTH);

const panelStyle = computed(() => ({
  ...style,
  width: panelWidth.value + "px",
}));

const loadWidth = () => {
  const saved = localStorage.getItem(PANEL_WIDTH_KEY);
  if (saved) {
    const w = parseInt(saved, 10);
    if (w >= MIN_WIDTH && w <= MAX_WIDTH) {
      panelWidth.value = w;
    }
  }
};

const saveWidth = (w: number) => {
  localStorage.setItem(PANEL_WIDTH_KEY, String(w));
};

let isResizing = false;

const onResizeStart = (e: MouseEvent) => {
  e.preventDefault();
  isResizing = true;
  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", onResizeEnd);
};

const onResizeMove = (e: MouseEvent) => {
  if (!isResizing || !panelRef.value) return;
  const rect = panelRef.value.getBoundingClientRect();
  let newWidth = e.clientX - rect.left;
  newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
  panelWidth.value = Math.round(newWidth);
};

const onResizeEnd = () => {
  if (!isResizing) return;
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
  saveWidth(panelWidth.value);
  // 延迟清除标记，避免 mouseup 后紧随的 click 事件误触发 onOutsideClick
  setTimeout(() => {
    isResizing = false;
  }, 0);
};

const onClose = () => {
  if (!visible.value) return;
  visible.value = false;
};

const onCopy = async () => {
  if (!containerRef.value) return;

  copyText.value = "生成中...";
  try {
    const img = await snapdom.toPng(containerRef.value);
    const arr = img.src.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) {
      u8[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8], { type: mime });

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);

    onClose();
  } catch (error) {
    console.log(error);
  }

  copyText.value = "复制";
};

const onMessage = (event: any) => {
  if (event.source !== window) return;

  if (event.data && event.data.type === "show-share-popup") {
    const { data = null, left = 0, top = 0 } = event.data.payload || {};
    style.left = left + "px";
    style.top = top + "px";
    rootData.value = data;

    loadWidth();
    visible.value = true;
  }
};

const onScroll = () => onClose();

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== "Escape") return;
  onClose();
};

// 点击 panel 外部区域关闭
const onOutsideClick = (e: MouseEvent) => {
  if (isResizing) return;
  if (panelRef.value?.contains(e.target as Node)) return;
  onClose();
};

onMounted(() => {
  window.addEventListener("message", onMessage);
  window.addEventListener("scroll", onScroll);
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("click", onOutsideClick);
});

onUnmounted(() => {
  window.removeEventListener("message", onMessage);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("click", onOutsideClick);
});
</script>

<style lang="scss" scoped>
.panel {
  position: fixed;
  transform: translate3d(calc(-50% + 8px), -100%, 0);
  background: #fff;
  border: 1px solid #e3e5e7;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  box-sizing: border-box;
  color: #9d9d9d;
  font-size: 14px;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  width: 5px;
  height: 100%;
  cursor: col-resize;
  z-index: 1;

  &:hover {
    background: var(--brand_blue);
  }
}

.btn {
  position: absolute;
  top: 4px;
  right: 48px;
  width: 64px;
  font-size: 14px;
  border-radius: 6px;
  line-height: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: var(--brand_blue);
  color: var(--text_white);

  &.close {
    width: 32px;
    top: 4px;
    right: 8px;
    color: var(--text3);
    background-color: var(--graph_bg_thick);
    font-size: 18px;

    &:hover {
      color: #333;
    }
  }
}
</style>
