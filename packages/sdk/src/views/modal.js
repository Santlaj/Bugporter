let backdropEl = null;
let modalEl = null;
let bodyEl = null;
let closeCallback = null;

export const modalView = {
  /**
   * Renders the modal shell into the ShadowRoot.
   * @param {ShadowRoot} shadowRoot
   * @param {object} callbacks
   * @param {function} callbacks.onClose
   */
  render(shadowRoot, { onClose } = {}) {
    if (backdropEl || !shadowRoot) return backdropEl;

    closeCallback = onClose;

    backdropEl = document.createElement("div");
    backdropEl.className = "br-backdrop";

    modalEl = document.createElement("div");
    modalEl.className = "br-modal";
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");

    // Header
    const header = document.createElement("div");
    header.className = "br-header";
    header.innerHTML = `
      <div class="br-title">
        <span>🐞</span>
        <span>Report an Issue</span>
      </div>
      <button class="br-close-btn" aria-label="Close modal">&times;</button>
    `;

    // Body
    bodyEl = document.createElement("div");
    bodyEl.className = "br-body";

    modalEl.appendChild(header);
    modalEl.appendChild(bodyEl);
    backdropEl.appendChild(modalEl);

    // Event listeners
    const closeBtn = header.querySelector(".br-close-btn");
    closeBtn.addEventListener("click", () => {
      if (closeCallback) closeCallback();
    });

    backdropEl.addEventListener("click", (e) => {
      if (e.target === backdropEl) {
        if (closeCallback) closeCallback();
      }
    });

    shadowRoot.appendChild(backdropEl);
    return backdropEl;
  },

  open() {
    if (backdropEl) {
      backdropEl.classList.add("br-open");
    }
  },

  close() {
    if (backdropEl) {
      backdropEl.classList.remove("br-open");
    }
  },

  setBody(element) {
    if (!bodyEl) return;
    bodyEl.innerHTML = "";
    if (element) {
      bodyEl.appendChild(element);
    }
  },

  isOpen() {
    return backdropEl ? backdropEl.classList.contains("br-open") : false;
  },

  destroy() {
    if (backdropEl && backdropEl.parentNode) {
      backdropEl.parentNode.removeChild(backdropEl);
    }
    backdropEl = null;
    modalEl = null;
    bodyEl = null;
    closeCallback = null;
  },
};

export default modalView;
