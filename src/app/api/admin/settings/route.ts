import { NextRequest } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getAllSettings } from "@/lib/data";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAllSettings();
    return Response.json({ settings: data });
  } catch (err) {
    return Response.json({ settings: {}, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entries = Object.entries(body ?? {}) as Array<[string, unknown]>;
    for (const [key, value] of entries) {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);
      if (existing.length === 0) {
        await db.insert(settings).values({ key, value });
      } else {
        await db
          .update(settings)
          .set({ value, updatedAt: new Date() })
          .where(eq(settings.key, key));
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/contact");
    } catch {}

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}