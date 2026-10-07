import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "widget.js");
    const scriptContent = await fs.promises.readFile(filePath, "utf-8");

    return new NextResponse(scriptContent, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to serve widget.js:", error);
    return new NextResponse("// Failed to load Bug Porter widget", {
      status: 500,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
