import { withPluginApi } from "discourse/lib/plugin-api";
import { findRawTemplate } from "discourse-common/lib/raw-templates";
import { htmlSafe } from "@ember/template";
import { schedule } from "@ember/runloop";

export default {
  name: "itspace",
  initialize() {
    withPluginApi("0.8.7", (api) => {
      // Use same template on Desktop and MobileView
      api.modifyClass("component:topic-list-item", {
        pluginId: "its-template",

        renderTopicListItem() {
          const categoryId = this.get("topic.categoryId");
          const tags = this.get("topic.tags");
          const isFeatured = tags && tags.includes("featured");

          const isDiscoveryPage = window.location.pathname.includes("/discovery");

          let templateName = "list/custom-topic-list-item";

          if (isDiscoveryPage && categoryId === 23 && isFeatured) {
            templateName = "list/news-topic-list-item";
          }

          const template = findRawTemplate(templateName);

          if (template) {
            this.set(
              "topicListItemContents",
              htmlSafe(template(this))
            );
            schedule("afterRender", () => {
              if (this.isDestroyed || this.isDestroying) {
                return;
              }
              if (this.selected && this.selected.includes(this.topic)) {
                this.element.querySelector("input.bulk-select").checked = true;
                this.element.querySelector(".bulk-select.topic-list-data label").classList.add("selected");
              }             
              if (this._shouldFocusLastVisited()) {
                const title = this._titleElement();
                if (title) {
                  title.addEventListener("focus", this._onTitleFocus);
                  title.addEventListener("blur", this._onTitleBlur);
                }
              }
            });            
          }
        },
      });

      api.modifyClass("component:topic-list", {
        pluginId: "toggle-bulk",

        click(e) {
          const onClick = (sel, callback) => {
            let target = e.target.closest(sel);

            if (target) {
              callback(target);
            }
          };
          this._super(...arguments);
          onClick("button.bulk-select", () => {
            document.body.classList.toggle("bulk-select-enabled");
          });
        },
      });

      api.onPageChange((url, title) => {
        const bodyHasBulkSelectClass = document.body.classList.contains("bulk-select-enabled");
        const currentUser = api.getCurrentUser();
        
        if ((url !== "/new" && 
            bodyHasBulkSelectClass && 
            currentUser && !currentUser.staff) && 
            (url !== "/unread" && 
            bodyHasBulkSelectClass && 
            currentUser && !currentUser.staff)) 
        {
          document.body.classList.add("bulk-still-active");
        } else {
          document.body.classList.remove("bulk-still-active");
        }
      });
      

    });
  },
};
