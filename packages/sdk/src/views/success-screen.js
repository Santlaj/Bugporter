export const successScreenView = {
  render({ reportId = "", onDone } = {}) {
    const container = document.createElement("div");
    container.className = "br-status-view";
    container.innerHTML = `
      <div class="br-success-icon">✓</div>
      <h3 style="font-size: 16px; font-weight: 600; color: #f8fafc; margin-top: 4px;">Report Submitted!</h3>
      <p style="font-size: 13px; color: #94a3b8; max-width: 280px;">
        Thank you for helping us improve. Diagnostic context and events have been captured.
      </p>
      ${reportId ? `<span style="font-size: 11px; color: #64748b; font-family: monospace;">ID: ${reportId}</span>` : ""}
      <button type="button" class="br-btn br-btn-primary" id="br-success-close-btn" style="margin-top: 12px; width: 120px;">Done</button>
    `;

    const doneBtn = container.querySelector("#br-success-close-btn");
    doneBtn.addEventListener("click", () => {
      if (onDone) onDone();
    });

    return container;
  },
};

export default successScreenView;
