import { uploadController } from "@/controllers";
import { AppError } from "@/lib/errors";
import { handleCorsOptions, jsonWithCors } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request, { params }) {
  try {
    const { reportId } = params;
    const signatureData = await uploadController.generateSignature(reportId);

    return jsonWithCors(signatureData, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return jsonWithCors(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error("Upload signature error:", error);
    return jsonWithCors(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
