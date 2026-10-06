import { breadcrumbStore } from "../models/breadcrumb-store";

let isInstrumented = false;
let originalPushState = null;
let originalReplaceState = null;
let popstateHandler = null;
let hashchangeHandler = null;
let lastUrl = "";

function getCurrentUrl() {
  if (typeof window === "undefined") return "";
  return window.location.pathname + window.location.search + window.location.hash;
}

function recordNavigation(fromUrl, toUrl, trigger) {
  if (fromUrl === toUrl) return;

  breadcrumbStore.push({
    type: "navigation",
    message: `Navigated to ${toUrl} (${trigger})`,
    timestamp: Date.now(),
    data: {
      from: fromUrl,
      to: toUrl,
      trigger,
    },
  });

  lastUrl = toUrl;
}

export function initNavigationCapture() {
  if (isInstrumented || typeof window === "undefined" || !window.history) return;

  lastUrl = getCurrentUrl();

  originalPushState = window.history.pushState;
  originalReplaceState = window.history.replaceState;

  window.history.pushState = function (...args) {
    const fromUrl = getCurrentUrl();
    const result = originalPushState.apply(this, args);
    try {
      const toUrl = getCurrentUrl();
      recordNavigation(fromUrl, toUrl, "pushState");
    } catch {
      // Fail silently
    }
    return result;
  };

  window.history.replaceState = function (...args) {
    const fromUrl = getCurrentUrl();
    const result = originalReplaceState.apply(this, args);
    try {
      const toUrl = getCurrentUrl();
      recordNavigation(fromUrl, toUrl, "replaceState");
    } catch {
      // Fail silently
    }
    return result;
  };

  popstateHandler = () => {
    try {
      const toUrl = getCurrentUrl();
      recordNavigation(lastUrl, toUrl, "popstate");
    } catch {
      // Fail silently
    }
  };

  hashchangeHandler = () => {
    try {
      const toUrl = getCurrentUrl();
      recordNavigation(lastUrl, toUrl, "hashchange");
    } catch {
      // Fail silently
    }
  };

  window.addEventListener("popstate", popstateHandler);
  window.addEventListener("hashchange", hashchangeHandler);

  isInstrumented = true;
}

export function teardownNavigationCapture() {
  if (!isInstrumented || typeof window === "undefined") return;

  if (originalPushState) window.history.pushState = originalPushState;
  if (originalReplaceState) window.history.replaceState = originalReplaceState;
  if (popstateHandler) window.removeEventListener("popstate", popstateHandler);
  if (hashchangeHandler) window.removeEventListener("hashchange", hashchangeHandler);

  isInstrumented = false;
}

export default {
  init: initNavigationCapture,
  teardown: teardownNavigationCapture,
};
