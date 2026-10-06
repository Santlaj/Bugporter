/**
 * DOM Privacy Masking.
 * Masks sensitive elements in cloned DOM trees before canvas rendering.
 * Never modifies the live application DOM.
 */

const MASK_BLOCK = "██████████";

export function maskDomTree(clonedRoot) {
  if (!clonedRoot || typeof clonedRoot.querySelectorAll !== "function") {
    return clonedRoot;
  }

  // 1. Hide the Bug Reporter widget host in screenshot clone
  const widgetHost = clonedRoot.querySelector("#bug-reporter-host");
  if (widgetHost && widgetHost.parentNode) {
    widgetHost.parentNode.removeChild(widgetHost);
  }

  // 2. Mask password inputs
  const passwordInputs = clonedRoot.querySelectorAll('input[type="password"]');
  passwordInputs.forEach((input) => {
    input.value = "••••••••";
    input.setAttribute("value", "••••••••");
    input.style.letterSpacing = "2px";
    input.style.backgroundColor = "#1e293b";
    input.style.color = "#94a3b8";
  });

  // 3. Mask developer-annotated [data-bug-mask] elements
  const maskedElements = clonedRoot.querySelectorAll("[data-bug-mask]");
  maskedElements.forEach((el) => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.value = MASK_BLOCK;
      el.setAttribute("value", MASK_BLOCK);
    } else {
      el.textContent = MASK_BLOCK;
    }

    // Add visual obfuscation styling in clone
    el.style.backgroundColor = "#020617";
    el.style.color = "#020617";
    el.style.userSelect = "none";
    el.style.borderRadius = "4px";
  });

  // 4. Mask credit card input types or sensitive attributes if present
  const sensitiveInputs = clonedRoot.querySelectorAll('input[autocomplete*="cc-"], input[name*="card"]');
  sensitiveInputs.forEach((input) => {
    input.value = "•••• •••• •••• ••••";
    input.setAttribute("value", "•••• •••• •••• ••••");
  });

  return clonedRoot;
}

export default maskDomTree;
