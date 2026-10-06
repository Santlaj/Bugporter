import { NextResponse } from "next/server";
import { notificationController } from "@/controllers";

export async function POST(request) {
  try {
    const body = await request.json();
    const { reportId, projectId } = body;

    if (!reportId || !projectId) {
      return NextResponse.json(
        { error: "reportId and projectId are required" },
        { status: 400 }
      );
    }

    const results = await notificationController.dispatchAll(reportId, projectId);

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error) {
    console.error("Notification job worker error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch notifications" },
      { status: 500 }
    );
  }
}
