import { NextRequest } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

function cleanSlug(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return Response.json({ ok: false, error: "ID invalide" }, { status: 400 });
    }
    const [row] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!row) {
      return Response.json({ ok: false, error: "Produit non trouvé" }, { status: 404 });
    }
    return Response.json({ ok: true, product: row });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

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

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id, 10)))
      .limit(1);

    const existingImgs = Array.isArray(existing?.images) ? existing.images : [];

    for (const f of fields) {
      const val = (body as Record<string, unknown>)[f];
      if (val !== undefined) {
        if (f === "price" || f === "comparePrice") {
          update[f] = val === null || val === "" ? null : String(val);
        } else if (f === "slug" && typeof val === "string") {
          update[f] = cleanSlug(val);
        } else if (f === "images" && Array.isArray(val)) {
          // Prevent proxy URLs (/api/media/product/:id/:index) from overwriting actual stored image data
          update[f] = val.map((img: any) => {
            const rawUrl = typeof img === "string" ? img.trim() : (img?.url ? String(img.url).trim() : "");
            const color = typeof img === "object" && img?.color ? img.color : "";
            if (rawUrl) {
              const mediaMatch = rawUrl.match(/^\/api\/media\/product\/\d+\/(\d+)$/);
              if (mediaMatch) {
                const origIndex = parseInt(mediaMatch[1], 10);
                const origImg = existingImgs[origIndex];
                const origUrl = typeof origImg === "string" ? origImg : origImg?.url;
                if (origUrl) {
                  return { ...(typeof img === "object" ? img : {}), url: origUrl, color };
                }
              }
            }
            return typeof img === "string" ? { url: img, color: "" } : img;
          });
        } else {
          update[f] = val;
        }
      }
    }

    const [updated] = await db
      .update(products)
      .set(update)
      .where(eq(products.id, parseInt(id, 10)))
      .returning();

    if (!updated) {
      return Response.json({ ok: false, error: "Produit non trouvé" }, { status: 404 });
    }

    try {
      revalidateTag("products", { expire: 0 });
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
      .where(eq(products.id, parseInt(id, 10)))
      .returning();
    if (!deleted) {
      return Response.json({ ok: false, error: "Produit non trouvé" }, { status: 404 });
    }

    try {
      revalidateTag("products", { expire: 0 });
      revalidatePath("/");
    } catch {}

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
