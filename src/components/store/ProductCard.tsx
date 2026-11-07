"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductDTO } from "@/lib/types";
import { useCart } from "./CartProvider";
import { IconHeart } from "./Icons";
import { QuickAddSheet } from "./QuickAddSheet";

interface Props {
  product: ProductDTO;
  priority?: boolean;
  index?: number;
}

const GRADIENTS = [
  "from-[#dfc6a3] to-[#c9a779]", // Camel / sand
  "from-[#e3e1dc] to-[#cfcbc3]", // Soft stone / ivory
  "from-[#332f2c] to-[#1f1d1b]", // Deep espresso / noir
  "from-[#e8c8be] to-[#d6aba0]", // Blush rose / champagne
];

function getBadgeLabel(product: ProductDTO, index: number = 0): string | null {
  const tags = (product.tags || []).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("best") || t.includes("populaire"))) return "BEST SELLER";
  if (tags.some((t) => t.includes("nouveau") || t.includes("new"))) return "NOUVEAU";
  if (tags.some((t) => t.includes("limited") || t.includes("limitée") || t.includes("edition"))) return "ÉDITION LIMITÉE";
  if (tags.some((t) => t.includes("solde") || t.includes("promo"))) return "PROMO";
  if (product.comparePrice && product.comparePrice > product.price) return "PROMO";
  if (product.isFeatured) return "BEST SELLER";

  if (index % 4 === 0) return "BEST SELLER";
  if (index % 4 === 1) return "NOUVEAU";
  if (index % 4 === 3) return "ÉDITION LIMITÉE";

  return null;
}

export function ProductCard({ product, priority, index = 0 }: Props) {
  const { toggleFavorite, isFavorite } = useCart();
  const [sheetOpen, setSheetOpen] = useState(false);
  const fav = isFavorite(product.slug) || isFavorite(String(product.id));
  const onSale = product.comparePrice !== null && product.comparePrice > product.price;
  const badgeLabel = getBadgeLabel(product, index);
  const gradient = GRADIENTS[index % GRADIENTS.length];

  const firstImage = product.images?.[0]?.url || "";
  const isVideo = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(firstImage) || firstImage.includes("video");

  const subtitle =
    product.colors && product.colors.length > 0
      ? product.colors.join(" · ")
      : product.tags && product.tags.length > 0
      ? product.tags.join(" · ")
      : "Milina Luxury";

  return (
    <article className="group fade-in flex flex-col rounded-[22px] md:rounded-[26px] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-neutral-100">
      <div className={`relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-b ${gradient} flex items-center justify-center`}>
        <span className="font-serif text-5xl md:text-6xl text-white/35 font-normal select-none pointer-events-none absolute z-0">
          M
        </span>

        {firstImage && (
          <Link
            href={`/produit/${product.slug}`}
            prefetch={false}
            aria-label={product.name}
            className="absolute inset-0 z-[1] block h-full w-full"
          >
            {isVideo ? (
              <video
                src={firstImage}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
              />
            ) : (
              <img
                src={firstImage}
                alt={product.name}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </Link>
        )}

        {badgeLabel && (
          <div className="absolute left-3 top-3 z-10 pointer-events-none">
            <span className="inline-block rounded-full bg-[#b28b51] px-3 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {badgeLabel}
            </span>
          </div>
        )}

        <button
          type="button"
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.slug);
          }}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110 active:scale-95"
        >
          <IconHeart size={16} filled={fav} className={fav ? "text-red-500" : "text-neutral-700"} />
        </button>
      </div>

      <div className="p-3.5 md:p-4 bg-white flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/produit/${product.slug}`} prefetch={false}>
            <h3 className="font-serif text-xs md:text-sm font-bold uppercase tracking-wider text-neutral-900 transition-colors hover:text-neutral-600 truncate line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-[11px] md:text-xs text-neutral-400 font-normal truncate">{subtitle}</p>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline">
            <span className="text-sm md:text-base font-bold text-neutral-900">
              {product.price.toLocaleString("fr-DZ")} {product.currency}
            </span>
            {onSale && (
              <span className="text-xs md:text-sm text-neutral-300 line-through font-normal ml-2">
                {product.comparePrice!.toLocaleString("fr-DZ")} {product.currency}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-3 w-full rounded-full border border-black bg-white py-2 md:py-2.5 text-[11px] md:text-xs font-semibold uppercase tracking-wider text-black transition-all duration-200 hover:bg-black hover:text-white"
          >
            AJOUTER AU PANIER
          </button>
        </div>
      </div>

      <QuickAddSheet product={product} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </article>
  );
}
