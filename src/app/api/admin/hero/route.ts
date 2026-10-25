import { NextRequest } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getAllSettings } from "@/lib/data";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await getAllSettings();

    let media: string[] = [];
    try {
      if (all.hero_image) {
        media = typeof all.hero_image === "string" ? JSON.parse(all.hero_image) : all.hero_image;
        if (!Array.isArray(media)) media = [String(all.hero_image)];
      }
    } catch {
      media = all.hero_image ? [String(all.hero_image)] : [];
    }

    const hero = {
      visible: all.hero_visible !== false && all.hero_visible !== "false",
      title: typeof all.hero_title === "string" ? all.hero_title : "CAFTAN LE ROYAL",
      subtitle: typeof all.hero_subtitle === "string" ? all.hero_subtitle : "",
      media: media,
      interval: parseInt(String(all.hero_interval || "5"), 10) || 5,
      autoplay: all.hero_autoplay !== false && all.hero_autoplay !== "false",
      ctaText: typeof all.hero_cta_text === "string" ? all.hero_cta_text : "Shop Now",
      ctaLink: typeof all.hero_cta_link === "string" ? all.hero_cta_link : "/",
      ctaVisible: all.hero_cta_visible !== false && all.hero_cta_visible !== "false",
      fontFamily: typeof all.hero_font_family === "string" ? all.hero_font_family : "'Playfair Display', serif",
      titleColor: typeof all.hero_title_color === "string" ? all.hero_title_color : "#ffffff",
      subtitleColor: typeof all.hero_subtitle_color === "string" ? all.hero_subtitle_color : "#ffffff",
      ctaBgColor: typeof all.hero_cta_bg_color === "string" ? all.hero_cta_bg_color : "rgba(0,0,0,0.8)",
      ctaTextColor: typeof all.hero_cta_text_color === "string" ? all.hero_cta_text_color : "#ffffff",
      ctaBorderColor: typeof all.hero_cta_border_color === "string" ? all.hero_cta_border_color : "rgba(255,255,255,0.2)",
      titleItalic: all.hero_title_italic !== false && all.hero_title_italic !== "false",
    };

    return Response.json({ hero });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hero = body.hero ?? {};

    const entries: Array<[string, unknown]> = [
      ["hero_visible", Boolean(hero.visible)],
      ["hero_title", hero.title ?? ""],
      ["hero_subtitle", hero.subtitle ?? ""],
      ["hero_image", JSON.stringify(hero.media ?? [])],
      ["hero_interval", String(hero.interval ?? 5)],
      ["hero_autoplay", Boolean(hero.autoplay)],
      ["hero_cta_text", hero.ctaText ?? "Shop Now"],
      ["hero_cta_link", hero.ctaLink ?? "/"],
      ["hero_cta_visible", Boolean(hero.ctaVisible)],
      ["hero_font_family", hero.fontFamily ?? "'Playfair Display', serif"],
      ["hero_title_color", hero.titleColor ?? "#ffffff"],
      ["hero_subtitle_color", hero.subtitleColor ?? "#ffffff"],
      ["hero_cta_bg_color", hero.ctaBgColor ?? "rgba(0,0,0,0.8)"],
      ["hero_cta_text_color", hero.ctaTextColor ?? "#ffffff"],
      ["hero_cta_border_color", hero.ctaBorderColor ?? "rgba(255,255,255,0.2)"],
      ["hero_title_italic", Boolean(hero.titleItalic !== false)],
    ];

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
