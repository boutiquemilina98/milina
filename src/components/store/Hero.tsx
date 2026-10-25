"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconArrowLeft, IconPlay, IconPause } from "./Icons";

interface Props {
  title: string;
  subtitle?: string;
  mediaUrls: string[];
  interval?: number;
  ctaHref?: string;
  ctaText?: string;
  ctaVisible?: boolean;
  fontFamily?: string;
  titleColor?: string;
  subtitleColor?: string;
  ctaBgColor?: string;
  ctaTextColor?: string;
  ctaBorderColor?: string;
  titleItalic?: boolean;
}

export function Hero({
  title,
  subtitle,
  mediaUrls: rawMediaUrls,
  interval = 5,
  ctaHref = "/",
  ctaText = "Shop Now",
  ctaVisible = true,
  fontFamily = "'Playfair Display', serif",
  titleColor = "#ffffff",
  subtitleColor = "#ffffff",
  ctaBgColor = "rgba(0,0,0,0.8)",
  ctaTextColor = "#ffffff",
  ctaBorderColor = "rgba(255,255,255,0.2)",
  titleItalic = true,
}: Props) {
  // Defensive normalization: ensure mediaUrls is a flat array of clean string URLs
  const mediaUrls: string[] = (Array.isArray(rawMediaUrls) ? rawMediaUrls : [rawMediaUrls])
    .flat(Infinity as any)
    .map((item: any) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        if ("url" in item && typeof item.url === "string") return item.url.trim();
        if ("src" in item && typeof item.src === "string") return item.src.trim();
      }
      return "";
    })
    .filter((u): u is string => typeof u === "string" && u.length > 0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || mediaUrls.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, mediaUrls.length, interval]);

  const handleNext = () => {
    if (mediaUrls.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const handlePrev = () => {
    if (mediaUrls.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  const scrollToContent = () => {
    const el = document.getElementById("features-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (!mediaUrls || mediaUrls.length === 0) return null;

  return (
    <section className="relative overflow-hidden group">
      <div className="relative w-full h-[85vh] md:h-[90vh]">
        {mediaUrls.map((item, idx) => {
          const url = typeof item === "string" ? item : String(item || "");
          const isVideo =
            url.startsWith("data:video/") ||
            /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url) ||
            url.includes("video");
          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {isVideo ? (
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  autoPlay={idx === currentIndex}
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={url}
                  alt={title}
                  fill
                  priority={idx === 0}
                  className="object-cover"
                />
              )}
            </div>
          );
        })}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 z-20" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white z-30">
          {/* Main title */}
          <h1 
            className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl drop-shadow-lg leading-tight"
            style={{
              fontFamily: fontFamily || "'Playfair Display', 'Amiri', serif",
              color: titleColor || "#ffffff",
            }}
          >
            {titleItalic ? (
              <span className="italic">{title || "Boutique Milina"}</span>
            ) : (
              <span>{title || "Boutique Milina"}</span>
            )}
          </h1>

          {/* Subtitle */}
          {subtitle && subtitle.trim() !== "" && (
            <p
              className="mt-5 text-[10px] uppercase tracking-[0.5em] md:text-xs opacity-90 font-medium"
              style={{ color: subtitleColor || "#ffffff" }}
            >
              {subtitle}
            </p>
          )}

          {/* CTA Button */}
          {ctaVisible !== false && (
            <Link
              href={ctaHref}
              className="mt-8 inline-flex items-center gap-2 backdrop-blur-sm border px-10 py-3.5 text-xs font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:opacity-90 hover:scale-105"
              style={{
                backgroundColor: ctaBgColor || "rgba(0,0,0,0.8)",
                color: ctaTextColor || "#ffffff",
                borderColor: ctaBorderColor || "rgba(255,255,255,0.2)",
              }}
            >
              {ctaText || "Shop Now"} <span className="ml-1">→</span>
            </Link>
          )}
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] font-medium">Défiler</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="animate-scroll-bounce"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Controls */}
        {mediaUrls.length > 1 && (
          <>
            {/* Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 rounded-full bg-black/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/50 opacity-0 group-hover:opacity-100 md:left-8"
              aria-label="Précédent"
            >
              <IconArrowLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 rounded-full bg-black/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/50 opacity-0 group-hover:opacity-100 md:right-8"
              aria-label="Suivant"
            >
              <IconArrowRight size={24} />
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute bottom-6 right-6 z-40 rounded-full bg-black/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/50 md:bottom-8 md:right-8"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <IconPause size={20} /> : <IconPlay size={20} />}
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2">
              {mediaUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                  }`}
                  aria-label={`Aller à la diapositive ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}