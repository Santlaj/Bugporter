import { LIMITS } from "../utils/limits";

/**
 * Bounded store for intercepted console logs/errors/warns (max 100).
 */
class ConsoleStore {
  constructor(capacity = LIMITS.MAX_CONSOLE) {
    this.capacity = capacity;
    this.entries = [];
  }

  push(entry) {
    if (!entry) return;

    if (this.entries.length >= this.capacity) {
      this.entries.shift(); // Evict oldest
    }

    this.entries.push({
      ...entry,
      timestamp: entry.timestamp || Date.now(),
    });
  }

  getAll() {
    return [...this.entries];
  }

  clear() {
    this.entries = [];
  }

  get length() {
    return this.entries.length;
  }
}

export const consoleStore = new ConsoleStore();
export default consoleStore;
