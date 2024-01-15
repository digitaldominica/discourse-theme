import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "header-user",

  initialize() {
    withPluginApi("1.1.0", (api) => {
        const site = api.container.lookup("service:site");
        api.reopenWidget("header", {
          didRenderWidget() {
            document
            if (this.currentUser) {
              api.addToHeaderIcons("header-user-new");
            }
          },
        });
    });
  },
};