import { hostView } from "../views/host";
import { buttonView } from "../views/button";
import { modalView } from "../views/modal";
import { formView } from "../views/form";
import { elementPickerView } from "../views/element-picker";
import { loadingScreenView } from "../views/loading-screen";
import { successScreenView } from "../views/success-screen";
import { errorScreenView } from "../views/error-screen";
import { elementSelectionModel } from "../models/element-selection";
import { submitController } from "./submit.controller";

export const WIDGET_STATES = {
  CLOSED: "CLOSED",
  OPEN: "OPEN",
  SELECT_ELEMENT: "SELECT_ELEMENT",
  CAPTURING: "CAPTURING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};

let currentState = WIDGET_STATES.CLOSED;
let widgetConfig = {
  apiKey: "",
  endpoint: "/api/v1",
};

export const widgetController = {
  /**
   * Initializes the widget UI inside Shadow DOM.
   * @param {object} config
   */
  init(config = {}) {
    widgetConfig = { ...widgetConfig, ...config };

    if (typeof document === "undefined") return;

    // 1. Mount Host with ShadowRoot
    const shadowRoot = hostView.mount();
    if (!shadowRoot) return;

    // 2. Render Picker Overlay in Shadow DOM
    elementPickerView.render(shadowRoot);

    // 3. Render Modal Shell in Shadow DOM
    modalView.render(shadowRoot, {
      onClose: () => this.close(),
    });

    // 4. Render Trigger Button in Shadow DOM
    buttonView.render(shadowRoot, {
      onOpen: () => this.open(),
    });

    currentState = WIDGET_STATES.CLOSED;
  },

  getState() {
    return currentState;
  },

  /**
   * Opens the report modal and displays the form.
   */
  open() {
    currentState = WIDGET_STATES.OPEN;
    buttonView.hide();
    this.renderForm();
    modalView.open();
  },

  /**
   * Closes the report modal and restores the trigger button.
   */
  close() {
    currentState = WIDGET_STATES.CLOSED;
    modalView.close();
    buttonView.show();
    elementPickerView.stop();
  },

  /**
   * Renders the form view inside the modal with current state.
   */
  renderForm() {
    const selectedElement = elementSelectionModel.get();

    const formEl = formView.render({
      selectedElement,
      callbacks: {
        onSubmit: ({ description, honeypot }) => this.handleSubmit(description, honeypot),
        onStartPicking: () => this.startElementSelection(),
        onClearElement: () => {
          elementSelectionModel.clear();
          this.renderForm();
        },
        onCancel: () => this.close(),
      },
    });

    modalView.setBody(formEl);
  },

  /**
   * Launches the element picker overlay mode.
   */
  startElementSelection() {
    currentState = WIDGET_STATES.SELECT_ELEMENT;
    modalView.close(); // Temporarily hide modal while picking

    elementPickerView.start({
      onSelect: (elementData) => {
        elementSelectionModel.set(elementData);
        currentState = WIDGET_STATES.OPEN;
        this.renderForm();
        modalView.open();
      },
      onCancel: () => {
        currentState = WIDGET_STATES.OPEN;
        this.renderForm();
        modalView.open();
      },
    });
  },

  /**
   * Submits the bug report.
   */
  async handleSubmit(description, honeypot = "") {
    currentState = WIDGET_STATES.CAPTURING;

    // Show loading spinner
    const loadingEl = loadingScreenView.render({
      message: "Sending bug report & diagnostics...",
    });
    modalView.setBody(loadingEl);

    try {
      const result = await submitController.submit({
        apiKey: widgetConfig.apiKey,
        endpoint: widgetConfig.endpoint,
        description,
        honeypot,
        onProgress: (statusText) => {
          const updatedLoadingEl = loadingScreenView.render({ message: statusText });
          modalView.setBody(updatedLoadingEl);
        },
      });

      currentState = WIDGET_STATES.SUCCESS;
      elementSelectionModel.clear();

      const successEl = successScreenView.render({
        reportId: result.reportId,
        onDone: () => this.close(),
      });
      modalView.setBody(successEl);
    } catch (err) {
      currentState = WIDGET_STATES.ERROR;

      const errorEl = errorScreenView.render({
        message: err.message || "Failed to submit report. Please check your connection.",
        onRetry: () => this.handleSubmit(description, honeypot),
        onCancel: () => this.close(),
      });
      modalView.setBody(errorEl);
    }
  },
};

export default widgetController;
