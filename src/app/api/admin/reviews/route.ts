import { NextRequest } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getCustomerReviews, DEFAULT_CUSTOMER_REVIEWS } from "@/lib/data";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCustomerReviews();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      {
        reviews: DEFAULT_CUSTOMER_REVIEWS,
        title: "Ce que disent nos clientes",
        subtitle: "Découvrez les captures et retours réels de nos clientes satisfaites",
        visible: true,
        error: String(err),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviews, title, subtitle, visible } = body;

    const entries: Array<[string, unknown]> = [];

    if (reviews !== undefined) {
      entries.push(["customer_reviews", reviews]);
    }
    if (title !== undefined) {
      entries.push(["reviews_section_title", title]);
    }
    if (subtitle !== undefined) {
      entries.push(["reviews_section_subtitle", subtitle]);
    }
    if (visible !== undefined) {
      entries.push(["reviews_section_visible", Boolean(visible)]);
    }

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
    } catch {}

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
