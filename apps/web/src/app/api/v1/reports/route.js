import { ingestionController } from "@/controllers";
import { AppError } from "@/lib/errors";
import { handleCorsOptions, jsonWithCors } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request) {
  try {
    const origin = request.headers.get("origin") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : request.headers.get("x-real-ip") || "127.0.0.1";
    const body = await request.json();

    const result = await ingestionController.createReport(body, origin, ip);

    return jsonWithCors(result, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      console.warn("[Ingestion Error]", error.statusCode, error.message, error.details);
      return jsonWithCors(
        { error: error.message, code: error.code, details: error.details },
        { status: error.statusCode }
      );
    }

    console.error("Ingestion API unexpected error:", error);
    return jsonWithCors(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
