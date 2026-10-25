import { getCachedProducts, getCachedSettings, getCachedReviews, getCachedCategories } from "@/lib/cache";
import { Hero } from "@/components/store/Hero";
import { ProductGrid } from "@/components/store/ProductGrid";
import { BrandStats, Testimonials, FAQ, Newsletter } from "@/components/store/HomeSections";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getCachedProducts>> = [];
  let settings: Awaited<ReturnType<typeof getCachedSettings>> = {};
  let categories: Awaited<ReturnType<typeof getCachedCategories>> = [];
  let customerReviewsData: Awaited<ReturnType<typeof getCachedReviews>> = {
    reviews: [],
    title: "Ce que disent nos clientes",
    subtitle: "Découvrez les captures et retours réels de nos clientes satisfaites",
    visible: true,
  };
  try {
    [products, settings, customerReviewsData, categories] = await Promise.all([
      getCachedProducts({ limit: 50 }),
      getCachedSettings(),
      getCachedReviews(),
      getCachedCategories(),
    ]);
  } catch {
    // DB unavailable in this render — empty state will show
  }

  const heroVisible = settings.hero_visible !== false && settings.hero_visible !== "false";
  let rawMedia: unknown = settings.hero_image;
  if (typeof rawMedia === "string") {
    try {
      rawMedia = JSON.parse(rawMedia);
    } catch {}
  }
  if (typeof rawMedia === "string" && (rawMedia.startsWith("[") || rawMedia.startsWith("{"))) {
    try {
      rawMedia = JSON.parse(rawMedia);
    } catch {}
  }

  let heroMedia: string[] = [];
  if (Array.isArray(rawMedia)) {
    heroMedia = rawMedia
      .flat(Infinity)
      .map((item: any) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          if ("url" in item && typeof item.url === "string") return item.url.trim();
          if ("src" in item && typeof item.src === "string") return item.src.trim();
        }
        return "";
      })
      .filter((u): u is string => typeof u === "string" && u.length > 0);
  } else if (typeof rawMedia === "string" && rawMedia.trim().length > 0) {
    heroMedia = [rawMedia.trim()];
  }

  if (heroMedia.length === 0) {
    const fallback =
      products.find((p) => p.images && p.images.length > 0)?.images[0]?.url ||
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&q=80";
    if (fallback) heroMedia = [fallback];
  }

  const heroTitle = (settings.hero_title as string) ?? "CAFTAN LE ROYAL";
  const heroSubtitle = (settings.hero_subtitle as string) ?? undefined;
  const heroInterval = parseInt((settings.hero_interval as string) || "5", 10);
  const heroCtaText = (settings.hero_cta_text as string) || "Shop Now";
  const heroCtaLink = (settings.hero_cta_link as string) || "/";
  const heroCtaVisible = settings.hero_cta_visible !== false && settings.hero_cta_visible !== "false";
  const heroFontFamily = (settings.hero_font_family as string) || "'Playfair Display', serif";
  const heroTitleColor = (settings.hero_title_color as string) || "#ffffff";
  const heroSubtitleColor = (settings.hero_subtitle_color as string) || "#ffffff";
  const heroCtaBgColor = (settings.hero_cta_bg_color as string) || "rgba(0,0,0,0.8)";
  const heroCtaTextColor = (settings.hero_cta_text_color as string) || "#ffffff";
  const heroCtaBorderColor = (settings.hero_cta_border_color as string) || "rgba(255,255,255,0.2)";
  const heroTitleItalic = settings.hero_title_italic !== false && settings.hero_title_italic !== "false";

  return (
    <div>
      {/* Hero Section */}
      {heroVisible && heroMedia.length > 0 && (
        <Hero
          title={heroTitle}
          subtitle={heroSubtitle}
          mediaUrls={heroMedia}
          interval={heroInterval}
          ctaHref={heroCtaLink}
          ctaText={heroCtaText}
          ctaVisible={heroCtaVisible}
          fontFamily={heroFontFamily}
          titleColor={heroTitleColor}
          subtitleColor={heroSubtitleColor}
          ctaBgColor={heroCtaBgColor}
          ctaTextColor={heroCtaTextColor}
          ctaBorderColor={heroCtaBorderColor}
          titleItalic={heroTitleItalic}
        />
      )}

      {/* Products Section */}
      <section className="px-4 py-16 md:px-8 md:py-24" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 
              className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
              style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
            >
              Tous les articles
            </h2>
            <p className="mt-2.5 text-sm text-neutral-500 max-w-md mx-auto">
              Chaque pièce est choisie avec exigence pour révéler votre style
            </p>
          </div>
          <ProductGrid products={products} categories={categories} perPage={12} />
        </div>
      </section>

      {/* Brand Stats Section */}
      <BrandStats />

      {/* Customer Review Screenshots Section */}
      <Testimonials
        reviews={customerReviewsData.reviews}
        title={customerReviewsData.title}
        subtitle={customerReviewsData.subtitle}
        visible={customerReviewsData.visible}
      />

      {/* FAQ Section */}
      <FAQ />

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}