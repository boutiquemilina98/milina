import { Metadata } from "next";
import Link from "next/link";
import { getCachedCategories, getCachedProducts } from "@/lib/cache";

export const metadata: Metadata = {
  title: "Plan du site — Boutique Milina",
  description:
    "Retrouvez toutes les pages de la Boutique Milina : catégories, produits, contact et plus encore.",
};

export default async function PlanDuSitePage() {
  let categories: Awaited<ReturnType<typeof getCachedCategories>> = [];
  let products: Awaited<ReturnType<typeof getCachedProducts>> = [];

  try {
    [categories, products] = await Promise.all([
      getCachedCategories(),
      getCachedProducts({ limit: 200 }),
    ]);
  } catch {
    // DB might not be ready
  }

  const activeCategories = categories.filter(
    (c) => c.slug !== "tout" && c.isActive
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1
          className="text-3xl md:text-4xl font-bold uppercase tracking-[0.15em] text-gray-900"
          style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
        >
          Plan du site
        </h1>
        <p className="mt-3 text-sm text-neutral-500">
          Retrouvez toutes les pages de notre boutique
        </p>
        <div className="mx-auto mt-4 h-px w-16 bg-black/20" />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {/* Pages principales */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-gray-900">
            <span className="text-lg">🏠</span> Pages principales
          </h2>
          <ul className="space-y-2.5 border-l-2 border-neutral-200 pl-4">
            <li>
              <Link
                href="/"
                className="text-sm text-neutral-600 transition-colors hover:text-black hover:font-bold"
              >
                Accueil
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-sm text-neutral-600 transition-colors hover:text-black hover:font-bold"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/favoris"
                className="text-sm text-neutral-600 transition-colors hover:text-black hover:font-bold"
              >
                Favoris
              </Link>
            </li>
            <li>
              <Link
                href="/commander"
                className="text-sm text-neutral-600 transition-colors hover:text-black hover:font-bold"
              >
                Commander
              </Link>
            </li>
            <li>
              <Link
                href="/cgu"
                className="text-sm text-neutral-600 transition-colors hover:text-black hover:font-bold"
              >
                Conditions Générales de Vente
              </Link>
            </li>
          </ul>
        </section>

        {/* Catégories */}
        {activeCategories.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-gray-900">
              <span className="text-lg">📂</span> Catégories
            </h2>
            <ul className="space-y-2.5 border-l-2 border-neutral-200 pl-4">
              {activeCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categorie/${cat.slug}`}
                    className="text-sm text-neutral-600 transition-colors hover:text-black hover:font-bold"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Produits */}
        {products.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-gray-900">
              <span className="text-lg">🛍️</span> Produits
              <span className="text-[10px] font-medium text-neutral-400 normal-case tracking-normal">
                ({products.length})
              </span>
            </h2>
            <ul className="space-y-2.5 border-l-2 border-neutral-200 pl-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/produit/${p.slug}`}
                    className="text-sm text-neutral-600 transition-colors hover:text-black hover:font-bold"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* SEO XML sitemap link */}
      <div className="mt-16 border-t border-neutral-100 pt-8 text-center">
        <p className="text-xs text-neutral-400">
          Vous cherchez le fichier sitemap technique ?{" "}
          <a
            href="/sitemap.xml"
            className="underline underline-offset-2 hover:text-black transition-colors"
          >
            sitemap.xml
          </a>
        </p>
      </div>
    </div>
  );
}
