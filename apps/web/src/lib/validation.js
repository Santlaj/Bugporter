import { z } from "zod";
import { LIMITS } from "./constants";

export const environmentSchema = z.object({
  url: z.string().max(2048),
  route: z.string().max(1024).optional().default("/"),
  browser: z.string().max(100).optional().default("Unknown"),
  browserVersion: z.string().max(100).optional().default(""),
  os: z.string().max(100).optional().default("Unknown"),
  viewportWidth: z.coerce.number().optional().default(0),
  viewportHeight: z.coerce.number().optional().default(0),
  devicePixelRatio: z.coerce.number().optional().default(1),
  userAgent: z.string().max(2048).optional().nullable(),
  language: z.string().max(50).optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),
  timestamp: z.any().optional(),
});

export const breadcrumbSchema = z.object({
  type: z.string().max(50).optional().default("custom"),
  message: z.string().max(1000).optional().default(""),
  timestamp: z.any().optional(),
  data: z.any().optional(),
});

export const consoleEventSchema = z.object({
  level: z.string().max(20).optional().default("log"),
  args: z.any().optional(),
  timestamp: z.any().optional(),
  stack: z.string().max(10000).optional(),
});

export const networkEventSchema = z.object({
  type: z.string().max(20).optional().default("fetch"),
  method: z.string().max(20).optional().default("GET"),
  url: z.string().max(4096),
  status: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  timestamp: z.any().optional(),
  error: z.string().max(1000).optional(),
});

export const elementSelectionSchema = z.object({
  tag: z.string().max(50).optional().nullable(),
  selector: z.string().max(1000).optional().nullable(),
  text: z.string().max(1000).optional().nullable(),
  rect: z.any().optional().nullable(),
});

export const reportSubmitSchema = z.object({
  apiKey: z.string().min(1, "Public API key is required"),
  description: z.string().min(1, "Description is required").max(LIMITS.MAX_DESCRIPTION_BYTES),
  title: z.string().max(255).optional().nullable(),
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
