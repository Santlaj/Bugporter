export const loadingScreenView = {
  render({ message = "Capturing diagnostics & submitting..." } = {}) {
    const container = document.createElement("div");
    container.className = "br-status-view";
    container.innerHTML = `
      <div class="br-spinner"></div>
      <p style="font-weight: 500; font-size: 14px; color: #f1f5f9;">${message}</p>
      <span style="font-size: 12px; color: #94a3b8;">Please wait a moment</span>
    `;
    return container;
  },
};

export default loadingScreenView;
