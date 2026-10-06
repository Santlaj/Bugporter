/**
 * Element Selection Model
 * Stores metadata of the element selected by user via Element Picker.
 * Pure in-memory model — contains no DOM or view dependencies.
 */
class ElementSelectionModel {
  constructor() {
    this.selectedElement = null;
  }

  set(elementData) {
    if (!elementData) {
      this.clear();
      return;
    }

    this.selectedElement = {
      tag: elementData.tag || "",
      selector: elementData.selector || "",
      text: (elementData.text || "").slice(0, 100),
      rect: elementData.rect || null,
      timestamp: Date.now(),
    };
  }

  get() {
    return this.selectedElement ? { ...this.selectedElement } : null;
  }

  clear() {
    this.selectedElement = null;
  }

  hasSelection() {
    return this.selectedElement !== null;
  }
}

export const elementSelectionModel = new ElementSelectionModel();
export default elementSelectionModel;
