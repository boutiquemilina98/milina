"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ProductDTO } from "@/lib/types";
import { useCart } from "./CartProvider";
import {
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconBag,
  IconCheck,
} from "./Icons";

interface Props {
  product: ProductDTO;
  categoryName: string;
}

export function ProductDetail({ product, categoryName }: Props) {
  const { addItem, toggleFavorite, isFavorite } = useCart();
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | undefined>(product.sizes[0]);
  const [color, setColor] = useState<string | undefined>(product.colors[0]);
  const fav = isFavorite(product.slug) || isFavorite(String(product.id));

  const onSale =
    product.comparePrice !== null && product.comparePrice > product.price;
  const discount = onSale
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;

  const next = () =>
    setActive((a) => (a + 1) % Math.max(1, product.images.length));
  const prev = () =>
    setActive((a) =>
      (a - 1 + product.images.length) % Math.max(1, product.images.length)
    );

  // When color changes, switch to first image of that color
  const handleColorChange = (c: string) => {
    setColor(c);
    const idx = product.images.findIndex((img) => img.color === c);
    if (idx >= 0) setActive(idx);
  };

  // When clicking a thumbnail, also update the selected color
  const handleThumbClick = (i: number) => {
    setActive(i);
    const img = product.images[i];
    if (img?.color) setColor(img.color);
  };

  // Check variant stock
  const currentVariant = product.variants?.find(
    (v) => v.color === color && v.size === size
  );
  const variantStock = currentVariant?.quantity ?? 0;
  // Stock tracking is only active if at least one variant has a quantity > 0
  const hasStockTracking = product.variants?.some((v) => v.quantity > 0) ?? false;
  const isOutOfStock = hasStockTracking && variantStock <= 0 && product.variants.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition-smooth hover:opacity-80"
          style={{ backgroundColor: 'var(--product-back-btn, #ffffff)' }}
        >
          <IconChevronLeft size={18} />
        </Link>
        <h1 className="font-serif text-xl font-bold uppercase tracking-wide md:hidden">
          {product.name}
        </h1>
        <button
          type="button"
          onClick={() => toggleFavorite(product.slug)}
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition-smooth hover:opacity-80"
          style={{ color: 'var(--product-fav-icon, #000000)' }}
        >
          <IconHeart size={18} filled={fav} />
        </button>
      </div>

      {/* Breadcrumb */}
      <nav className="mb-4 hidden items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 md:flex">
        <Link href="/" className="hover:text-black">
          Accueil
        </Link>
        <IconChevronRight size={12} />
        <Link
          href={
            product.categorySlug ? `/categorie/${product.categorySlug}` : "#"
          }
          className="hover:text-black"
        >
          {categoryName}
        </Link>
        <IconChevronRight size={12} />
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2 min-w-0">
        {/* Image/Video gallery */}
        <div className="relative min-w-0">
          <div className="relative flex flex-col items-center justify-center w-full max-w-full overflow-hidden rounded-2xl bg-neutral-50 border border-black/5">
            {(() => {
              const currentUrl = product.images[active]?.url ?? "";
              const isVideo = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(currentUrl) || currentUrl.includes("video");
              if (isVideo) {
                return (
                  <video
                    key={currentUrl}
                    src={currentUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    preload="metadata"
                    className="w-full h-auto max-h-[80vh] object-contain max-w-full"
                  />
                );
              }
              return (
                <Image
                  src={currentUrl}
                  alt={product.name}
                  width={800}
                  height={800}
                  priority
                  className="w-full h-auto max-h-[80vh] object-contain max-w-full"
                />
              );
            })()}
            {onSale && (
              <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
                -{discount}% Réduction
              </span>
            )}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Image précédente"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                >
                  <IconChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Image suivante"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                >
                  <IconChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails with color labels */}
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => {
                const isVid = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(img.url) || img.url.includes("video");
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleThumbClick(i)}
                    className={`shrink-0 flex-none overflow-hidden rounded-md border-2 transition-smooth ${
                      active === i ? "border-black" : "border-transparent"
                    }`}
                  >
                    <div className="h-16 w-16 overflow-hidden bg-neutral-100 flex items-center justify-center">
                      {isVid ? (
                        <video
                          src={img.url}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Image
                          src={img.url}
                          alt={`${product.name} ${img.color}`}
                          width={100}
                          height={100}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                    {img.color && (
                      <div className="bg-neutral-50 px-1 py-0.5 text-center text-[9px] font-medium text-neutral-600 truncate max-w-[64px]">
                        {img.color}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Catégorie : {categoryName}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-bold">
              {product.price.toLocaleString("fr-DZ")} {product.currency}
            </span>
            {onSale && (
              <>
                <span className="text-base text-neutral-400 line-through">
                  {product.comparePrice!.toLocaleString("fr-DZ")}{" "}
                  {product.currency}
                </span>
                <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                  -{discount}% Réduction
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-5 text-neutral-600">{product.description}</p>
          )}

          {/* Colors — clicking switches the image */}
          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Couleur : <span>{color}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorChange(c)}
                    className="rounded-md border px-4 py-2 text-sm transition-smooth hover:opacity-80"
                    style={{
                      backgroundColor: color === c ? 'var(--product-variant-btn, #000000)' : 'transparent',
                      borderColor: color === c ? 'var(--product-variant-btn, #000000)' : 'rgba(0,0,0,0.1)',
                      color: color === c ? '#ffffff' : 'inherit'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Taille
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className="rounded-md border px-4 py-2 text-sm transition-smooth hover:opacity-80"
                    style={{
                      backgroundColor: size === s ? 'var(--product-variant-btn, #000000)' : 'transparent',
                      borderColor: size === s ? 'var(--product-variant-btn, #000000)' : 'rgba(0,0,0,0.1)',
                      color: size === s ? '#ffffff' : 'inherit'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock indicator — only show if stock tracking is active */}
          {hasStockTracking && color && size && (
            <p className={`mt-3 text-xs font-medium ${variantStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {variantStock > 0 ? `${variantStock} en stock` : "Rupture de stock"}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addItem(product, { size, color })}
              className="flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-smooth hover:opacity-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--add-to-cart-btn, #000000)', color: '#ffffff' }}
            >
              <IconBag size={18} /> {isOutOfStock ? "Rupture" : "Ajouter au panier"}
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                addItem(product, { size, color, silent: true });
                window.location.href = "/commander";
              }}
              className="flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-smooth hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--order-btn, #ffffff)', borderColor: 'rgba(0,0,0,0.1)' }}
            >
              <IconCheck size={18} />
              Commander
            </button>
          </div>

          {/* Trust badges */}
          <ul className="mt-8 space-y-3 border-t border-black/5 pt-6 text-sm text-neutral-700">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black">
                <IconCheck size={16} />
              </span>
              Livraison rapide 58 wilayas
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black">
                <IconCheck size={16} />
              </span>
              Paiement à la livraison
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black">
                <IconCheck size={16} />
              </span>
              Échanges possibles sous 24h
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}