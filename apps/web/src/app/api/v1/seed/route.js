import { NextResponse } from "next/server";
import { projectModel } from "@/models";

export async function POST() {
  // Purge any demo project from database
  const count = await projectModel.deleteDemoProjects();
  return NextResponse.json({
    success: true,
    message: `Demo project purged (${count} removed). Ready for production projects.`,
  });
}

export async function GET() {
  const count = await projectModel.deleteDemoProjects();
  return NextResponse.json({
    success: true,
    message: `Demo project purged (${count} removed).`,
  });
}
