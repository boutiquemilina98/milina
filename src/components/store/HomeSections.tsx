"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  IconStar,
  IconEye,
  IconClose,
  IconChevronLeft,
  IconChevronRight,
  IconWhatsApp,
  IconInstagram,
  IconFacebook,
} from "./Icons";
import type { CustomerReviewDTO } from "@/lib/types";

/* ========= BRAND STATS SECTION ========= */
export function BrandStats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: "+1200", label: "Clientes Satisfaites" },
    { value: "58", label: "Wilayas Livrées" },
    { value: "24h", label: "Échange Garanti" },
    { value: "4.9★", label: "Note Moyenne" },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ backgroundColor: "#000000" }}>
      {/* Decorative border */}
      <div className="mx-4 md:mx-8 my-0">
        <div className="brand-border-glow rounded-none py-14 px-6 md:py-20 md:px-12 text-center">
          {/* Logo */}
          <h2
            className="text-2xl md:text-3xl font-bold uppercase tracking-[0.4em] text-white mb-6"
            style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
          >
            Boutique Milina
          </h2>

          {/* Tagline */}
          <p className="mx-auto max-w-lg text-sm md:text-base leading-relaxed text-white/60 italic">
            L&apos;univers de l&apos;élégance intemporelle, où chaque pièce est choisie
            avec exigence pour révéler votre style.
          </p>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {["Élégance", "Raffinement", "Exclusivité"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/20 px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats grid */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center ${
                  isVisible ? "animate-count-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <span
                  className="text-2xl md:text-3xl font-bold gradient-text-gold"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {stat.value}
                </span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========= CUSTOMER REVIEWS (SCREENSHOTS) SECTION ========= */
export function Testimonials({
  reviews: initialReviews,
  title = "Ce que disent nos clientes",
  subtitle = "Découvrez les captures et retours réels de nos clientes satisfaites",
  visible = true,
}: {
  reviews?: CustomerReviewDTO[];
  title?: string;
  subtitle?: string;
  visible?: boolean;
}) {
  const [reviews, setReviews] = useState<CustomerReviewDTO[]>(
    initialReviews || []
  );
  const [activeReviewIndex, setActiveReviewIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialReviews !== undefined) {
      setReviews(initialReviews);
    } else {
      // Fetch if not provided as props
      fetch("/api/admin/reviews")
        .then((r) => r.json())
        .then((data) => {
          if (data.reviews) setReviews(data.reviews);
        })
        .catch(() => {});
    }
  }, [initialReviews]);

  const activeReviews = reviews.filter((r) => r.isActive !== false);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Lightbox keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activeReviewIndex === null) return;
      if (e.key === "Escape") setActiveReviewIndex(null);
      if (e.key === "ArrowLeft") {
        setActiveReviewIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : activeReviews.length - 1
        );
      }
      if (e.key === "ArrowRight") {
        setActiveReviewIndex((prev) =>
          prev !== null && prev < activeReviews.length - 1 ? prev + 1 : 0
        );
      }
    },
    [activeReviewIndex, activeReviews.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!visible || activeReviews.length === 0) {
    return null;
  }

  const selectedReview =
    activeReviewIndex !== null ? activeReviews[activeReviewIndex] : null;

  return (
    <section
      id="avis"
      className="relative overflow-hidden px-4 py-16 md:px-8 md:py-24"
      style={{ backgroundColor: "var(--store-bg, #ffffff)" }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Heading with subtle Algerian luxury aesthetic */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1 text-xs font-semibold text-amber-900 mb-3">
              <IconStar size={12} filled className="text-amber-500" />
              <span>Avis & Retours Vérifiés</span>
            </div>
            <h2
              className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl"
              style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
            >
              {title}
            </h2>
            <p className="mt-2 text-sm text-neutral-500 max-w-xl">
              {subtitle}
            </p>
          </div>

          {/* Carousel Arrows (Desktop & Tablet) */}
          {activeReviews.length > 3 && (
            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => scroll("left")}
                aria-label="Précédent"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-black active:scale-95"
              >
                <IconChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Suivant"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-black active:scale-95"
              >
                <IconChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Reviews Grid / Scrollable Cards Container */}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar mt-10 flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-3"
        >
          {activeReviews.map((rev, idx) => (
            <div
              key={rev.id || idx}
              onClick={() => setActiveReviewIndex(idx)}
              className="group relative flex-none w-[280px] sm:w-[320px] md:w-auto snap-center cursor-pointer flex flex-col rounded-3xl border border-neutral-100 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-neutral-200"
            >
              {/* Phone Screenshot Mockup Container */}
              <div className="relative aspect-[9/15] w-full overflow-hidden rounded-2xl bg-neutral-950 shadow-inner">
                <img
                  src={rev.imageUrl}
                  alt={rev.clientName || "Capture d'avis"}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                    <IconEye size={20} />
                  </div>
                  <span className="mt-2 text-xs font-semibold text-white tracking-wide">
                    Cliquer pour agrandir
                  </span>
                </div>

                {/* Platform Badge */}
                <div className="absolute left-3 top-3 z-10">
                  {rev.platform === "whatsapp" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                      <IconWhatsApp size={12} /> WhatsApp
                    </span>
                  )}
                  {rev.platform === "instagram" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                      <IconInstagram size={12} /> Instagram
                    </span>
                  )}
                  {rev.platform === "facebook" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1877F2] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                      <IconFacebook size={12} /> Facebook
                    </span>
                  )}
                  {(!rev.platform || rev.platform === "autre") && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                      <IconStar size={12} filled className="text-amber-400" /> Avis vérifié
                    </span>
                  )}
                </div>
              </div>

              {/* Review Card Info */}
              <div className="mt-3.5 px-1 pb-1">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, j) => (
                      <IconStar key={j} size={14} filled />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Vérifié ✓
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {rev.clientName || "Cliente Milina"}
                  </h3>
                  {rev.city && (
                    <span className="text-xs text-neutral-400 shrink-0">
                      {rev.city}
                    </span>
                  )}
                </div>

                {rev.caption && (
                  <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2 leading-relaxed italic">
                    &ldquo;{rev.caption}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Guidance */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-neutral-400 md:hidden">
          <span>Glissez pour voir d&apos;autres captures</span>
          <IconChevronRight size={14} />
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedReview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={() => setActiveReviewIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setActiveReviewIndex(null)}
            aria-label="Fermer"
            className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 hover:scale-105"
          >
            <IconClose size={22} />
          </button>

          {/* Previous Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveReviewIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : activeReviews.length - 1
              );
            }}
            aria-label="Capture précédente"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 hover:scale-110 active:scale-95"
          >
            <IconChevronLeft size={24} />
          </button>

          {/* Next Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveReviewIndex((prev) =>
                prev !== null && prev < activeReviews.length - 1 ? prev + 1 : 0
              );
            }}
            aria-label="Capture suivante"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 hover:scale-110 active:scale-95"
          >
            <IconChevronRight size={24} />
          </button>

          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] max-w-lg flex-col items-center justify-center rounded-2xl overflow-hidden bg-neutral-950 p-2 shadow-2xl"
          >
            {/* Modal Image */}
            <img
              src={selectedReview.imageUrl}
              alt={selectedReview.clientName || "Avis vérifié"}
              className="max-h-[78vh] w-auto rounded-xl object-contain shadow-2xl"
            />

            {/* Modal Bottom Bar */}
            <div className="w-full mt-3 px-4 py-2 flex items-center justify-between text-white/90">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {selectedReview.clientName || "Cliente"}
                  </span>
                  {selectedReview.city && (
                    <span className="text-xs text-white/60">
                      • {selectedReview.city}
                    </span>
                  )}
                </div>
                {selectedReview.caption && (
                  <p className="text-xs text-white/70 italic mt-0.5 line-clamp-1">
                    {selectedReview.caption}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: selectedReview.rating || 5 }).map((_, j) => (
                  <IconStar key={j} size={14} filled />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


/* ========= FAQ SECTION ========= */
const faqs = [
  {
    question: "Comment passer commande ?",
    answer:
      "Ajoutez vos articles au panier, validez et remplissez vos coordonnées. Notre équipe vous confirmera la commande par téléphone ou WhatsApp.",
  },
  {
    question: "Quels sont les délais de livraison ?",
    answer:
      "La livraison est assurée entre 24h et 72h selon votre wilaya. Nous livrons les 58 wilayas d'Algérie.",
  },
  {
    question: "Puis-je échanger un article ?",
    answer:
      "Oui, les échanges sont possibles dans les 24 heures suivant la réception de votre commande. Contactez-nous par WhatsApp pour organiser l'échange.",
  },
  {
    question: "Comment payer ma commande ?",
    answer:
      "Le paiement se fait à la livraison (COD). Vous payez uniquement quand vous recevez votre colis.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-neutral-100">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-neutral-600"
      >
        <span className="text-sm font-semibold text-gray-900 pr-4">{question}</span>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center text-neutral-400 transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>
      <div className={`faq-answer ${open ? "open" : ""}`}>
        <p className="pb-5 text-sm leading-relaxed text-neutral-500">{answer}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="px-4 py-16 md:px-8 md:py-20" style={{ backgroundColor: "var(--store-bg, #ffffff)" }}>
      <div className="mx-auto max-w-2xl">
        {/* Section heading */}
        <div className="text-center">
          <h2
            className="text-2xl md:text-3xl font-bold italic text-gray-900"
            style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
          >
            Questions fréquentes
          </h2>
          <p className="mt-3 text-sm text-neutral-500">
            Tout ce que vous devez savoir
          </p>
        </div>

        {/* FAQ items */}
        <div className="mt-10 border-t border-neutral-100">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========= NEWSLETTER SECTION ========= */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmail("");
    }
  };

  return (
    <section className="px-4 py-16 md:px-8" style={{ backgroundColor: "#faf7f4" }}>
      <div className="mx-auto max-w-xl text-center">
        <h2
          className="text-2xl md:text-3xl font-bold italic text-gray-900"
          style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
        >
          Restez élégante
        </h2>
        <p className="mt-3 text-sm text-neutral-500">
          Recevez nos nouveautés et offres exclusives avant tout le monde
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex gap-0 overflow-hidden rounded-full border border-neutral-300 bg-white">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            required
            className="newsletter-input flex-1 bg-transparent px-5 py-3 text-sm text-gray-900 placeholder:text-neutral-400 outline-none"
          />
          <button
            type="submit"
            disabled={submitted}
            className="shrink-0 bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitted ? "Merci !" : "S'abonner"}
          </button>
        </form>
      </div>
    </section>
  );
}
