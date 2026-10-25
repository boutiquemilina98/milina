"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { IconBag, IconClose, IconArrowRight, IconTrash, IconMinus, IconPlus } from "./Icons";

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, removeItem, updateQuantity } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={closeCart}
        />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <IconBag size={20} /> Votre panier ({items.length})
          </h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={closeCart}
            className="rounded-full p-2 hover:bg-neutral-100"
          >
            <IconClose />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-neutral-100 p-6 text-neutral-400">
                <IconBag size={32} />
              </div>
              <p className="text-lg font-medium">Votre panier est vide</p>
              <p className="mt-2 text-sm text-neutral-500">
                Découvrez notre collection et ajoutez vos coups de cœur.
              </p>
              <Link
                href="/"
                onClick={closeCart}
                className="mt-6 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-smooth hover:bg-neutral-800"
              >
                Continuer mes achats
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((it) => (
                <li
                  key={`${it.productId}-${it.size ?? ""}-${it.color ?? ""}`}
                  className="flex gap-4 rounded-xl border border-neutral-100 p-3"
                >
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-24 w-20 flex-none rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-black">{it.name}</p>
                        <p className="mt-0.5 text-xs uppercase tracking-wider text-neutral-500">
                          {it.size && `T: ${it.size}`}
                          {it.size && it.color && " · "}
                          {it.color && `C: ${it.color}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Supprimer"
                        onClick={() =>
                          removeItem(it.productId, it.size, it.color)
                        }
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-black"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <div className="flex items-center rounded-full border border-neutral-200">
                        <button
                          type="button"
                          aria-label="Diminuer"
                          onClick={() =>
                            updateQuantity(
                              it.productId,
                              it.quantity - 1,
                              it.size,
                              it.color
                            )
                          }
                          className="rounded-full p-2 hover:bg-neutral-100"
                        >
                          <IconMinus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Augmenter"
                          onClick={() =>
                            updateQuantity(
                              it.productId,
                              it.quantity + 1,
                              it.size,
                              it.color
                            )
                          }
                          className="rounded-full p-2 hover:bg-neutral-100"
                        >
                          <IconPlus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold">
                        {(it.price * it.quantity).toLocaleString("fr-DZ")} DA
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-neutral-100 bg-white px-5 py-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Sous-total</span>
                <span className="font-medium text-black">
                  {subtotal.toLocaleString("fr-DZ")} DA
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Livraison</span>
                <span className="italic text-neutral-400">
                  Calculée à l'étape suivante
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-bold">
                <span>Total</span>
                <span>{subtotal.toLocaleString("fr-DZ")} DA</span>
              </div>
            </div>
            <Link
              href="/commander"
              onClick={closeCart}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-medium uppercase tracking-wider text-white transition-smooth hover:bg-neutral-800"
            >
              Finaliser la commande <IconArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="mt-2 w-full rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium uppercase tracking-wider transition-smooth hover:border-black"
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </aside>
    </>
  );
}