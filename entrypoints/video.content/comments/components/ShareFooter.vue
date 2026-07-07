<script setup lang="ts">
import IconBilibili from "@/components/icons/IconBilibili.vue";
import dayjs from "dayjs";

const qrSrc = ref("");

const onMessage = (event: any) => {
  if (event.source !== window) return;

  if (event.data && event.data.type === "show-share-popup") {
    const qrCanvas: HTMLCanvasElement | null = document.querySelector(
      ".van-popover .van-qrcode > canvas",
    );
    if (qrCanvas) {
      qrSrc.value = qrCanvas.toDataURL("image/png");
    }
  }
};

onMounted(() => {
  window.addEventListener("message", onMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", onMessage);
});
</script>

<template>
  <div class="share-footer">
    <IconBilibili class="icon-bilibili" />

    <div class="middle">
      <div class="section">保存图片至相册</div>
      <div class="section">长按扫码查看视频</div>
      <span>分享于{{ dayjs().format('YYYY/MM/DD') }}</span>
    </div>
    <img class="qrcode" :src="qrSrc" />
  </div>
</template>

<style lang="scss" scoped>
.share-footer {
  margin-top: 16px;
  padding: 12px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  > .icon-bilibili {
    width: 25%;
    color: #fc689a;
  }
}

.middle {
  flex: 1;
  text-align: right;

  .section {
    color: #141414;
  }
}

.qrcode {
  width: 80px;
  aspect-ratio: 1/1;
}
</style>
