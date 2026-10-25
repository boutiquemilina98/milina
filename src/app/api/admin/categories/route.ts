import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { adminListCategories } from "@/lib/data";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await adminListCategories();
    return Response.json({ categories: list });
  } catch (err) {
    return Response.json({ categories: [], error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, name, description, sortOrder, isActive } = body ?? {};
    if (!slug || !name) {
      return Response.json({ ok: false, error: "Slug et nom requis" }, { status: 400 });
    }
    const [inserted] = await db
      .insert(categories)
      .values({
        slug,
        name,
        description: description ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive !== false,
      })
      .returning();

    try {
      revalidatePath("/");
    } catch {}

    return Response.json({ ok: true, category: inserted });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body ?? {};
    if (!id) return Response.json({ ok: false, error: "ID requis" }, { status: 400 });
    const [updated] = await db
      .update(categories)
      .set(rest)
      .where(eq(categories.id, id))
      .returning();

    try {
      revalidatePath("/");
    } catch {}

    return Response.json({ ok: true, category: updated });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body ?? {};
    if (!id) return Response.json({ ok: false, error: "ID requis" }, { status: 400 });
    await db.delete(categories).where(eq(categories.id, id));

    try {
      revalidatePath("/");
    } catch {}

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}