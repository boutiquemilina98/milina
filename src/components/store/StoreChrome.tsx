"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CategoryDTO } from "@/lib/types";
import {
  IconBag,
  IconClose,
  IconHeart,
  IconHome,
  IconInstagram,
  IconFacebook,
  IconMail,
  IconMapPin,
  IconMenu,
  IconSearch,
  IconStore,
  IconWhatsApp,
  IconTikTok,
} from "@/components/store/Icons";
import { Store as LucideStore, ShoppingCart as LucideShoppingCart, Heart as LucideHeart } from "lucide-react";
import { useCart } from "./CartProvider";
import { CartDrawer } from "./CartDrawer";
import { MenuDrawer } from "./MenuDrawer";
import { SearchBar } from "./SearchBar";

interface Props {
  children: ReactNode;
  categories: CategoryDTO[];
  settings: Record<string, unknown>;
}

/* Inline header search results dropdown */
function HeaderSearchResults({ query, onSelect }: { query: string; onSelect: () => void }) {
  const [results, setResults] = useState<{ slug: string; name: string; price: number; image: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (!term) { setResults([]); return; }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(term)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        setResults(
          (data.products ?? []).slice(0, 6).map((p: any) => ({
            slug: p.slug, name: p.name, price: p.price, image: p.images?.[0] ?? "",
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [query]);

  if (loading) return <p className="px-4 py-3 text-xs text-neutral-500">Recherche...</p>;
  if (results.length === 0) return <p className="px-4 py-3 text-xs text-neutral-500">Aucun résultat</p>;

  return (
    <ul className="divide-y divide-neutral-100">
      {results.map((r) => (
        <li key={r.slug}>
          <Link
            href={`/produit/${r.slug}`}
            onClick={onSelect}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-neutral-50"
          >
            {r.image && (
              <img src={r.image} alt={r.name} className="h-10 w-10 rounded-md object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-black truncate">{r.name}</div>
              <div className="text-xs font-bold text-neutral-600">{r.price.toLocaleString("fr-DZ")} DA</div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function StoreChrome({ children, categories, settings }: Props) {
  const { itemCount, openCart, favorites } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [headerSearchFocused, setHeaderSearchFocused] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const handleDropdownEnter = (name: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(name);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const shippingNotice =
    (settings.shipping_notice as string) ?? "Livraison Rapide 58 Wilayas";
  const contactEmail =
    (settings.contact_email as string) ?? "milina.luxury@gmail.com";
  const contactAddress =
    (settings.contact_address as string) ?? "Algérie — Livraison 58 wilayas";
  const aboutText =
    (settings.about_text as string) ??
    "Milina Luxury est votre boutique en ligne de prêt à porter pour femmes. Chez Milina Luxury, l'originalité est la seule règle. Révélez l'exception qui est en vous !";
  const instagramUrl =
    (settings.instagram_url as string) ?? "https://instagram.com/milina.luxury";
  const facebookUrl =
    (settings.facebook_url as string) ?? "https://facebook.com/milina.luxury";
  const tiktokUrl = (settings.tiktok_url as string) ?? "https://tiktok.com/@milina.luxury";
  const whatsappNumber = (settings.whatsapp_number as string) ?? "213660989407";
  const whatsappUrl = `https://wa.me/${String(whatsappNumber).replace(/[^0-9]/g, '')}`;
  const whatsappVisible =
    settings.whatsapp_visible !== undefined ? settings.whatsapp_visible === true || settings.whatsapp_visible === "true" : true;

  // On admin pages, render minimal layout
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  const announcements = [
    "Échanges possibles sous 24h",
    "Paiement à la livraison",
    shippingNotice,
  ];

  // Cycle announcements
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const visibleCategories = categories.filter((c) => c.slug !== "tout");
  const navCategories = [
    { slug: "tout", name: "Tout" },
    ...visibleCategories.slice(0, 7).map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <div className="flex min-h-screen flex-col pb-[60px] md:pb-0" style={{ backgroundColor: 'var(--store-bg, #ffffff)' }}>
      {/* Announcement bar - horizontal scrolling text */}
      <div className="border-b border-neutral-100" style={{ backgroundColor: 'var(--topbar-bg, #ffffff)' }}>
        <div className="relative flex items-center justify-center overflow-hidden py-2">
          {announcements.map((msg, i) => (
            <span
              key={msg}
              className={`absolute inset-x-0 text-center text-[11px] font-medium tracking-wider uppercase transition-all duration-500 ${
                i === announcementIdx
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ color: 'var(--topbar-text, #666666)' }}
            >
              {msg}
            </span>
          ))}
          {/* invisible spacer */}
          <span className="invisible text-[11px] font-medium tracking-wider uppercase">
            {announcements[0]}
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-100 backdrop-blur" style={{ backgroundColor: 'var(--header-bg, rgba(255,255,255,0.95))' }}>
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          {/* Left: hamburger (mobile only) + Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMenuOpen(true)}
              className="relative z-10 rounded-full p-2 transition-smooth hover:bg-black/5 md:hidden"
              style={{ color: 'var(--header-icon, #000000)' }}
            >
              <IconMenu size={22} />
            </button>
            <Link
              href="/"
              className="flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:top-auto md:left-auto md:translate-x-0 md:translate-y-0 max-w-[calc(100%-160px)] md:max-w-none text-center"
            >
              {(settings.logo_image as string) ? (
                <img 
                  src={settings.logo_image as string} 
                  alt="Logo" 
                  className={settings.logo_size ? "w-auto object-contain max-h-10 md:max-h-none" : "h-10 md:h-12 lg:h-14 w-auto object-contain transition-all"} 
                  style={settings.logo_size ? { height: `${Math.round(Number(settings.logo_size) * 1.25)}px` } : undefined}
                />
              ) : (
                <span className="font-serif font-black text-xl md:text-2xl uppercase tracking-[0.2em] text-black">
                  MILINA
                </span>
              )}
            </Link>
          </div>

          {/* Center: two dropdown tabs (desktop only) */}
          <nav className="hidden md:flex items-center gap-7">
            {/* Pages dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('pages')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200 hover:opacity-70"
                style={{ color: 'var(--header-icon, #000000)' }}
                onClick={() => setOpenDropdown(openDropdown === 'pages' ? null : 'pages')}
              >
                Pages
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-200 ${openDropdown === 'pages' ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {openDropdown === 'pages' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                  <div className="min-w-[190px] rounded-xl border border-neutral-100 bg-white shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Link href="/" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 hover:text-black transition-colors">
                      <span className="text-base">🏠</span> Accueil
                    </Link>
                    <Link href="/contact" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 hover:text-black transition-colors">
                      <span className="text-base">✉️</span> Contact
                    </Link>
                    <Link href="/cgu" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 hover:text-black transition-colors">
                      <span className="text-base">📄</span> CGV
                    </Link>
                    <Link href="/favoris" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 hover:text-black transition-colors">
                      <span className="text-base">❤️</span> Favoris
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Catégories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('categories')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200 hover:opacity-70"
                style={{ color: 'var(--header-icon, #000000)' }}
                onClick={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
              >
                Catégories
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-200 ${openDropdown === 'categories' ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {openDropdown === 'categories' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                  <div className="min-w-[210px] rounded-xl border border-neutral-100 bg-white shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Link href="/" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                      Tout voir
                    </Link>
                    {visibleCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/categorie/${cat.slug}`}
                        onClick={() => setOpenDropdown(null)}
                        className={`flex items-center gap-3 px-5 py-2.5 text-xs font-bold transition-colors hover:bg-neutral-50 ${
                          pathname === `/categorie/${cat.slug}` ? 'text-black bg-neutral-100' : 'text-neutral-700 hover:text-black'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right: search bar + cart */}
          <div className="relative z-10 flex items-center gap-3">
            {/* Inline search (desktop) */}
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-44 lg:w-60 rounded-full border border-neutral-300 bg-neutral-50/80 pl-9 pr-4 py-2 text-xs font-bold placeholder:font-bold placeholder:text-neutral-500 outline-none transition-all duration-300 focus:w-60 lg:focus:w-72 focus:border-black focus:bg-white"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                onFocus={() => setHeaderSearchFocused(true)}
                onBlur={() => setTimeout(() => setHeaderSearchFocused(false), 200)}
              />
              <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              {/* Search results dropdown */}
              {headerSearchFocused && headerSearchQuery.trim() && (
                <div className="absolute top-full right-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl z-50">
                  <HeaderSearchResults query={headerSearchQuery} onSelect={() => { setHeaderSearchQuery(""); setHeaderSearchFocused(false); }} />
                </div>
              )}
            </div>
            {/* Search icon (mobile) */}
            <button
              type="button"
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 transition-smooth hover:bg-black/5 md:hidden"
              style={{ color: 'var(--header-icon, #000000)' }}
            >
              <IconSearch size={22} />
            </button>
            <button
              type="button"
              aria-label="Panier"
              onClick={openCart}
              className="relative rounded-full p-2.5 transition-smooth hover:bg-black/5"
              style={{ color: 'var(--header-icon, #000000)' }}
            >
              <IconBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-black text-[10px] font-black text-white shadow">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>


      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--store-bg, #ffffff)' }}>
          <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Rechercher</h2>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setSearchOpen(false)}
                className="rounded-full p-2 hover:bg-black/5"
              >
                <IconClose />
              </button>
            </div>
            <SearchBar onResultClick={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {/* Menu drawer */}
      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
      />

      {/* Cart drawer */}
      <CartDrawer />

      <main className="flex-1">{children}</main>

      {/* Features section */}
      <section id="features-section" className="border-t border-black/5 px-4 py-14 md:px-8" style={{ backgroundColor: 'var(--features-bg, #ffffff)' }}>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              ),
              title: "Paiement à la livraison",
              desc: "Payez en toute sécurité à la livraison",
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.5 21 3 16.5l4.5-4.5" />
                  <path d="M16.5 3 21 7.5l-4.5 4.5" />
                  <line x1="3" y1="16.5" x2="16.5" y2="3" />
                </svg>
              ),
              title: "Échanges possibles",
              desc: "Les échanges sont possibles dans les 24 heures",
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              title: "Suivi de vos commandes",
              desc: "Nous suivons vos commandes jusqu'à la livraison",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center text-center transition-smooth group"
            >
              <div className="mb-4 text-neutral-700 transition-transform duration-300 group-hover:-translate-y-1">{f.icon}</div>
              <h3 className="text-sm font-bold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed max-w-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5" style={{ backgroundColor: 'var(--footer-bg, #ffffff)' }}>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8">
          {/* Footer Logo */}
          <div className="mb-6 flex justify-center">
            {(settings.footer_logo_image as string) ? (
              <img 
                src={settings.footer_logo_image as string} 
                alt="Footer Logo" 
                className={settings.footer_logo_size ? "w-auto object-contain" : "h-16 w-auto object-contain"} 
                style={settings.footer_logo_size ? { height: `${settings.footer_logo_size}px` } : undefined}
              />
            ) : (
              <h3
                className="text-xl font-bold uppercase tracking-[0.3em] text-gray-900"
                style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
              >
                Milina
              </h3>
            )}
          </div>
          
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-medium mb-8">
            Boutique
          </p>

          {/* Contact info */}
          <div className="flex flex-col items-center gap-3 text-sm text-neutral-600">
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 hover:text-black transition-colors"
            >
              <IconMail size={14} /> {contactEmail}
            </a>
            <div className="inline-flex items-center gap-2 text-xs text-neutral-400">
              <IconMapPin size={14} /> {contactAddress}
            </div>
          </div>

          {/* Social icons */}
          <div className="mt-6 flex justify-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-all hover:bg-black hover:text-white hover:border-black"
            >
              <IconInstagram size={16} />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-all hover:bg-black hover:text-white hover:border-black"
            >
              <IconFacebook size={16} />
            </a>
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-all hover:bg-black hover:text-white hover:border-black"
              >
                <IconTikTok size={16} />
              </a>
            )}
          </div>

          {/* Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400">
            <Link
              href="/cgu"
              className="hover:text-black transition-colors"
            >
              Conditions Générales De Vente
            </Link>
            <span>·</span>
            <Link
              href="/contact"
              className="hover:text-black transition-colors"
            >
              Contact
            </Link>
            <span>·</span>
            <Link
              href="/plan-du-site"
              className="hover:text-black transition-colors"
            >
              Plan du site
            </Link>
          </div>

          <div className="mt-8 border-t border-black/5 pt-6 text-[11px] text-neutral-400">
            © {new Date().getFullYear()} Boutique Milina — Élégance · Raffinement · Exclusivité
          </div>
          <a
            href="https://www.instagram.com/ne__dev"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Développé par Ne__dev
          </a>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      {whatsappVisible && whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-green-200/40 active:scale-95 md:bottom-8 md:left-8 bottom-[76px] left-4"
          style={{ animation: 'whatsapp-pulse 2s ease-in-out infinite' }}
        >
          <IconWhatsApp size={28} />
        </a>
      )}

      {/* Mobile Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-neutral-200 px-2 py-2 backdrop-blur md:hidden"
        style={{ 
          backgroundColor: 'var(--bottombar-bg, rgba(255,255,255,0.95))',
          color: 'var(--bottombar-icon-text, #000000)'
        }}
      >
        <Link href="/" className="group flex flex-col items-center gap-1 transition-all active:scale-95">
          <LucideStore size={22} strokeWidth={1.5} className="transition-transform group-hover:-translate-y-0.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Boutique</span>
        </Link>
        <Link href="/favoris" className="group flex flex-col items-center gap-1 transition-all active:scale-95">
          <div className="relative transition-transform group-hover:-translate-y-0.5">
            <LucideHeart size={22} strokeWidth={1.5} />
            {favorites.length > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {favorites.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Favoris</span>
        </Link>
        <Link href="/commander" className="group flex flex-col items-center gap-1 transition-all active:scale-95">
          <div className="relative transition-transform group-hover:-translate-y-0.5">
            <LucideShoppingCart size={22} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white shadow-sm">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Panier</span>
        </Link>
      </nav>
    </div>
  );
}