import { z } from "zod";
import { LIMITS } from "./constants";

export const environmentSchema = z.object({
  url: z.string().url().max(2048),
  route: z.string().max(1024),
  browser: z.string().max(100),
  browserVersion: z.string().max(100),
  os: z.string().max(100),
  viewportWidth: z.number().int().positive(),
  viewportHeight: z.number().int().positive(),
  devicePixelRatio: z.number().positive(),
  userAgent: z.string().max(1000).optional(),
  language: z.string().max(50).optional(),
  timezone: z.string().max(100).optional(),
  referrer: z.string().max(2048).optional(),
  timestamp: z.number().or(z.string()).optional(),
});

export const breadcrumbSchema = z.object({
  type: z.enum(["click", "navigation", "console_error", "network_error", "custom"]),
  message: z.string().max(500),
  timestamp: z.number(),
  data: z.record(z.any()).optional(),
});

export const consoleEventSchema = z.object({
  level: z.enum(["error", "warn", "info", "log"]),
  args: z.array(z.string().max(1000)).max(20),
  timestamp: z.number(),
  stack: z.string().max(5000).optional(),
});

export const networkEventSchema = z.object({
  type: z.enum(["fetch", "xhr"]),
  method: z.string().max(10),
  url: z.string().max(2048),
  status: z.number().int().optional(),
  duration: z.number().nonnegative().optional(),
  timestamp: z.number(),
  error: z.string().max(500).optional(),
});

export const elementSelectionSchema = z.object({
  tag: z.string().max(50),
  selector: z.string().max(500),
  text: z.string().max(500).optional(),
  rect: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
});

export const reportSubmitSchema = z.object({
  apiKey: z.string().min(1, "Public API key is required"),
  description: z.string().min(1, "Description is required").max(LIMITS.MAX_DESCRIPTION_BYTES),
  title: z.string().max(255).optional(),
  environment: environmentSchema,
  element: elementSelectionSchema.optional().nullable(),
  breadcrumbs: z.array(breadcrumbSchema).max(LIMITS.MAX_BREADCRUMBS).default([]),
  consoleEvents: z.array(consoleEventSchema).max(LIMITS.MAX_CONSOLE_EVENTS).default([]),
  networkEvents: z.array(networkEventSchema).max(LIMITS.MAX_NETWORK_EVENTS).default([]),
  metadata: z.record(z.any()).optional().nullable(),
  honeypot: z.string().max(0, "Honeypot field must be empty").optional().nullable(),
});

export const uploadSignatureSchema = z.object({
  reportId: z.string().cuid(),
});

export const uploadCompleteSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  format: z.string().default("webp"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive().max(LIMITS.MAX_SCREENSHOT_BYTES),
});
