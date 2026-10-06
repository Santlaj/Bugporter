import { LIMITS } from "../utils/limits";

/**
 * Bounded store for uncaught window errors and unhandled rejections (max 50).
 */
class ErrorStore {
  constructor(capacity = LIMITS.MAX_ERRORS) {
    this.capacity = capacity;
    this.errors = [];
  }

  push(errorItem) {
    if (!errorItem) return;

    if (this.errors.length >= this.capacity) {
      this.errors.shift(); // Evict oldest
    }

    this.errors.push({
      ...errorItem,
      timestamp: errorItem.timestamp || Date.now(),
    });
  }

  getAll() {
    return [...this.errors];
  }

  clear() {
    this.errors = [];
  }

  get length() {
    return this.errors.length;
  }
}

export const errorStore = new ErrorStore();
export default errorStore;
