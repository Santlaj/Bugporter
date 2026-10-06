import { WIDGET_STYLES } from "./styles";

let hostElement = null;
let shadowRoot = null;

export const hostView = {
  /**
   * Mounts the host container into document.body and attaches ShadowRoot.
   * @returns {ShadowRoot}
   */
  mount() {
    if (shadowRoot) return shadowRoot;
    if (typeof document === "undefined") return null;

    let host = document.getElementById("bug-reporter-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "bug-reporter-host";
      host.setAttribute("data-html2canvas-ignore", "true");
      document.body.appendChild(host);
    } else {
      host.setAttribute("data-html2canvas-ignore", "true");
    }

    hostElement = host;
    shadowRoot = host.attachShadow({ mode: "open" });

    // Inject stylesheet
    const styleEl = document.createElement("style");
    styleEl.textContent = WIDGET_STYLES;
    shadowRoot.appendChild(styleEl);

    return shadowRoot;
  },

  getShadowRoot() {
    return shadowRoot;
  },

  getHostElement() {
    return hostElement;
  },

  unmount() {
    if (hostElement && hostElement.parentNode) {
      hostElement.parentNode.removeChild(hostElement);
    }
    hostElement = null;
    shadowRoot = null;
  },
};

export default hostView;
