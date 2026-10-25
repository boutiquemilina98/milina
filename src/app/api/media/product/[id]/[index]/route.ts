import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  try {
    const { id, index } = await params;
    const productId = parseInt(id, 10);
    const imgIndex = parseInt(index, 10);

    if (isNaN(productId) || isNaN(imgIndex)) {
      return new NextResponse(null, { status: 400 });
    }

    const row = await db
      .select({ images: products.images })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (row.length === 0 || !Array.isArray(row[0].images)) {
      return new NextResponse(null, { status: 404 });
    }

    const imgObj = row[0].images[imgIndex];
    if (!imgObj) {
      return new NextResponse(null, { status: 404 });
    }

    const rawUrl = typeof imgObj === "string" ? imgObj : imgObj.url;
    if (!rawUrl || typeof rawUrl !== "string") {
      return new NextResponse(null, { status: 404 });
    }

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
