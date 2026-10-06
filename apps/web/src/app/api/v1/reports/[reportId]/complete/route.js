import { uploadController } from "@/controllers";
import { uploadCompleteSchema } from "@/lib/validation";
import { AppError, ValidationError } from "@/lib/errors";
import { handleCorsOptions, jsonWithCors } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request, { params }) {
  try {
    const { reportId } = params;
    const body = await request.json();

    const parseResult = uploadCompleteSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid screenshot upload completion payload", parseResult.error.format());
    }

    const screenshot = await uploadController.completeUpload(reportId, parseResult.data);

    return jsonWithCors({ success: true, screenshot }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return jsonWithCors(
        { error: error.message, code: error.code, details: error.details },
        { status: error.statusCode }
      );
    }

    console.error("Upload completion error:", error);
    return jsonWithCors(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
