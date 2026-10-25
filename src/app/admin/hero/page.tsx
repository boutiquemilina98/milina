"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  IconImage,
  IconCheck,
  IconTrash,
  IconPlus,
  IconExternal,
  IconClose,
  IconPlay,
  IconArrowLeft,
  IconArrowRight,
} from "@/components/store/Icons";

interface HeroData {
  visible: boolean;
  title: string;
  subtitle: string;
  media: string[];
  interval: number;
  autoplay: boolean;
  ctaText: string;
  ctaLink: string;
  ctaVisible: boolean;
  fontFamily: string;
  titleColor: string;
  subtitleColor: string;
  ctaBgColor: string;
  ctaTextColor: string;
  ctaBorderColor: string;
  titleItalic: boolean;
}

const FONTS_LIST = [
  {
    id: "playfair",
    name: "Playfair Display",
    fontFamily: "'Playfair Display', serif",
    category: "Serif Classique",
    desc: "أناقة كلاسيكية فاخرة تناسب القفاطين والأزياء الملكية",
    previewText: "Caftan Royal Milina",
  },
  {
    id: "amiri",
    name: "Amiri (خط أميري)",
    fontFamily: "'Amiri', serif",
    category: "Arabic Serif",
    desc: "خط عربي ملكي تقليدي ذو هيبة وفخامة وأصالة",
    previewText: "ميلينا فخامة وأصالة مغربية",
  },
  {
    id: "cairo",
    name: "Cairo (خط كايرو)",
    fontFamily: "'Cairo', sans-serif",
    category: "Arabic Modern",
    desc: "خط عربي عصري وحديث بنسب متناسقة وواضحة جداً",
    previewText: "أزياء راقية لكل المناسبات",
  },
  {
    id: "tajawal",
    name: "Tajawal (خط تجوال)",
    fontFamily: "'Tajawal', sans-serif",
    category: "Arabic Geometric",
    desc: "خط عربي ناعم وهندسي أنيق يمنح لمسة راقية",
    previewText: "تشكيلة القفطان الحصرية",
  },
  {
    id: "cormorant",
    name: "Cormorant Garamond",
    fontFamily: "'Cormorant Garamond', serif",
    category: "Haute Couture",
    desc: "سيريف فرنسي ناعم مستوحى من دور الأزياء العالمية",
    previewText: "Haute Couture & Élégance",
  },
  {
    id: "cinzel",
    name: "Cinzel",
    fontFamily: "'Cinzel', serif",
    category: "Royal Roman",
    desc: "طابع إمبراطوري روماني كلاسيكي رزين وجريء",
    previewText: "ROYAL LUXURY EDITION",
  },
  {
    id: "inter",
    name: "Inter",
    fontFamily: "'Inter', sans-serif",
    category: "Clean Minimal",
    desc: "طراز مينيماليست حديث وعالمي",
    previewText: "Modern Minimal Fashion",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    fontFamily: "'Montserrat', sans-serif",
    category: "Geometric Sans",
    desc: "خط عصري قوي وجذاب وبارز للأحرف اللاتينية",
    previewText: "Contemporary Luxury Store",
  },
];

const COLOR_PRESETS = [
  { name: "Blanc", value: "#ffffff" },
  { name: "Or Champagne", value: "#dfba73" },
  { name: "Or Rose", value: "#e0a899" },
  { name: "Doré Royal", value: "#c5a059" },
  { name: "Noir", value: "#000000" },
  { name: "Crème", value: "#fdfbf7" },
  { name: "Bordeaux", value: "#9b111e" },
  { name: "Émeraude", value: "#14453d" },
];

