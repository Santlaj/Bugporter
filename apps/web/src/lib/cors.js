import { NextResponse } from "next/server";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, *",
  "Access-Control-Max-Age": "86400",
};

/**
 * Handles CORS OPTIONS preflight request.
 */
export function handleCorsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Attaches CORS headers to a JSON response.
 */
export function jsonWithCors(data, init = {}) {
  const headers = new Headers(init.headers || {});
  Object.entries(corsHeaders).forEach(([k, v]) => {
    headers.set(k, v);
  });

  return NextResponse.json(data, {
    ...init,
    headers,
  });
}
