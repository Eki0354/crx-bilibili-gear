export default defineContentScript({
  matches: ["*://www.bilibili.com/*"],
  runAt: "document_end",
  main() {
    injectScript("/inject-account.js");
  },
});
