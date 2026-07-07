import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  webExt: {
    disabled: true,
  },
  manifest: {
    permissions: ["clipboardWrite"],
    web_accessible_resources: [
      {
        resources: ["inject-comments.js"],
        matches: ["*://www.bilibili.com/*"],
      },
    ],
  },
  vite: () => ({
    esbuild: {
      drop: ["console", "debugger"],
    },
  }),
});
