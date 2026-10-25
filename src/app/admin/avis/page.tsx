"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  IconStar,
  IconPlus,
  IconTrash,
  IconCheck,
  IconExternal,
  IconEye,
  IconClose,
  IconWhatsApp,
  IconInstagram,
  IconFacebook,
  IconArrowLeft,
  IconArrowRight,
} from "@/components/store/Icons";
import type { CustomerReviewDTO } from "@/lib/types";

export default function AdminAvisPage() {
  const [reviews, setReviews] = useState<CustomerReviewDTO[]>([]);
  const [sectionTitle, setSectionTitle] = useState("Ce que disent nos clientes");
  const [sectionSubtitle, setSectionSubtitle] = useState(
    "Découvrez les retours et captures réels de nos clientes satisfaites"
  );
  const [sectionVisible, setSectionVisible] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lightbox preview modal
  const [previewReview, setPreviewReview] = useState<CustomerReviewDTO | null>(null);

  // Manual URL modal
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
      if (data.title) setSectionTitle(data.title);
      if (data.subtitle) setSectionSubtitle(data.subtitle);
      if (data.visible !== undefined) setSectionVisible(data.visible);
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews,
          title: sectionTitle,
          subtitle: sectionSubtitle,
          visible: sectionVisible,
        }),
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

  // Upload handler for screenshots
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);
    const newItems: CustomerReviewDTO[] = [];

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Upload ${i + 1}/${files.length} : ${file.name}...`);

        let publicUrl = "";

        try {
          const fileExt = file.name.split(".").pop() || "jpg";
          const fileName = `review-${Date.now()}-${Math.random().toString(36).substring(5)}.${fileExt}`;

          const { data, error } = await supabase.storage
            .from("media")
            .upload(fileName, file, { contentType: file.type || "image/jpeg" });

          if (error) {
            throw error;
          }

          const { data: publicData } = supabase.storage
            .from("media")
            .getPublicUrl(data.path);

          publicUrl = publicData.publicUrl;
        } catch (storageErr) {
          console.warn("Supabase storage upload failed, converting to compressed data URL fallback", storageErr);
          // Fallback to data URL
          publicUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        const newReview: CustomerReviewDTO = {
          id: `rev_${Date.now()}_${Math.random().toString(36).substring(4)}`,
          imageUrl: publicUrl,
          clientName: `Cliente ${reviews.length + newItems.length + 1}`,
          city: "Alger",
          platform: "whatsapp",
          rating: 5,
          caption: "Avis reçu via WhatsApp / Message",
          isActive: true,
          sortOrder: reviews.length + newItems.length,
          createdAt: new Date().toISOString(),
        };

        newItems.push(newReview);
      }

      setReviews((prev) => [...prev, ...newItems]);
      setUploadProgress(null);
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
    const newReview: CustomerReviewDTO = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(4)}`,
      imageUrl: manualUrl.trim(),
      clientName: `Cliente ${reviews.length + 1}`,
      city: "Alger",
      platform: "whatsapp",
      rating: 5,
      caption: "Avis client",
      isActive: true,
      sortOrder: reviews.length,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [...prev, newReview]);
    setManualUrl("");
    setShowUrlModal(false);
  };

  const updateReview = (id: string, updates: Partial<CustomerReviewDTO>) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteReview = (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette capture d'avis ?")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const moveReview = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reviews.length) return;
    setReviews((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const activeCount = reviews.filter((r) => r.isActive).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold">Avis clients</h1>
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
              Captures d&apos;écran
            </span>
          </div>
          <p className="mt-1.5 text-sm text-neutral-500">
            Téléversez des captures d&apos;écran réelles de vos clientes (WhatsApp, Instagram, messages) pour remplacer les avis textuels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#avis"
            target="_blank"
            className="admin-btn-outline text-xs"
          >
            <IconExternal size={15} /> Voir sur la boutique
          </Link>
          <button
            onClick={handleSave}
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
          Les modifications des avis clients ont été enregistrées avec succès et sont en ligne sur la boutique !
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="admin-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Total des captures
          </div>
          <div className="mt-2 font-serif text-3xl font-bold">{reviews.length}</div>
          <div className="mt-1 text-xs text-neutral-400">Captures téléversées</div>
        </div>

        <div className="admin-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Avis actifs sur le site
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-green-600">
            {activeCount}
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            Visibles par les visiteurs
          </div>
        </div>

        <div className="admin-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Section sur la boutique
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                sectionVisible ? "text-green-600" : "text-neutral-400"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  sectionVisible ? "bg-green-500" : "bg-neutral-300"
                }`}
              />
              {sectionVisible ? "Section affichée" : "Section masquée"}
            </span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={sectionVisible}
                onChange={(e) => setSectionVisible(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      </div>

      {/* Section Settings Accordion / Box */}
      <div className="admin-card p-6">
        <h2 className="font-serif text-lg font-bold">
          Personnalisation du titre de la section
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Modifiez le texte d&apos;en-tête affiché au-dessus des captures d&apos;avis sur la page d&apos;accueil.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="admin-label">Titre principal</label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="ex: Ce que disent nos clientes"
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Sous-titre explicatif</label>
            <input
              type="text"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              placeholder="ex: Découvrez les captures et retours de nos clientes..."
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="admin-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold">
              Ajouter de nouvelles captures d&apos;écran
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Téléversez des captures WhatsApp, Instagram, Facebook ou SMS (PNG, JPG, WEBP).
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
              <IconPlus size={16} /> Parcourir les fichiers
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Drag and Drop Box */}
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-110">
            <IconStar size={28} className="text-amber-500" filled />
          </div>
          <div className="mt-4 font-medium text-neutral-800">
            Glissez-déposez vos captures d&apos;écran ici
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">
            ou <span className="font-semibold text-black underline">cliquez pour sélectionner</span> depuis votre appareil
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="rounded bg-neutral-200/60 px-2 py-0.5">PNG</span>
            <span className="rounded bg-neutral-200/60 px-2 py-0.5">JPG</span>
            <span className="rounded bg-neutral-200/60 px-2 py-0.5">WEBP</span>
            <span>• Sélection multiple supportée</span>
          </div>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-neutral-100 p-3 text-sm text-neutral-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <span>{uploadProgress || "Téléversement en cours vers Supabase..."}</span>
          </div>
        )}
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold">
            Captures d&apos;avis ({reviews.length})
          </h2>
          <span className="text-xs text-neutral-500">
            Utilisez les flèches pour réordonner les avis
          </span>
        </div>

        {loading ? (
          <div className="admin-card flex items-center justify-center p-12 text-sm text-neutral-500">
            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            Chargement des avis...
          </div>
        ) : reviews.length === 0 ? (
          <div className="admin-card flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <IconStar size={32} />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold">
              Aucune capture d&apos;avis pour le moment
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-neutral-500">
              Commencez par téléverser des captures d&apos;écran de messages de vos clientes pour les afficher élégamment sur votre boutique.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="admin-btn mt-5 text-xs"
            >
              <IconPlus size={16} /> Ajouter une capture
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((rev, index) => {
              return (
                <div
                  key={rev.id}
                  className={`admin-card overflow-hidden transition-all duration-200 ${
                    !rev.isActive ? "opacity-60 bg-neutral-50" : "bg-white"
                  }`}
                >
                  {/* Top Bar with ordering and visibility */}
                  <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-neutral-400">
                        #{index + 1}
                      </span>
                      {/* Move up / down buttons */}
                      <button
                        type="button"
                        onClick={() => moveReview(index, "up")}
                        disabled={index === 0}
                        title="Monter"
                        className="rounded p-1 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"
                      >
                        <IconArrowLeft size={14} className="rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveReview(index, "down")}
                        disabled={index === reviews.length - 1}
                        title="Descendre"
                        className="rounded p-1 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"
                      >
                        <IconArrowRight size={14} className="rotate-90" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={rev.isActive}
                          onChange={(e) =>
                            updateReview(rev.id, { isActive: e.target.checked })
                          }
                          className="h-3.5 w-3.5 rounded border-neutral-300 accent-black"
                        />
                        <span className={rev.isActive ? "font-semibold text-green-700" : "text-neutral-400"}>
                          {rev.isActive ? "Actif" : "Masqué"}
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => deleteReview(rev.id)}
                        className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Supprimer cette capture"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Image Screenshot Preview */}
                  <div className="relative aspect-[9/14] w-full overflow-hidden bg-neutral-900 group">
                    <img
                      src={rev.imageUrl}
                      alt={rev.clientName || "Capture avis"}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Magnify overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setPreviewReview(rev)}
                        className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-lg hover:bg-neutral-100"
                      >
                        <IconEye size={15} /> Agrandir la capture
                      </button>
                    </div>

                    {/* Platform Tag Badge */}
                    <div className="absolute left-3 top-3">
                      {rev.platform === "whatsapp" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                          <IconWhatsApp size={13} /> WhatsApp
                        </span>
                      )}
                      {rev.platform === "instagram" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                          <IconInstagram size={13} /> Instagram
                        </span>
                      )}
                      {rev.platform === "facebook" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1877F2] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                          <IconFacebook size={13} /> Facebook
                        </span>
                      )}
                      {rev.platform === "autre" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                          <IconStar size={13} /> Avis vérifié
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-3.5 p-4">
                    {/* Source / Platform Selector */}
                    <div>
                      <span className="admin-label text-[11px]">Source de l&apos;avis</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: "whatsapp", label: "WhatsApp" },
                          { id: "instagram", label: "Instagram" },
                          { id: "facebook", label: "Facebook" },
                          { id: "autre", label: "Autre" },
                        ].map((plat) => (
                          <button
                            key={plat.id}
                            type="button"
                            onClick={() =>
                              updateReview(rev.id, {
                                platform: plat.id as CustomerReviewDTO["platform"],
                              })
                            }
                            className={`rounded-lg py-1.5 text-center text-xs font-medium transition-all ${
                              rev.platform === plat.id
                                ? "bg-black text-white"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            {plat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customer Name & City */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="admin-label text-[11px]">Nom cliente</span>
                        <input
                          type="text"
                          value={rev.clientName || ""}
                          onChange={(e) =>
                            updateReview(rev.id, { clientName: e.target.value })
                          }
                          placeholder="ex: Sarah M."
                          className="admin-input !py-1.5 !text-xs"
                        />
                      </div>
                      <div>
                        <span className="admin-label text-[11px]">Wilaya / Ville</span>
                        <input
                          type="text"
                          value={rev.city || ""}
                          onChange={(e) =>
                            updateReview(rev.id, { city: e.target.value })
                          }
                          placeholder="ex: Alger"
                          className="admin-input !py-1.5 !text-xs"
                        />
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div>
                      <span className="admin-label text-[11px]">Note accordée</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateReview(rev.id, { rating: star })}
                            className="p-0.5 text-amber-400 hover:scale-125 transition-transform"
                          >
                            <IconStar
                              size={18}
                              filled={star <= (rev.rating || 5)}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-semibold text-neutral-600">
                          {rev.rating || 5}/5
                        </span>
                      </div>
                    </div>

                    {/* Short Caption / Highlight */}
                    <div>
                      <span className="admin-label text-[11px]">
                        Extrait / Remarque (Optionnel)
                      </span>
                      <textarea
                        rows={2}
                        value={rev.caption || ""}
                        onChange={(e) =>
                          updateReview(rev.id, { caption: e.target.value })
                        }
                        placeholder="ex: Qualité incroyable et livraison ultra rapide !"
                        className="admin-input !py-1.5 !text-xs resize-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Save Bar */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div>
            <div className="text-sm font-semibold">
              {reviews.length} capture{reviews.length > 1 ? "s" : ""} au total ({activeCount} active{activeCount > 1 ? "s" : ""})
            </div>
            <p className="text-xs text-neutral-400">
              N&apos;oubliez pas d&apos;enregistrer pour publier les changements sur la boutique.
            </p>
          </div>
          <button
            onClick={handleSave}
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
      )}

      {/* Fullscreen Lightbox Preview Modal */}
      {previewReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewReview(null)}
        >
          <div
            className="relative flex max-h-[92vh] max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 p-4">
              <div>
                <h3 className="font-serif text-lg font-bold">
                  {previewReview.clientName || "Capture d'avis"}
                </h3>
                <p className="text-xs text-neutral-500">
                  {previewReview.city ? `${previewReview.city} • ` : ""}
                  Source : {previewReview.platform?.toUpperCase() || "WHATSAPP"}
                </p>
              </div>
              <button
                onClick={() => setPreviewReview(null)}
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
              >
                <IconClose size={20} />
              </button>
            </div>

            <div className="overflow-auto p-4 flex items-center justify-center bg-neutral-900">
              <img
                src={previewReview.imageUrl}
                alt={previewReview.clientName || "Avis"}
                className="max-h-[75vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

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
              Collez le lien direct vers l&apos;image d&apos;une capture d&apos;écran.
            </p>

            <div className="mt-4">
              <label className="admin-label">Lien URL de l&apos;image</label>
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://exemple.com/capture.jpg"
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
                Ajouter la capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
