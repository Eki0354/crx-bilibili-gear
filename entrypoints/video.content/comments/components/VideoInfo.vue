<template>
  <div class="video-info">
    <img class="cover" :src="cover" />
    <div class="right">
      <div class="title">{{ title }}</div>
      <div class="views">播放量：{{ views }}</div>
      <div class="author">
        <IconUp />
        <span class="text">{{ upName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconUp from "@/components/icons/IconUp.vue";

const cover = document
  .querySelector("meta[itemprop='image']")
  ?.getAttribute("content")
  ?.replace(/@.*$/, "@.avif");
const title = document.querySelector(
  "#viewbox_report .video-title",
)?.textContent;
const views = document.querySelector("#viewbox_report .view-text")?.textContent;
let upName = document.querySelector(
  "#mirror-vdcon .up-detail .up-name",
)?.textContent;

// 联合投稿
if (!upName) {
  const upNodes = document.querySelectorAll(
    "#mirror-vdcon .up-panel-container .membersinfo-upcard-wrap .membersinfo-upcard .staff-info",
  );

  const ups = Array.from(upNodes).map(n => n.children[0]!.textContent);

  upName = ups.join('、');
}

// 缺少占位
if (!upName) upName = '-';
</script>

<style lang="scss" scoped>
.video-info {
  margin-top: 16px;
  padding: 12px;
  background-color: #f6f7f9;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.right {
  flex: 1;
  overflow: hidden;
}

.cover {
  width: 25%;
  object-fit: cover;
  border-radius: 10px;
}

.author {
  position: relative;
  display: flex;
  align-items: center;
  color: #9499a0;

  > svg {
    width: 16px;
    height: 16px;
  }

  .text {
    margin-left: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
  }
}
</style>
