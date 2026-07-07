import { ContentScriptContext } from "#imports";
import App from "./App.vue";

export async function optimizeComments(ctx: ContentScriptContext) {
  const ui = await createIntegratedUi(ctx, {
    position: "inline",
    anchor: "body",
    onMount: (container) => {
      container.className = "bili-gear-app";

      const app = createApp(App);
      app.mount(container);
      return app;
    },
    onRemove: (app) => {
      app?.unmount();
    },
  });

  // 4. Mount the UI
  ui.mount();
}
