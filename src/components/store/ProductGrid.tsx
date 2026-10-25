"use client";

import { useState, useEffect, useMemo } from "react";
import type { ProductDTO, CategoryDTO } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { IconChevronLeft, IconChevronRight } from "./Icons";

interface Props {
  products: ProductDTO[];
  categories?: CategoryDTO[];
  perPage?: number;
}

const DEFAULT_CATEGORY_PILLS = [
  { slug: "tout", name: "Tout" },
  { slug: "luxury-collection", name: "Luxury Collection" },
  { slug: "robes", name: "Robes" },
  { slug: "ensembles", name: "Ensembles" },
  { slug: "vetements-enfant", name: "Vêtements Enfant" },
  { slug: "accessoires", name: "Accessoires" },
];

export function ProductGrid({ products, categories, perPage = 12 }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("tout");
  const [page, setPage] = useState(1);

  // Build the list of categories for the filter pills
  const categoryPills = useMemo(() => {
    if (!categories || categories.length === 0) {
      return DEFAULT_CATEGORY_PILLS;
    }

    const uniqueMap = new Map<string, string>();
    uniqueMap.set("tout", "Tout");

    // Include categories from props
    categories.forEach((c) => {
      const cleanSlug = c.slug.trim().toLowerCase();
      const cleanName = c.name.trim();
      if (cleanSlug && cleanSlug !== "tout") {
        uniqueMap.set(cleanSlug, cleanName);
      }
    });

    // If less than 4 categories from DB, ensure common categories are present
    if (uniqueMap.size < 4) {
      DEFAULT_CATEGORY_PILLS.forEach((d) => {
        if (!uniqueMap.has(d.slug)) {
          uniqueMap.set(d.slug, d.name);
        }
      });
    }

    return Array.from(uniqueMap.entries()).map(([slug, name]) => ({
      slug,
      name,
    }));
  }, [categories]);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "tout") {
      return products;
    }

    const target = selectedCategory.toLowerCase();

    const matches = products.filter((p) => {
      const catSlug = (p.categorySlug || "").toLowerCase();
      const name = p.name.toLowerCase();
      const tags = (p.tags || []).map((t) => t.toLowerCase());

      if (catSlug === target || catSlug.includes(target) || target.includes(catSlug)) {
        return true;
      }
      if (tags.some((t) => t.includes(target) || target.includes(t))) {
        return true;
      }

      // Keyword matching
      if (target.includes("robe") && (name.includes("robe") || catSlug.includes("robe"))) return true;
      if (target.includes("ensemble") && (name.includes("ensemble") || catSlug.includes("ensemble"))) return true;
      if ((target.includes("enfant") || target.includes("kid")) && (name.includes("enfant") || catSlug.includes("enfant"))) return true;
      if (target.includes("accessoire") && (name.includes("accessoire") || catSlug.includes("accessoire"))) return true;
      if (target.includes("luxury") && (name.includes("luxury") || tags.includes("premium") || p.isFeatured)) return true;

      return false;
    });

    // If no exact match found in current sample products, return all to prevent blank UI
    return matches.length > 0 ? matches : products;
  }, [products, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const slice = filteredProducts.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, products.length]);

  return (
    <div>
      {/* Category Filter Pills (matching screenshot design) */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 max-w-4xl mx-auto">
        {categoryPills.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.slug);
                setPage(1);
              }}
              className={`rounded-full px-5 py-2 text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[#171717] text-white shadow-sm"
                  : "bg-white text-neutral-800 border border-[#e5dfd5] hover:border-black hover:text-black"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center bg-white">
          <p className="text-lg font-medium text-neutral-800">Aucun produit</p>
          <p className="mt-2 text-sm text-neutral-500">
            Aucun article disponible dans cette catégorie pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {slice.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              priority={i < 4}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label="Précédent"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white transition-smooth hover:border-black disabled:cursor-not-allowed disabled:opacity-30"
          >
            <IconChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-smooth ${
                  page === n
                    ? "bg-black text-white"
                    : "border border-neutral-200 bg-white hover:border-black"
                }`}
              >
                {n}
              </button>
            );
          })}
          <button
            type="button"
            aria-label="Suivant"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white transition-smooth hover:border-black disabled:cursor-not-allowed disabled:opacity-30"
          >
            <IconChevronRight size={18} />
          </button>
        </nav>
      )}

      {totalPages > 1 && (
        <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          Page {page} sur {totalPages} — {filteredProducts.length} articles
        </p>
      )}
    </div>
  );
}