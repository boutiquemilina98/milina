"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductDTO } from "@/lib/types";
import { useCart } from "@/components/store/CartProvider";
import { ProductCard } from "@/components/store/ProductCard";
import { IconHeart } from "@/components/store/Icons";

export default function FavoritesPage() {
  const { favorites, hydrated } = useCart();
  const [allProducts, setAllProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        if (mounted) {
          setAllProducts(data.products || []);
        }
      } catch (err) {
        console.error("Erreur chargement favoris:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter products matching favorites (by slug or id, case-insensitive & trimmed)
  const favoriteProducts = allProducts.filter((p) =>
    favorites.some((f) => {
      const key = String(f).trim().toLowerCase();
      return key === p.slug.trim().toLowerCase() || key === String(p.id);
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-16 md:px-8">
      {/* Page Title & Count */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">
          Vos favoris
        </h1>
        {hydrated && !loading && favoriteProducts.length > 0 && (
          <p className="mt-3 text-xs md:text-sm text-neutral-500 uppercase tracking-widest font-semibold">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? "article sélectionné" : "articles sélectionnés"}
          </p>
        )}
      </div>

      {/* Loading Skeletons */}
      {!hydrated || loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[22px] md:rounded-[26px] bg-neutral-100 aspect-[3/4]"
            />
          ))}
        </div>
      ) : favoriteProducts.length === 0 ? (
        /* Empty State */
        <div className="mx-auto max-w-md py-12 text-center">
          <div className="mx-auto flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <IconHeart size={36} />
          </div>
          <h2 className="mt-6 text-xl md:text-2xl font-semibold text-neutral-800">
            Aucun favori pour le moment
          </h2>
          <p className="mx-auto mt-2 text-sm text-neutral-500">
            Parcourez notre boutique et cliquez sur le cœur pour ajouter des
            articles à vos favoris.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full border border-black bg-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-neutral-800 active:scale-95"
          >
            Découvrir la collection
          </Link>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {favoriteProducts.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}