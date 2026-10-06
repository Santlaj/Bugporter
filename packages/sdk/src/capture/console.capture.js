import { consoleStore } from "../models/console-store";

let isInstrumented = false;
let originalError = null;
let originalWarn = null;

function safeSerializeArg(arg) {
  if (arg === null) return "null";
  if (arg === undefined) return "undefined";
  if (typeof arg === "string") return arg;
  if (typeof arg === "number" || typeof arg === "boolean") return String(arg);
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ""}`;
  }
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

export function initConsoleCapture() {
  if (isInstrumented || typeof window === "undefined" || !window.console) return;

  originalError = console.error;
  originalWarn = console.warn;

  console.error = function (...args) {
    try {
      const serialized = args.map(safeSerializeArg);
      consoleStore.push({
        level: "error",
        args: serialized.slice(0, 20),
        timestamp: Date.now(),
      });
    } catch {
      // Fail silently without interrupting host application
    }

    if (originalError) {
      return originalError.apply(this, args);
    }
  };

  console.warn = function (...args) {
    try {
      const serialized = args.map(safeSerializeArg);
      consoleStore.push({
        level: "warn",
        args: serialized.slice(0, 20),
        timestamp: Date.now(),
      });
    } catch {
      // Fail silently without interrupting host application
    }

    if (originalWarn) {
      return originalWarn.apply(this, args);
    }
  };

  isInstrumented = true;
}

export function teardownConsoleCapture() {
  if (!isInstrumented || typeof window === "undefined" || !window.console) return;

  if (originalError) console.error = originalError;
  if (originalWarn) console.warn = originalWarn;

  isInstrumented = false;
}

export default {
  init: initConsoleCapture,
  teardown: teardownConsoleCapture,
};
