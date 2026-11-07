import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCachedProductBySlug, getCachedProducts, getCachedCategories } from "@/lib/cache";
import { ProductDetail } from "@/components/store/ProductDetail";
import { ProductCard } from "@/components/store/ProductCard";

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://milina-xi.vercel.app").replace(/\/$/, "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug).catch(() => null);
  if (!product) return {};

  const description = product.description?.trim().slice(0, 200) ||
    `Découvrez ${product.name} chez Boutique Milina Luxury.`;
  const imageUrl = product.images?.[0]?.url;
  const absoluteImageUrl = imageUrl
    ? imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
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
  const { slug } = await params;
  let product: Awaited<ReturnType<typeof getCachedProductBySlug>> = null;
  let related: Awaited<ReturnType<typeof getCachedProducts>> = [];
  try {
    product = await getCachedProductBySlug(slug);
    if (product) {
      related = await getCachedProducts({
        category: product.categorySlug ?? "tout",
        limit: 5,
      });
      related = related.filter((p) => p.id !== product!.id).slice(0, 4);
    }
  } catch {}

  if (!product) {
    notFound();
  }

  const categoryName =
    (await getCachedCategories().catch(() => [] as Awaited<ReturnType<typeof getCachedCategories>>))
      .find((c) => c.id === product.categoryId)?.name ?? "Produit";

  return (
    <div>
      <ProductDetail product={product} categoryName={categoryName} />

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <h2 className="mb-8 font-serif text-2xl font-bold md:text-3xl">
            Vous aimerez aussi
          </h2>
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
