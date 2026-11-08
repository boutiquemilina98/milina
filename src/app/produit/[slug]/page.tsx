import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedProductBySlug, getCachedProducts, getCachedCategories } from "@/lib/cache";
import { getProductBySlug } from "@/lib/data";
import { ProductDetail } from "@/components/store/ProductDetail";
import { ProductCard } from "@/components/store/ProductCard";
import { normalizeImages } from "@/lib/media";

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://milina-xi.vercel.app").replace(/\/$/, "");

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value).replace(/\/+$/, "").trim();
  } catch {
    return (value || "").replace(/\/+$/, "").trim();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = safeDecode(raw);
  let product = await getCachedProductBySlug(slug).catch(() => null);
  if (!product) {
    product = await getProductBySlug(slug).catch(() => null);
  }
  if (!product) return {};

  const description =
    product.description?.trim().slice(0, 200) ||
    `Découvrez ${product.name} chez Boutique Milina Luxury.`;

  const imageUrl = normalizeImages(product.images)[0];
  const absoluteImageUrl = imageUrl
    ? /^https?:\/\//i.test(imageUrl)
      ? imageUrl
      : `${siteUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
    : undefined;
  const pageUrl = `${siteUrl}/produit/${encodeURIComponent(product.slug)}`;

  return {
    title: `${product.name} | Boutique Milina`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      url: pageUrl,
      title: product.name,
      description,
      siteName: "Boutique Milina",
      ...(absoluteImageUrl ? { images: [{ url: absoluteImageUrl, alt: product.name }] } : {}),
    },
    twitter: {
      card: absoluteImageUrl ? "summary_large_image" : "summary",
      title: product.name,
      description,
      ...(absoluteImageUrl ? { images: [absoluteImageUrl] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = safeDecode(raw);

  let product = await getCachedProductBySlug(slug).catch(() => null);
  if (!product) {
    product = await getProductBySlug(slug).catch(() => null);
  }
  if (!product) notFound();

  const [relatedRaw, categories] = await Promise.all([
    getCachedProducts({ category: product.categorySlug ?? "tout", limit: 5 }).catch(() => []),
    getCachedCategories().catch(() => []),
  ]);

  const related = relatedRaw.filter((p) => p.id !== product.id).slice(0, 4);
  const categoryName = categories.find((c) => c.id === product.categoryId)?.name ?? "Produit";

  return (
    <div>
      <ProductDetail product={product} categoryName={categoryName} />

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <h2 className="mb-8 font-serif text-2xl font-bold md:text-3xl">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
