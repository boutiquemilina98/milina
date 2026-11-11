"use client";

import { useState, useEffect } from "react";
import type { ProductDTO } from "@/lib/types";
import { useCart } from "./CartProvider";
import { IconClose, IconMinus, IconPlus } from "./Icons";
import { ShoppingCart } from "lucide-react";
import { getColorSwatch } from "@/lib/colors";

interface Props {
  product: ProductDTO;
  open: boolean;
  onClose: () => void;
}

export function QuickAddSheet({ product, open, onClose }: Props) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0] ?? ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes[0] ?? ""
  );
  const [quantity, setQuantity] = useState(1);

  // Reset selections when product changes or sheet opens
  useEffect(() => {
    if (open) {
      setSelectedColor(product.colors[0] ?? "");
      setSelectedSize(product.sizes[0] ?? "");
      setQuantity(1);
    }
  }, [open, product]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleAdd = () => {
    addItem(product, {
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity,
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[61] animate-slide-up rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-2xl">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200" />

        {/* Header: image + name + price + close */}
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 flex-none overflow-hidden rounded-xl bg-neutral-100">
            <img
              src={product.images[0]?.url ?? ""}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-black">
              {product.name}
            </h3>
            <p className="mt-1 text-lg font-bold text-black">
              {product.price.toLocaleString("fr-DZ")} {product.currency}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Color selection */}
        {product.colors.length > 0 && (
          <div className="mt-6">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Couleur : <span className="font-bold text-neutral-900 capitalize">{selectedColor}</span>
            </p>
            <div className="mt-3 flex items-center justify-center gap-2.5 flex-wrap">
              {product.colors.map((color) => {
                const swatch = getColorSwatch(color, product.images);
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    aria-label={`Couleur ${color}`}
                    onClick={() => setSelectedColor(color)}
                    className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[4px] border transition-all duration-150 hover:scale-105 active:scale-95 ${
                      isSelected
                        ? "border-black/40 ring-2 ring-neutral-900 ring-offset-2 ring-offset-white scale-105 shadow-sm"
                        : "border-black/15 hover:border-black/35 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    }`}
                    style={{
                      background: swatch.background,
                    }}
                  >
                    {swatch.isFallback && (
                      <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-tighter truncate px-0.5">
                        {color.slice(0, 3)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size selection */}
        {product.sizes.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Taille
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: selectedSize === size ? 'var(--product-variant-btn, #1a1a1a)' : 'transparent',
                    borderColor: selectedSize === size ? 'var(--product-variant-btn, #1a1a1a)' : 'rgba(0,0,0,0.1)',
                    color: selectedSize === size ? '#ffffff' : 'inherit'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + Add button */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-0 rounded-full border border-neutral-200">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
            >
              <IconMinus size={16} />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-black">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
            >
              <IconPlus size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-neutral-300 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--add-to-cart-btn, #000000)' }}
          >
            <ShoppingCart size={18} strokeWidth={2} />
            Ajouter
          </button>
        </div>
      </div>
    </>
  );
}
