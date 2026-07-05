import { optimizeLike } from "./like";

export default defineContentScript({
  matches: ["*://www.bilibili.com/video/*"],
  runAt: "document_end",
  main() {
    injectScript("/inject-comments.js");
    optimizeLike();
  },
});
