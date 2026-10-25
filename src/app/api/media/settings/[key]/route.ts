import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (row.length === 0 || !row[0].value) {
      return new NextResponse(null, { status: 404 });
    }

    const rawValue = String(row[0].value);
    if (!rawValue.startsWith("data:image/")) {
      // If it's a regular URL, redirect to it
      if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
        return NextResponse.redirect(rawValue, { status: 307 });
      }
      return new NextResponse(null, { status: 404 });
    }

    // Parse data URL: data:image/png;base64,...
    const matches = rawValue.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return new NextResponse(null, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
