import { notFound } from "next/navigation";
import { getCachedCategories, getCachedProducts } from "@/lib/cache";
import { getCategories } from "@/lib/data";
import { ProductGrid } from "@/components/store/ProductGrid";

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  let slug = (rawSlug || "").trim();
  try {
    slug = decodeURIComponent(rawSlug).trim();
  } catch {}
  const lowerSlug = slug.toLowerCase();

  let categories: Awaited<ReturnType<typeof getCachedCategories>> = [];
  try {
    categories = await getCachedCategories();
    if (!categories || categories.length === 0) {
      categories = await getCategories();
    }
  } catch {
    categories = await getCategories().catch(() => []);
  }

  const cat = categories.find(
    (c) =>
      c.slug === slug ||
      c.slug.trim().toLowerCase() === lowerSlug ||
      c.slug.trim() === slug
  );

  if (!cat && slug !== "tout" && lowerSlug !== "tout") {
    notFound();
  }

  let products: Awaited<ReturnType<typeof getCachedProducts>> = [];
  try {
    products = await getCachedProducts({ category: cat?.slug ?? slug, limit: 100 });
  } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <header className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
          Collection
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">
          {cat?.name ?? slug}
        </h1>
        {cat?.description && (
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600">
            {cat.description}
          </p>
        )}
      </header>
      <ProductGrid products={products} perPage={9} />
    </div>
  );
}
