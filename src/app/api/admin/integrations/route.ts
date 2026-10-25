import { NextRequest } from "next/server";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db.select().from(integrations);
    return Response.json({ integrations: list });
  } catch (err) {
    return Response.json({ integrations: [], error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, config, isActive } = body ?? {};
    if (!name) return Response.json({ ok: false, error: "Nom requis" }, { status: 400 });

    const existing = await db
      .select()
      .from(integrations)
      .where(eq(integrations.name, name))
      .limit(1);

    if (existing.length === 0) {
      const [inserted] = await db
        .insert(integrations)
        .values({ name, config: config ?? {}, isActive: !!isActive })
        .returning();
      return Response.json({ ok: true, integration: inserted });
    } else {
      const [updated] = await db
        .update(integrations)
        .set({
          config: config ?? {},
          isActive: !!isActive,
          updatedAt: new Date(),
        })
        .where(eq(integrations.name, name))
        .returning();
      return Response.json({ ok: true, integration: updated });
    }
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}