"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, ProductDTO } from "@/lib/types";
import { trackAddToCart, trackAddToWishlist } from "@/lib/pixel";

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  favorites: string[];
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: ProductDTO, opts?: { size?: string; color?: string; quantity?: number; silent?: boolean }) => void;
  removeItem: (productId: number, size?: string, color?: string) => void;
  updateQuantity: (productId: number, qty: number, size?: string, color?: string) => void;
  clear: () => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "milina_cart_v1";
const FAV_KEY = "milina_fav_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const favRaw = localStorage.getItem(FAV_KEY);
      if (favRaw) setFavorites(JSON.parse(favRaw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce(
      (s, i) => s + i.price * i.quantity,
      0
    );
    return {
      items,
      isOpen,
      favorites,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((v) => !v),
      addItem: (product, opts = {}) => {
        const qty = opts.quantity ?? 1;
        setItems((prev) => {
          const idx = prev.findIndex(
            (i) =>
              i.productId === product.id &&
              (i.size ?? "") === (opts.size ?? "") &&
              (i.color ?? "") === (opts.color ?? "")
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
            return next;
          }
          return [
            ...prev,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              currency: product.currency,
              image: product.images[0]?.url ?? "",
              size: opts.size,
              color: opts.color,
              quantity: qty,
              categoryId: product.categoryId ?? null,
              categorySlug: product.categorySlug ?? null,
            },
          ];
        });
        if (!opts.silent) {
          setIsOpen(true);
        }
        try {
          trackAddToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: qty,
            currency: product.currency,
          });
        } catch {}
      },
      removeItem: (productId, size, color) => {
        setItems((prev) =>
          prev.filter(
            (i) =>
              !(
                i.productId === productId &&
                (i.size ?? "") === (size ?? "") &&
                (i.color ?? "") === (color ?? "")
              )
          )
        );
      },
      updateQuantity: (productId, qty, size, color) => {
        setItems((prev) => {
          if (qty <= 0) {
            return prev.filter(
              (i) =>
                !(
                  i.productId === productId &&
                  (i.size ?? "") === (size ?? "") &&
                  (i.color ?? "") === (color ?? "")
                )
            );
          }
          return prev.map((i) =>
            i.productId === productId &&
            (i.size ?? "") === (size ?? "") &&
            (i.color ?? "") === (color ?? "")
              ? { ...i, quantity: qty }
              : i
          );
        });
      },
      clear: () => setItems([]),
      toggleFavorite: (slug) => {
        const s = String(slug).trim();
        setFavorites((prev) => {
          const exists = prev.some((x) => String(x).trim().toLowerCase() === s.toLowerCase());
          if (exists) {
            return prev.filter((x) => String(x).trim().toLowerCase() !== s.toLowerCase());
          }
          try {
            trackAddToWishlist({ id: s, name: s });
          } catch {}
          return [...prev, s];
        });
      },
      isFavorite: (slug) => {
        const s = String(slug).trim().toLowerCase();
        return favorites.some((x) => String(x).trim().toLowerCase() === s);
      },
      hydrated,
      itemCount,
      subtotal,
    };
  }, [items, favorites, isOpen, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}