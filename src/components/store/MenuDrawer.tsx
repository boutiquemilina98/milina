"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CategoryDTO } from "@/lib/types";
import { IconClose, IconHome, IconHeart, IconBag, IconDashboard, IconMail, IconFileText } from "./Icons";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: CategoryDTO[];
}

export function MenuDrawer({ open, onClose, categories }: Props) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"pages" | "categories">("pages");
  
  useEffect(() => setMounted(true), []);

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

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 transition-opacity"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[88%] max-w-sm transform border-r border-black/5 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: 'var(--menu-bg, #ffffff)', color: 'var(--menu-text, #000000)' }}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 shrink-0">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-neutral-100"
          >
            <IconClose />
          </button>
        </div>
        
        <div className="flex border-b border-black/5 shrink-0">
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "pages" ? "border-b-2 border-black text-black" : "text-neutral-500 hover:text-black"}`}
            onClick={() => setActiveTab("pages")}
          >
            Pages
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "categories" ? "border-b-2 border-black text-black" : "text-neutral-500 hover:text-black"}`}
            onClick={() => setActiveTab("categories")}
          >
            Catégories
          </button>
        </div>

        <nav className="no-scrollbar flex-1 overflow-y-auto px-2 py-4">
          {activeTab === "pages" ? (
            <div className="space-y-1">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-base font-bold transition-smooth hover:bg-neutral-50"
              >
                <IconHome size={20} /> Accueil
              </Link>
              <Link
                href="/favoris"
                onClick={onClose}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-base font-bold transition-smooth hover:bg-neutral-50"
              >
                <IconHeart size={20} /> Favoris
              </Link>
              <Link
                href="/contact"
                onClick={onClose}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-base font-bold transition-smooth hover:bg-neutral-50"
              >
                <IconMail size={20} /> Contact
              </Link>
              <Link
                href="/cgu"
                onClick={onClose}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-base font-bold transition-smooth hover:bg-neutral-50"
              >
                <IconFileText size={20} /> Conditions Générales
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {categories
                .filter((c) => c.slug !== "tout")
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/categorie/${c.slug}`}
                    onClick={onClose}
                    className="block rounded-md px-4 py-3 text-base font-bold transition-smooth hover:bg-neutral-50"
                  >
                    {c.name}
                  </Link>
                ))}
            </div>
          )}
        </nav>
        
        <div className="border-t border-neutral-100 px-4 py-3 text-xs font-bold text-neutral-500 shrink-0">
          Milina Luxury
        </div>
      </aside>
    </>
  );
}