function ColorField({
  label,
  description,
  value,
  onChange,
  defaultValue = "#ffffff",
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (val: string) => void;
  defaultValue?: string;
}) {
  const hexValue =
    value?.startsWith("#") && (value.length === 7 || value.length === 4)
      ? value
      : value?.startsWith("rgba(0,0,0")
      ? "#000000"
      : value?.startsWith("rgba(255,255,255")
      ? "#ffffff"
      : defaultValue.startsWith("#")
      ? defaultValue
      : "#ffffff";

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4 transition-all hover:border-neutral-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="text-xs font-bold text-neutral-800">{label}</label>
          {description && (
            <p className="mt-0.5 text-[11px] text-neutral-500">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-neutral-300 shadow-inner">
            <input
              type="color"
              value={hexValue}
              onChange={(e) => onChange(e.target.value)}
              className="absolute -top-2 -left-2 h-12 w-12 cursor-pointer border-0 p-0"
              title="Choisir une couleur"
            />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-mono font-semibold uppercase text-neutral-800 focus:border-black focus:outline-none"
            placeholder="#FFFFFF"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200/60">
        <span className="text-[10px] text-neutral-400 mr-1">Palettes :</span>
        {COLOR_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => onChange(p.value)}
            className="group relative flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] text-neutral-600 hover:border-neutral-400 hover:text-black transition-colors"
            title={`${p.name} (${p.value})`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: p.value }}
            />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminHeroPage() {
  const [hero, setHero] = useState<HeroData>({
    visible: true,
    title: "CAFTAN LE ROYAL",
    subtitle: "",
    media: [],
    interval: 5,
    autoplay: true,
    ctaText: "Shop Now",
    ctaLink: "/",
    ctaVisible: true,
    fontFamily: "'Playfair Display', serif",
    titleColor: "#ffffff",
    subtitleColor: "#ffffff",
    ctaBgColor: "rgba(0,0,0,0.8)",
    ctaTextColor: "#ffffff",
    ctaBorderColor: "rgba(255,255,255,0.2)",
    titleItalic: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual URL Modal
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  // Live preview active slide
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero");
      const data = await res.json();
      if (data.hero) {
        setHero((prev) => ({
          ...prev,
          ...data.hero,
          fontFamily: data.hero.fontFamily || prev.fontFamily,
          titleColor: data.hero.titleColor || prev.titleColor,
          subtitleColor: data.hero.subtitleColor || prev.subtitleColor,
          ctaBgColor: data.hero.ctaBgColor || prev.ctaBgColor,
          ctaTextColor: data.hero.ctaTextColor || prev.ctaTextColor,
          ctaBorderColor: data.hero.ctaBorderColor || prev.ctaBorderColor,
          titleItalic: data.hero.titleItalic !== undefined ? Boolean(data.hero.titleItalic) : prev.titleItalic,
        }));
      }
    } catch (err) {
      console.error("Erreur de chargement du Hero:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  // Upload handler for Hero images/videos
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);
    const newMediaUrls: string[] = [];

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Upload ${i + 1}/${files.length} : ${file.name}...`);

        let publicUrl = "";

        try {
          const fileExt = file.name.split(".").pop() || "jpg";
          const fileName = `hero-${Date.now()}-${Math.random().toString(36).substring(5)}.${fileExt}`;

          const { data, error } = await supabase.storage
            .from("media")
            .upload(fileName, file, { contentType: file.type || "image/jpeg" });

          if (error) throw error;

          const { data: publicData } = supabase.storage
            .from("media")
            .getPublicUrl(data.path);

          publicUrl = publicData.publicUrl;
        } catch (storageErr) {
          console.warn("Upload Supabase storage failed, using fallback data URL", storageErr);
          publicUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        newMediaUrls.push(publicUrl);
      }

      setHero((prev) => ({
        ...prev,
        media: [...prev.media, ...newMediaUrls],
      }));
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erreur pendant le téléversement"
      );
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    setHero((prev) => ({
      ...prev,
      media: [...prev.media, manualUrl.trim()],
    }));
    setManualUrl("");
    setShowUrlModal(false);
  };

  const removeMedia = (index: number) => {
    if (!confirm("Supprimer cette diapositive du Hero ?")) return;
    setHero((prev) => {
      const updated = prev.media.filter((_, i) => i !== index);
      return { ...prev, media: updated };
    });
    if (previewSlideIndex >= hero.media.length - 1) {
      setPreviewSlideIndex(Math.max(0, hero.media.length - 2));
    }
  };

  const moveMedia = (index: number, direction: "prev" | "next") => {
    const targetIndex = direction === "prev" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= hero.media.length) return;
    setHero((prev) => {
      const copy = [...prev.media];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, media: copy };
    });
  };

  const isVideoMedia = (url: string) => {
    return (
      url.startsWith("data:video/") ||
      /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url) ||
      url.includes("video")
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-neutral-500">
        <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
        Chargement de la configuration du Hero...
      </div>
    );
  }

  const currentMedia = hero.media[previewSlideIndex] || hero.media[0] || "";

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold">Bannière Hero</h1>
            <span className="rounded-full bg-neutral-100 px-3 py-0.5 text-xs font-semibold text-neutral-800">
              Page d&apos;accueil
            </span>
          </div>
          <p className="mt-1.5 text-sm text-neutral-500">
            Personnalisez facilement la grande bannière principale, le diaporama d&apos;images/vidéos, les textes et le bouton d&apos;action.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="admin-btn-outline text-xs"
          >
            <IconExternal size={15} /> Voir sur la boutique
          </Link>
          <button
            onClick={() => handleSave()}
            disabled={saving || uploading}
            className="admin-btn"
          >
            {saving ? (
              "Enregistrement..."
            ) : saved ? (
              <>
                <IconCheck size={16} /> Enregistré !
              </>
            ) : (
              <>
                <IconCheck size={16} /> Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div>{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700"
          >
            <IconClose size={16} />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          <IconCheck size={18} className="text-green-600" />
          La bannière Hero a été enregistrée avec succès et est en ligne sur votre boutique !
        </div>
      )}

      {/* Hero Visibility Card */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold">
              Affichage de la bannière Hero
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Activez ou masquez la bannière Hero en haut de la page d&apos;accueil de votre boutique.
            </p>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={hero.visible}
              onChange={(e) =>
                setHero({ ...hero, visible: e.target.checked })
              }
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full" />
            <span className="ml-3 text-sm font-semibold text-neutral-800">
              {hero.visible ? "Activée" : "Masquée"}
            </span>
          </label>
        </div>
      </div>

      {/* Media Management Card */}
      <div className="admin-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold">
              Images & Vidéos du Diaporama ({hero.media.length})
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Téléversez les photos et vidéos de fond haute définition qui défilent dans le Hero.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUrlModal(true)}
              className="admin-btn-outline text-xs"
            >
              Ajouter par URL
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="admin-btn text-xs"
            >
              <IconPlus size={16} /> Ajouter des médias
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Upload Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="group mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-8 text-center transition-all duration-200 hover:border-black hover:bg-neutral-100/50"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-110 text-neutral-700">
            <IconImage size={28} />
          </div>
          <div className="mt-4 font-medium text-neutral-800">
            Glissez-déposez vos photos ou vidéos ici
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">
            ou <span className="font-semibold text-black underline">cliquez pour sélectionner</span> des fichiers (PNG, JPG, MP4, WebP)
          </p>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-neutral-100 p-3 text-sm text-neutral-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <span>{uploadProgress || "Téléversement en cours..."}</span>
          </div>
        )}

        {/* Media Slides List */}
        {hero.media.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Ordre d&apos;apparition des diapositives
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {hero.media.map((url, idx) => {
                const isVid = isVideoMedia(url);
                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-sm flex flex-col"
                  >
                    {/* Media Preview Box */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden flex items-center justify-center bg-black">
                      {isVid ? (
                        <>
                          <video
                            src={url}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black">
                              <IconPlay size={18} />
                            </span>
                          </div>
                        </>
                      ) : (
                        <img
                          src={url}
                          alt={`Slide ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      )}

                      {/* Slide badge */}
                      <div className="absolute left-2.5 top-2.5 z-10">
                        <span className="rounded-md bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white">
                          #{idx + 1} {idx === 0 ? "• Principale" : ""}
                        </span>
                      </div>

                      {/* Media type badge */}
                      <div className="absolute right-2.5 top-2.5 z-10">
                        <span className="rounded-md bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-black uppercase">
                          {isVid ? "Vidéo" : "Image"}
                        </span>
                      </div>
                    </div>

                    {/* Controls Footer */}
                    <div className="flex items-center justify-between bg-white p-2.5 border-t border-neutral-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveMedia(idx, "prev")}
                          disabled={idx === 0}
                          title="Déplacer vers la gauche"
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                        >
                          <IconArrowLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMedia(idx, "next")}
                          disabled={idx === hero.media.length - 1}
                          title="Déplacer vers la droite"
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                        >
                          <IconArrowRight size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Supprimer cette diapositive"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Animation & Slideshow Settings Card */}
      <div className="admin-card p-6">
        <h2 className="font-serif text-lg font-bold">
          Animation & Défilement
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Contrôlez la vitesse de défilement automatique des diapositives du Hero.
        </p>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {/* Interval */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="admin-label !mb-0">
                Temps par diapositive
              </span>
              <span className="text-xs font-bold text-neutral-800">
                {hero.interval} secondes
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={hero.interval}
              onChange={(e) =>
                setHero({ ...hero, interval: parseInt(e.target.value, 10) || 5 })
              }
              className="w-full accent-black cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
              <span>Rapide (2s)</span>
              <span>Normal (5s)</span>
              <span>Lent (15s)</span>
            </div>
          </div>

          {/* Autoplay */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-100 p-4 bg-neutral-50/50">
            <div>
              <div className="text-sm font-semibold text-neutral-900">
                Changement automatique
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                Passe automatiquement à la diapositive suivante
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={hero.autoplay}
                onChange={(e) =>
                  setHero({ ...hero, autoplay: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      </div>

      {/* Texts & Button Customizer Card */}
      <div className="admin-card p-6">
        <h2 className="font-serif text-lg font-bold">
          Textes & Bouton d&apos;Action
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Modifiez le titre affiché au centre de la bannière ainsi que le bouton d&apos;action.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {/* Main Title */}
          <div>
            <label className="admin-label">Titre principal du Hero</label>
            <input
              type="text"
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              placeholder="ex: CAFTAN LE ROYAL ou Milina Luxury"
              className="admin-input"
            />
            <p className="mt-1 text-[11px] text-neutral-400">
              S&apos;affiche en grand au centre de la bannière.
            </p>
          </div>

          {/* Subtitle / Badge */}
          <div>
            <label className="admin-label">
              Sous-titre / Badge supérieur (Optionnel)
            </label>
            <input
              type="text"
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              placeholder="Laissez vide pour masquer"
              className="admin-input"
            />
            <p className="mt-1 text-[11px] text-neutral-400">
              Laissez ce champ vide si vous ne souhaitez aucun texte au-dessus du titre.
            </p>
          </div>

          {/* CTA Text */}
          <div>
            <label className="admin-label">Texte du bouton</label>
            <input
              type="text"
              value={hero.ctaText}
              onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
              placeholder="ex: Shop Now ou Découvrir la collection"
              className="admin-input"
            />
          </div>

          {/* CTA Link */}
          <div>
            <label className="admin-label">Lien de destination du bouton</label>
            <input
              type="text"
              value={hero.ctaLink}
              onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
              placeholder="ex: / ou #avis ou /categorie/robes"
              className="admin-input"
            />
          </div>

          {/* CTA Visibility switch */}
          <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-neutral-100 p-4 bg-neutral-50/50">
            <div>
              <div className="text-sm font-semibold text-neutral-900">
                Afficher le bouton d&apos;action (CTA)
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                Affiche le bouton pour inciter vos visiteurs à explorer la collection
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={hero.ctaVisible}
                onChange={(e) =>
                  setHero({ ...hero, ctaVisible: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      </div>

      {/* Typography & Colors Customization Card */}
      <div className="admin-card p-6 space-y-7">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold">
              Typographie & Couleurs des Textes
            </h2>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700">
              Personnalisation Visuelle
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Choisissez la police d&apos;écriture (arabe ou latine) et définissez les couleurs exactes des titres et boutons.
          </p>
        </div>

        {/* 1. Font Family Picker */}
        <div>
          <label className="admin-label !mb-2 flex items-center justify-between">
            <span>Police d&apos;écriture du titre (Font Family)</span>
            <span className="text-[11px] text-neutral-400 font-normal">
              Active : <strong className="text-black">{hero.fontFamily}</strong>
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FONTS_LIST.map((font) => {
              const isSelected = hero.fontFamily === font.fontFamily;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setHero({ ...hero, fontFamily: font.fontFamily })}
                  className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-black bg-neutral-900 text-white shadow-md ring-2 ring-black/10"
                      : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50 text-neutral-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{font.name}</span>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {font.category}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-[11px] leading-tight ${
                        isSelected ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {font.desc}
                    </p>
                  </div>

                  <div
                    className={`mt-3 pt-2.5 border-t text-sm tracking-wide truncate ${
                      isSelected
                        ? "border-white/10 text-white"
                        : "border-neutral-100 text-neutral-900"
                    }`}
                    style={{ fontFamily: font.fontFamily }}
                  >
                    {font.previewText}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Font family input */}
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-500">Ou saisir une police CSS spécifique :</span>
              <input
                type="text"
                value={hero.fontFamily}
                onChange={(e) => setHero({ ...hero, fontFamily: e.target.value })}
                placeholder="'Cinzel', serif"
                className="w-72 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-mono text-neutral-800 focus:border-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Text Style Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-neutral-100 p-4 bg-neutral-50/50">
          <div>
            <div className="text-sm font-semibold text-neutral-900">
              Style Italique pour le Titre
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">
              Donne une touche inclinée et luxueuse au titre principal au centre du Hero
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={hero.titleItalic}
              onChange={(e) =>
                setHero({ ...hero, titleItalic: e.target.checked })
              }
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full" />
          </label>
        </div>

        {/* 3. Text & Button Colors */}
        <div>
          <label className="admin-label !mb-3">Couleurs des Éléments du Hero</label>
          <div className="grid gap-4 md:grid-cols-2">
            <ColorField
              label="Couleur du Titre Principal"
              description="Couleur appliquée au grand titre au centre du Hero"
              value={hero.titleColor}
              onChange={(val) => setHero({ ...hero, titleColor: val })}
              defaultValue="#ffffff"
            />

            <ColorField
              label="Couleur du Sous-titre / Badge"
              description="Couleur appliquée au petit texte au-dessus du titre"
              value={hero.subtitleColor}
              onChange={(val) => setHero({ ...hero, subtitleColor: val })}
              defaultValue="#ffffff"
            />

            <ColorField
              label="Bouton (CTA) : Couleur du texte"
              description="Couleur du texte et de la flèche du bouton"
              value={hero.ctaTextColor}
              onChange={(val) => setHero({ ...hero, ctaTextColor: val })}
              defaultValue="#ffffff"
            />

            <ColorField
              label="Bouton (CTA) : Arrière-plan"
              description="Couleur de fond du bouton (ex: #000000 ou rgba(0,0,0,0.8))"
              value={hero.ctaBgColor}
              onChange={(val) => setHero({ ...hero, ctaBgColor: val })}
              defaultValue="rgba(0,0,0,0.8)"
            />

            <div className="md:col-span-2">
              <ColorField
                label="Bouton (CTA) : Couleur de la bordure"
                description="Couleur du contour subtil du bouton"
                value={hero.ctaBorderColor}
                onChange={(val) => setHero({ ...hero, ctaBorderColor: val })}
                defaultValue="rgba(255,255,255,0.2)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Visual Preview Card */}
      <div className="admin-card overflow-hidden">
        <div className="border-b border-neutral-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold">
                Aperçu en direct
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Visualisez le rendu exact de la bannière Hero telle qu&apos;elle apparaîtra sur votre boutique.
              </p>
            </div>

            {hero.media.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewSlideIndex((p) =>
                      p > 0 ? p - 1 : hero.media.length - 1
                    )
                  }
                  className="rounded-full border border-neutral-200 bg-white p-1.5 text-neutral-600 hover:bg-neutral-50"
                  title="Diapositive précédente"
                >
                  <IconArrowLeft size={14} />
                </button>
                <span className="text-xs font-semibold px-2">
                  {previewSlideIndex + 1} / {hero.media.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewSlideIndex((p) =>
                      p < hero.media.length - 1 ? p + 1 : 0
                    )
                  }
                  className="rounded-full border border-neutral-200 bg-white p-1.5 text-neutral-600 hover:bg-neutral-50"
                  title="Diapositive suivante"
                >
                  <IconArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Miniature Hero Banner */}
        <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full overflow-hidden bg-neutral-950 flex items-center justify-center text-center text-white">
          {currentMedia ? (
            isVideoMedia(currentMedia) ? (
              <video
                src={currentMedia}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={currentMedia}
                alt="Aperçu Hero"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-500 text-sm">
              Aucune image téléversée pour le moment
            </div>
          )}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15 z-10" />

          {/* Banner Content */}
          <div className="relative z-20 px-4 py-8 flex flex-col items-center">
            {hero.subtitle && hero.subtitle.trim() !== "" && (
              <span
                className="mb-3 text-[10px] md:text-xs uppercase tracking-[0.4em] font-medium"
                style={{ color: hero.subtitleColor || "#ffffff" }}
              >
                {hero.subtitle}
              </span>
            )}

            <h3
              className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-md leading-tight"
              style={{
                fontFamily: hero.fontFamily || "'Playfair Display', serif",
                color: hero.titleColor || "#ffffff",
              }}
            >
              {hero.titleItalic ? (
                <span className="italic">{hero.title || "Boutique Milina"}</span>
              ) : (
                <span>{hero.title || "Boutique Milina"}</span>
              )}
            </h3>

            {hero.ctaVisible && (
              <div
                className="mt-5 inline-flex items-center gap-2 rounded-none backdrop-blur-sm border px-7 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em]"
                style={{
                  backgroundColor: hero.ctaBgColor || "rgba(0,0,0,0.8)",
                  color: hero.ctaTextColor || "#ffffff",
                  borderColor: hero.ctaBorderColor || "rgba(255,255,255,0.2)",
                }}
              >
                {hero.ctaText || "Shop Now"} →
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div>
          <div className="text-sm font-semibold">
            {hero.visible ? "Bannière Hero activée" : "Bannière Hero masquée"} • {hero.media.length} diapositive{hero.media.length > 1 ? "s" : ""}
          </div>
          <p className="text-xs text-neutral-400">
            N&apos;oubliez pas d&apos;enregistrer pour publier les changements sur votre boutique.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving || uploading}
          className="admin-btn"
        >
          {saving ? (
            "Enregistrement..."
          ) : saved ? (
            <>
              <IconCheck size={16} /> Enregistré ✓
            </>
          ) : (
            <>
              <IconCheck size={16} /> Enregistrer les modifications
            </>
          )}
        </button>
      </div>

      {/* Manual URL Modal */}
      {showUrlModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowUrlModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold">Ajouter par URL</h3>
              <button
                onClick={() => setShowUrlModal(false)}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <IconClose size={18} />
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Collez le lien direct vers une image ou une vidéo (MP4/WebP/JPG/PNG).
            </p>

            <div className="mt-4">
              <label className="admin-label">Lien URL du média</label>
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... ou https://.../video.mp4"
                className="admin-input"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="admin-btn-outline text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddManualUrl}
                disabled={!manualUrl.trim()}
                className="admin-btn text-xs"
              >
                Ajouter la diapositive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
