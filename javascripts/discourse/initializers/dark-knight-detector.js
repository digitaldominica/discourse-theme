import { withPluginApi } from "discourse/lib/plugin-api";


export default {
    name: "kodular-dark-knight-detector",
    initialize() {
      withPluginApi("0.10.1", () => {
        let themeColor = document.querySelector('meta[name="theme-color"]').content
        if(themeColor === "#15202b") {
            document.body.classList.add("it-space")
        }
      });
    },
  };