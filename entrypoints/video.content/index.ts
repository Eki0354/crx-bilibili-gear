import { optimizeComments } from "./comments";
import { optimizeLike } from "./like";
import './comments/app.scss';
import './like.scss';

export default defineContentScript({
  matches: ["*://www.bilibili.com/video/*"],
  runAt: "document_end",
  main(ctx) {
    injectScript("/inject-comments.js");
    optimizeLike();
    optimizeComments(ctx);
  },
});
