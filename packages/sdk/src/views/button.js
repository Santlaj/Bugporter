let buttonEl = null;
let clickCallback = null;

export const buttonView = {
  /**
   * Renders the floating trigger button into the ShadowRoot.
   * @param {ShadowRoot} shadowRoot
   * @param {object} callbacks
   * @param {function} callbacks.onOpen
   */
  render(shadowRoot, { onOpen } = {}) {
    if (buttonEl || !shadowRoot) return buttonEl;

    clickCallback = onOpen;

    buttonEl = document.createElement("button");
    buttonEl.className = "br-trigger-btn";
    buttonEl.setAttribute("aria-label", "Report a bug");
    buttonEl.title = "Report a bug";
    buttonEl.innerHTML = "🐞";

    buttonEl.addEventListener("click", (e) => {
      e.stopPropagation();
      if (clickCallback) {
        clickCallback();
      }
    });

    shadowRoot.appendChild(buttonEl);
    return buttonEl;
  },

  show() {
    if (buttonEl) buttonEl.classList.remove("br-hidden");
  },

  hide() {
    if (buttonEl) buttonEl.classList.add("br-hidden");
  },

  destroy() {
    if (buttonEl && buttonEl.parentNode) {
      buttonEl.parentNode.removeChild(buttonEl);
    }
    buttonEl = null;
    clickCallback = null;
  },
};

export default buttonView;
