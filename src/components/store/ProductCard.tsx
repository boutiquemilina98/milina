"use client";

import { useMemo, useState } from "react";
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
  "from-[#dfc6a3] to-[#c9a779]",
  "from-[#e3e1dc] to-[#cfcbc3]",
  "from-[#332f2c] to-[#1f1d1b]",
  "from-[#e8c8be] to-[#d6aba0]",
];

function getBadgeLabel(product: ProductDTO, index: number): string | null {
  const tags = (product.tags || []).map((tag) => tag.toLowerCase());
  if (tags.some((tag) => tag.includes("best") || tag.includes("populaire"))) return "BEST SELLER";
  if (tags.some((tag) => tag.includes("nouveau") || tag.includes("new"))) return "NOUVEAU";
  if (tags.some((tag) => tag.includes("limited") || tag.includes("limitée") || tag.includes("edition"))) return "ÉDITION LIMITÉE";
  if (tags.some((tag) => tag.includes("solde") || tag.includes("promo"))) return "PROMO";
  if (product.comparePrice && product.comparePrice > product.price) return "PROMO";
  if (product.isFeatured) return "BEST SELLER";
  if (index % 4 === 0) return "BEST SELLER";
  if (index % 4 === 1) return "NOUVEAU";
  if (index % 4 === 3) return "ÉDITION LIMITÉE";
  return null;
}

function mediaUrl(image: unknown): string {
  if (typeof image === "string") return image.trim();
  if (!image || typeof image !== "object") return "";

  const item = image as Record<string, unknown>;
  for (const key of ["url", "src", "imageUrl", "path"]) {
    if (typeof item[key] === "string" && item[key].trim()) return item[key].trim();
  }
  return "";
}

export function ProductCard({ product, priority, index = 0 }: Props) {
  const { toggleFavorite, isFavorite } = useCart();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const fav = isFavorite(product.slug) || isFavorite(String(product.id));
  const onSale = product.comparePrice !== null && product.comparePrice > product.price;
  const badgeLabel = getBadgeLabel(product, index);
  const gradient = GRADIENTS[index % GRADIENTS.length];

  // Older product records may store media as a URL string or under a different
  // property name. Pick the first usable image and try the remaining images if
  // a stored URL is stale or no longer reachable.
  const imageUrls = useMemo(
    () => (Array.isArray(product.images) ? product.images.map(mediaUrl).filter(Boolean) : []),
    [product.images]
  );
  const firstImage = imageUrls.find((url) => !failedImages.includes(url)) || "";
  const isVideo = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(firstImage) || firstImage.includes("video");
  const subtitle =
    product.colors?.length > 0
      ? product.colors.join(" · ")
      : product.tags?.length > 0
      ? product.tags.join(" · ")
      : "Milina Luxury";

  return (
    <article className="group fade-in flex flex-col overflow-hidden rounded-[22px] border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:rounded-[26px]">
      <div className={`relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-gradient-to-b ${gradient}`}>
        <span className="pointer-events-none absolute z-0 select-none font-serif text-5xl font-normal text-white/35 md:text-6xl">M</span>

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
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setFailedImages((failed) => [...failed, firstImage])}
              />
            ) : (
              <img
                src={firstImage}
                alt={product.name}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setFailedImages((failed) => [...failed, firstImage])}
              />
            )}
          </Link>
        )}

        {badgeLabel && (
          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <span className="inline-block rounded-full bg-[#b28b51] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm md:text-[10px]">
              {badgeLabel}
            </span>
          </div>
        )}

        <button
          type="button"
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(product.slug);
          }}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110 active:scale-95 md:h-9 md:w-9"
        >
          <IconHeart size={16} filled={fav} className={fav ? "text-red-500" : "text-neutral-700"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between bg-white p-3.5 md:p-4">
        <div>
          <Link href={`/produit/${product.slug}`} prefetch={false}>
            <h3 className="line-clamp-1 truncate font-serif text-xs font-bold uppercase tracking-wider text-neutral-900 transition-colors hover:text-neutral-600 md:text-sm">
              {product.name}
            </h3>
          </Link>
          <p className="mt-0.5 truncate text-[11px] font-normal text-neutral-400 md:text-xs">{subtitle}</p>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline">
            <span className="text-sm font-bold text-neutral-900 md:text-base">
              {product.price.toLocaleString("fr-DZ")} {product.currency}
            </span>
            {onSale && (
              <span className="ml-2 text-xs font-normal text-neutral-300 line-through md:text-sm">
                {product.comparePrice!.toLocaleString("fr-DZ")} {product.currency}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-3 w-full cursor-pointer rounded-full border border-black bg-white py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-black transition-all duration-200 hover:bg-black hover:text-white active:scale-[0.98] md:py-2.5 md:text-xs"
          >
            AJOUTER AU PANIER
          </button>
        </div>
      </div>

      <QuickAddSheet product={product} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </article>
  );
}
