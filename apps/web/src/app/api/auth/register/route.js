import { NextResponse } from "next/server";
import { authController } from "@/controllers";
import { AppError } from "@/lib/errors";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await authController.register(body);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
