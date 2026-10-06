let formEl = null;

export const formView = {
  /**
   * Builds the bug report form DOM element.
   * @param {object} props
   * @param {object} [props.selectedElement]
   * @param {object} props.callbacks
   * @param {function} props.callbacks.onSubmit
   * @param {function} props.callbacks.onStartPicking
   * @param {function} props.callbacks.onClearElement
   * @param {function} props.callbacks.onCancel
   * @returns {HTMLElement}
   */
  render({ selectedElement = null, callbacks = {} } = {}) {
    formEl = document.createElement("form");
    formEl.className = "br-form";

    let elementBadgeHtml = "";
    if (selectedElement) {
      elementBadgeHtml = `
        <div class="br-element-badge">
          <span>🎯 Target: <strong>&lt;${selectedElement.tag}&gt;</strong> ${selectedElement.text ? `"${selectedElement.text}"` : ""}</span>
          <button type="button" class="br-element-clear" title="Remove selection">&times;</button>
        </div>
      `;
    } else {
      elementBadgeHtml = `
        <div>
          <button type="button" class="br-picker-btn" id="br-picker-trigger">
            <span>🎯</span>
            <span>Select element on page</span>
          </button>
        </div>
      `;
    }

    formEl.innerHTML = `
      <div class="br-form-group">
        <label class="br-label" for="br-desc-input">What went wrong?</label>
        <textarea
          id="br-desc-input"
          class="br-textarea"
          placeholder="Describe the issue... (e.g. 'Checkout button doesn't do anything after clicking')"
          required
        ></textarea>
        <div class="br-meta-row">
          <span>Telemetry and screenshot will be attached automatically</span>
          <span id="br-char-count">0 / 5000</span>
        </div>
      </div>

      <div class="br-form-group" style="margin-top: 10px;">
        ${elementBadgeHtml}
      </div>

      <!-- Honeypot anti-spam field -->
      <input type="text" name="br_hp_code" class="br-hp" tabindex="-1" autocomplete="off" />

      <div class="br-footer" style="margin: 20px -20px -20px -20px;">
        <button type="button" class="br-btn br-btn-secondary" id="br-cancel-btn">Cancel</button>
        <button type="submit" class="br-btn br-btn-primary" id="br-submit-btn" disabled>Send Report</button>
      </div>
    `;

    const textarea = formEl.querySelector("#br-desc-input");
    const charCount = formEl.querySelector("#br-char-count");
    const submitBtn = formEl.querySelector("#br-submit-btn");
    const cancelBtn = formEl.querySelector("#br-cancel-btn");
    const pickerBtn = formEl.querySelector("#br-picker-trigger");
    const clearBtn = formEl.querySelector(".br-element-clear");
    const honeypotInput = formEl.querySelector(".br-hp");

    // Text input & validation
    textarea.addEventListener("input", () => {
      const val = textarea.value.trim();
      charCount.textContent = `${textarea.value.length} / 5000`;
      submitBtn.disabled = val.length === 0 || textarea.value.length > 5000;
    });

    // Form submit
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const description = textarea.value.trim();
      const honeypot = honeypotInput ? honeypotInput.value : "";
      if (callbacks.onSubmit && description) {
        callbacks.onSubmit({ description, honeypot });
      }
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        if (callbacks.onCancel) callbacks.onCancel();
      });
    }

    if (pickerBtn) {
      pickerBtn.addEventListener("click", () => {
        if (callbacks.onStartPicking) callbacks.onStartPicking();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (callbacks.onClearElement) callbacks.onClearElement();
      });
    }

    return formEl;
  },

  destroy() {
    formEl = null;
  },
};

export default formView;
