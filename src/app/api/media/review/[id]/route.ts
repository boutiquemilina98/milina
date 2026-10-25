import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CustomerReviewDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "customer_reviews"))
      .limit(1);

    if (row.length === 0 || !row[0].value) {
      return new NextResponse(null, { status: 404 });
    }

    let list: CustomerReviewDTO[] = [];
    if (typeof row[0].value === "string") {
      try {
        list = JSON.parse(row[0].value);
      } catch {}
    } else if (Array.isArray(row[0].value)) {
      list = row[0].value as CustomerReviewDTO[];
    }

    const review = list.find((r, idx) => String(r.id) === id || String(idx) === id);
    if (!review || !review.imageUrl) {
      return new NextResponse(null, { status: 404 });
    }

    const rawUrl = review.imageUrl;
    if (!rawUrl.startsWith("data:image/")) {
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        return NextResponse.redirect(rawUrl, { status: 307 });
      }
      return new NextResponse(null, { status: 404 });
    }

    const matches = rawUrl.match(/^data:([^;]+);base64,(.+)$/);
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
