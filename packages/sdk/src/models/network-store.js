import { LIMITS } from "../utils/limits";

/**
 * Bounded store for intercepted network requests (fetch/XHR, max 100).
 */
class NetworkStore {
  constructor(capacity = LIMITS.MAX_NETWORK) {
    this.capacity = capacity;
    this.requests = [];
  }

  push(request) {
    if (!request) return;

    if (this.requests.length >= this.capacity) {
      this.requests.shift(); // Evict oldest
    }

    this.requests.push({
      ...request,
      timestamp: request.timestamp || Date.now(),
    });
  }

  getAll() {
    return [...this.requests];
  }

  clear() {
    this.requests = [];
  }

  get length() {
    return this.requests.length;
  }
}

export const networkStore = new NetworkStore();
export default networkStore;
