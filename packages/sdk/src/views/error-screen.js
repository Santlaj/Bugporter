export const errorScreenView = {
  render({ message = "Failed to submit report.", onRetry, onCancel } = {}) {
    const container = document.createElement("div");
    container.className = "br-status-view";
    container.innerHTML = `
      <div class="br-error-icon">⚠</div>
      <h3 style="font-size: 16px; font-weight: 600; color: #f8fafc; margin-top: 4px;">Something Went Wrong</h3>
      <p style="font-size: 13px; color: #f87171; max-width: 280px;">${message}</p>
      <div style="display: flex; gap: 10px; margin-top: 12px;">
        <button type="button" class="br-btn br-btn-secondary" id="br-err-cancel-btn">Close</button>
        <button type="button" class="br-btn br-btn-primary" id="br-err-retry-btn">Try Again</button>
      </div>
    `;

    const retryBtn = container.querySelector("#br-err-retry-btn");
    const cancelBtn = container.querySelector("#br-err-cancel-btn");

    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        if (onRetry) onRetry();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        if (onCancel) onCancel();
      });
    }

    return container;
  },
};

export default errorScreenView;
