let overlayEl = null;
let highlightBoxEl = null;
let bannerEl = null;
let moveHandler = null;
let clickHandler = null;
let keyHandler = null;
let activeCallbacks = null;

function computeSelector(el) {
  if (!el || !(el instanceof Element)) return "";
  if (el.id) return `#${el.id}`;

  let path = [];
  let current = el;
  while (current && current.nodeType === Node.ELEMENT_NODE && path.length < 3) {
    let part = current.nodeName.toLowerCase();
    if (current.id) {
      part += `#${current.id}`;
      path.unshift(part);
      break;
    }
    if (current.className && typeof current.className === "string") {
      const cls = current.className.trim().split(/\s+/)[0];
      if (cls) part += `.${cls}`;
    }
    path.unshift(part);
    current = current.parentElement;
  }
  return path.join(" > ");
}

export const elementPickerView = {
  render(shadowRoot) {
    if (overlayEl || !shadowRoot) return;

    overlayEl = document.createElement("div");
    overlayEl.className = "br-picker-overlay";

    highlightBoxEl = document.createElement("div");
    highlightBoxEl.className = "br-picker-box";

    bannerEl = document.createElement("div");
    bannerEl.className = "br-picker-banner";
    bannerEl.innerHTML = `
      <span>🎯 Hover & click an element to select it</span>
      <button type="button" class="br-btn br-btn-secondary" style="padding: 4px 10px; font-size: 11px;" id="br-picker-cancel-btn">Cancel (Esc)</button>
    `;

    overlayEl.appendChild(highlightBoxEl);
    overlayEl.appendChild(bannerEl);
    shadowRoot.appendChild(overlayEl);

    const cancelBtn = bannerEl.querySelector("#br-picker-cancel-btn");
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.stop();
      if (activeCallbacks && activeCallbacks.onCancel) {
        activeCallbacks.onCancel();
      }
    });
  },

  start(callbacks = {}) {
    activeCallbacks = callbacks;
    if (!overlayEl) return;

    overlayEl.classList.add("br-active");

    moveHandler = (e) => {
      // Find element beneath cursor on host page (ignoring the picker overlay)
      overlayEl.style.pointerEvents = "none";
      const target = document.elementFromPoint(e.clientX, e.clientY);
      overlayEl.style.pointerEvents = "auto";

      if (!target || target.closest("#bug-reporter-host")) {
        highlightBoxEl.style.display = "none";
        return;
      }

      const rect = target.getBoundingClientRect();
      highlightBoxEl.style.display = "block";
      highlightBoxEl.style.top = `${rect.top}px`;
      highlightBoxEl.style.left = `${rect.left}px`;
      highlightBoxEl.style.width = `${rect.width}px`;
      highlightBoxEl.style.height = `${rect.height}px`;
    };

    clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      overlayEl.style.pointerEvents = "none";
      const target = document.elementFromPoint(e.clientX, e.clientY);
      overlayEl.style.pointerEvents = "auto";

      if (target && !target.closest("#bug-reporter-host")) {
        const rect = target.getBoundingClientRect();
        const elementData = {
          tag: target.tagName ? target.tagName.toLowerCase() : "",
          selector: computeSelector(target),
          text: (target.innerText || target.textContent || "").trim().slice(0, 80),
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        };

        this.stop();
        if (activeCallbacks && activeCallbacks.onSelect) {
          activeCallbacks.onSelect(elementData);
        }
      }
    };

    keyHandler = (e) => {
      if (e.key === "Escape") {
        this.stop();
        if (activeCallbacks && activeCallbacks.onCancel) {
          activeCallbacks.onCancel();
        }
      }
    };

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("click", clickHandler, true);
    window.addEventListener("keydown", keyHandler);
  },

  stop() {
    if (overlayEl) {
      overlayEl.classList.remove("br-active");
      highlightBoxEl.style.display = "none";
    }

    if (moveHandler) window.removeEventListener("mousemove", moveHandler);
    if (clickHandler) window.removeEventListener("click", clickHandler, true);
    if (keyHandler) window.removeEventListener("keydown", keyHandler);

    moveHandler = null;
    clickHandler = null;
    keyHandler = null;
  },
};

export default elementPickerView;
