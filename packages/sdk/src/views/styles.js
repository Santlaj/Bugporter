/**
 * Shadow DOM Widget Styles.
 * Complete styling enclosed inside Shadow Root.
 * Immune to external page stylesheet leakage.
 */
export const WIDGET_STYLES = `
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #f1f5f9;
  -webkit-font-smoothing: antialiased;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Floating Trigger Button */
.br-trigger-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2147483640;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
  user-select: none;
  touch-action: none;
}

.br-trigger-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.6), 0 10px 12px -6px rgba(0, 0, 0, 0.4);
}

.br-trigger-btn:active {
  transform: scale(0.95);
}

.br-trigger-btn.br-hidden {
  display: none !important;
}

/* Modal Backdrop */
.br-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2147483641;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.br-backdrop.br-open {
  opacity: 1;
  pointer-events: auto;
}

/* Modal Container */
.br-modal {
  width: 100%;
  max-width: 440px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  transform: scale(0.95) translateY(10px);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.br-backdrop.br-open .br-modal {
  transform: scale(1) translateY(0);
}

/* Modal Header */
.br-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #1e293b;
  background: #1e293b;
}

.br-title {
  font-size: 15px;
  font-weight: 600;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
}

.br-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  transition: color 0.15s, background 0.15s;
}

.br-close-btn:hover {
  color: #f8fafc;
  background: #334155;
}

/* Modal Body */
.br-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Form Styles */
.br-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.br-label {
  font-size: 13px;
  font-weight: 500;
  color: #cbd5e1;
}

.br-textarea {
  width: 100%;
  min-height: 100px;
  max-height: 200px;
  padding: 10px 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.br-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

.br-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
}

/* Element Selected Badge */
.br-element-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: #a5b4fc;
}

.br-element-clear {
  background: none;
  border: none;
  color: #a5b4fc;
  cursor: pointer;
  font-size: 14px;
  margin-left: 8px;
}

/* Picker trigger button inside modal */
.br-picker-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.br-picker-btn:hover {
  background: #334155;
  border-color: #475569;
}

/* Modal Actions Footer */
.br-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #1e293b;
  background: #131c31;
}

.br-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.br-btn-secondary {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
}

.br-btn-secondary:hover {
  background: #334155;
  color: #f8fafc;
}

.br-btn-primary {
  background: #6366f1;
  color: #ffffff;
}

.br-btn-primary:hover {
  background: #4f46e5;
}

.br-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Honeypot field (hidden from view) */
.br-hp {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  height: 0;
  width: 0;
  margin: -1px;
}

/* Element Picker Overlay outside modal */
.br-picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483645;
  cursor: crosshair;
  background: rgba(15, 23, 42, 0.1);
  display: none;
}

.br-picker-overlay.br-active {
  display: block;
}

.br-picker-box {
  position: absolute;
  pointer-events: none;
  border: 2px solid #6366f1;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 4px;
  transition: all 0.05s ease;
  display: none;
}

.br-picker-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  border: 1px solid #6366f1;
  color: #f8fafc;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  z-index: 2147483646;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Status Screens (Loading / Success / Error) */
.br-status-view {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.br-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #334155;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: br-spin 0.8s linear infinite;
}

@keyframes br-spin {
  to { transform: rotate(360deg); }
}

.br-success-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.br-error-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
`;
