import { breadcrumbStore } from "../models/breadcrumb-store";
import { LIMITS } from "../utils/limits";

let isListening = false;
let clickListener = null;

function getCssSelector(el) {
  if (!el || !(el instanceof Element)) return "";
  if (el.id) return `#${el.id}`;

  let path = [];
  let current = el;

  while (current && current.nodeType === Node.ELEMENT_NODE && path.length < 4) {
    let selector = current.nodeName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    } else if (current.className && typeof current.className === "string") {
      const classes = current.className
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(".");
      if (classes) selector += `.${classes}`;
    }
    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(" > ");
}

function getCleanText(el) {
  if (!el) return "";
  // Never read text from masked elements or password inputs
  if (el.hasAttribute && el.hasAttribute("data-bug-mask")) return "[MASKED]";
  if (el.tagName === "INPUT" && el.type === "password") return "[PASSWORD]";

  const text = (el.innerText || el.textContent || el.value || "").trim();
  const maxLen = LIMITS.MAX_TEXT_SNIPPET_LENGTH || 80;
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

export function initClickCapture() {
  if (isListening || typeof document === "undefined") return;

  clickListener = (event) => {
    try {
      const target = event.target;
      if (!target || !(target instanceof Element)) return;

      // Ignore clicks inside the Bug Reporter widget host
      if (target.closest && target.closest("#bug-reporter-host")) return;

      const tag = target.tagName ? target.tagName.toLowerCase() : "";
      const text = getCleanText(target);
      const selector = getCssSelector(target);

      let rect = null;
      if (typeof target.getBoundingClientRect === "function") {
        const r = target.getBoundingClientRect();
        rect = {
          x: Math.round(r.x),
          y: Math.round(r.y),
          width: Math.round(r.width),
          height: Math.round(r.height),
        };
      }

      breadcrumbStore.push({
        type: "click",
        message: `Clicked <${tag}> ${text ? `"${text}"` : selector}`.trim(),
        timestamp: Date.now(),
        data: {
          tag,
          selector,
          text,
          rect,
        },
      });
    } catch {
      // Fail silently
    }
  };

  // Use capture phase to ensure clicks are registered even if propagation is stopped
  document.addEventListener("click", clickListener, true);
  isListening = true;
}

export function teardownClickCapture() {
  if (!isListening || typeof document === "undefined") return;

  if (clickListener) {
    document.removeEventListener("click", clickListener, true);
  }
  isListening = false;
}

export default {
  init: initClickCapture,
  teardown: teardownClickCapture,
};
