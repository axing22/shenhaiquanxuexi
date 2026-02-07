import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // 通过后端代理下载图片，绕过 CORS 限制
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch image:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "image/png");
    headers.set("Content-Length", blob.size.toString());
    headers.set("Cache-Control", "public, max-age=31536000");

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Image download error:", error);
    return NextResponse.json(
      { error: error.message || "Download failed" },
      { status: 500 }
    );
  }
}
