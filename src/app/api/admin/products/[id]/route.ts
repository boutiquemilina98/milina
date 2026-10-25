import { NextRequest } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = { updatedAt: new Date() };

    const fields = [
      "name",
      "description",
      "categoryId",
      "price",
      "comparePrice",
      "currency",
      "images",
      "sizes",
      "variants",
      "tags",
      "isFeatured",
      "isActive",
      "slug",
    ] as const;
    for (const f of fields) {
      const val = (body as Record<string, unknown>)[f];
      if (val !== undefined) {
        if (f === "price" || f === "comparePrice") {
          update[f] = val === null || val === "" ? null : String(val);
        } else {
          update[f] = val;
        }
      }
    }

    const [updated] = await db
      .update(products)
      .set(update)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (!updated) {
      return Response.json({ ok: false, error: "Produit non trouvé" }, { status: 404 });
    }

    try {
      revalidatePath("/");
    } catch {}

    return Response.json({ ok: true, product: updated });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();
    if (!deleted) {
      return Response.json({ ok: false, error: "Produit non trouvé" }, { status: 404 });
    }

    try {
      revalidatePath("/");
    } catch {}

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}