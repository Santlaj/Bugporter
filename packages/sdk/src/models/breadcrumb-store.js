import { LIMITS } from "../utils/limits";

/**
 * Ring buffer for breadcrumbs (max 40).
 * Stores recent user actions and system events.
 */
class BreadcrumbStore {
  constructor(capacity = LIMITS.MAX_BREADCRUMBS) {
    this.capacity = capacity;
    this.buffer = [];
  }

  push(breadcrumb) {
    if (!breadcrumb) return;

    if (this.buffer.length >= this.capacity) {
      this.buffer.shift(); // Evict oldest
    }

    this.buffer.push({
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
    });
  }

  getAll() {
    return [...this.buffer];
  }

  clear() {
    this.buffer = [];
  }

  get length() {
    return this.buffer.length;
  }
}

export const breadcrumbStore = new BreadcrumbStore();
export default breadcrumbStore;
