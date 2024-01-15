import { h } from "virtual-dom";
import { withPluginApi } from "discourse/lib/plugin-api";
import { iconNode } from "discourse-common/lib/icon-library";
import I18n from "discourse-i18n";

export default {
    name: "header-user",

  initialize() {
    withPluginApi("1.1.0", (api) => {
        const currentUser = api.container.lookup("service:site");
        api.reopenWidget("header-contents", {
            didRenderWidget() {
               if (currentUser !== null) {
               api.addToHeaderIcons("header-user-new");
              }
            },
          });



    }
)},
};