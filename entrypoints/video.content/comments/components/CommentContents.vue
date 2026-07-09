<template>
  <div class="comment-contents">
    <div class="contents" v-html="contentHTML"></div>

    <div class="pictures">
      <div class="content" v-html="picsHTML"></div>
    </div>
  </div>

  <div>获得了{{ like }}个赞</div>
</template>

<script setup lang="ts">
const contentHTML = ref("");
const picsHTML = ref("");

const data = inject<any>("data", null);

const like = computed(() => data.value?.like || 0);

const onMessage = (event: any) => {
  if (event.source !== window) return;

  if (event.data && event.data.type === "show-share-popup") {
    const { rich = "", pics = "" } = event.data.payload || {};

    contentHTML.value = rich;
    picsHTML.value = pics;
  }
};

onMounted(() => {
  window.addEventListener("message", onMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", onMessage);
});
</script>

<style lang="scss" scoped>
.comment-contents {
  margin-top: 8px;
  font-size: var(--bili-comments-font-size-content);
  line-height: var(--bili-comments-line-height-content);
  color: var(--text1);

  .contents {
    --bili-rich-text-display: block;
    --bili-rich-text-white-space: pre-line;
    --bili-rich-text-word-break: break-word;
    --bili-rich-text-icon-vertical-align: sub;
    --bili-rich-text-link-color: var(--text_link, #008ac5);
    --bili-rich-text-link-color-hover: var(--brand_blue, #00aeec);
    --icon-vertical-align: var(--bili-rich-text-icon-vertical-align);
    color: var(--bili-rich-text-color, var(--text1, #18191c));
    font-size: var(--bili-rich-text-font-size, 15px);
    line-height: var(--bili-rich-text-line-height, 21px);
    font-family: var(--bili-font-family);

    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
    display: var(--bili-rich-text-display);
    white-space: var(--bili-rich-text-white-space);
    word-break: var(--bili-rich-text-word-break);
    -webkit-font-smoothing: antialiased;

    :deep(a) {
      color: var(--bili-rich-text-link-color);
      text-decoration: none;
      background-color: transparent;
      cursor: pointer;

      &:hover {
        color: var(--bili-rich-text-link-color-hover);
      }

      bili-icon {
        vertical-align: var(--bili-rich-text-icon-vertical-align);
      }
    }

    :deep(img, a i) {
      display: inline-block;
      width: 1.2em;
      height: 1.2em;
      vertical-align: var(--bili-rich-text-icon-vertical-align);
    }
  }

  .pictures {
    display: block;
    width: 100%;
    margin-top: 8px;
    margin-bottom: 8px;

    .content {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      max-width: 364px;

      :deep(img) {
        display: block;
        border-radius: var(--bili-comment-picutres-border-radius, 6px);
        cursor: zoom-in;
      }
    }
  }
}
</style>
