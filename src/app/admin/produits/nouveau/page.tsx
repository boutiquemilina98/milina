"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconCheck,
} from "@/components/store/Icons";
import type { CategoryDTO, ProductImage, ProductVariant } from "@/lib/types";

// Compress image to reduce base64 size (max 800px, JPEG quality 0.7)
function compressImage(file: File, maxSize = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    if (file.type.startsWith("video/")) {
      // Don't compress videos, just read as base64
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width;
      let h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = url;
  });
}

interface FormImage extends ProductImage {
  file?: File;
}

interface Form {
  slug: string;
  name: string;
  description: string;
  categoryId: number | null;
  price: string;
  comparePrice: string;
  currency: string;
  images: FormImage[];
  sizes: string[];
  variants: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
}

const EMPTY: Form = {
  slug: "",
  name: "",
  description: "",
  categoryId: null,
  price: "",
  comparePrice: "",
  currency: "DA",
  images: [],
  sizes: [],
  variants: [],
  tags: [],
  isFeatured: false,
  isActive: true,
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [variantColor, setVariantColor] = useState("");
  const [variantSize, setVariantSize] = useState("");
  const [variantQty, setVariantQty] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => {
      setCategories(d.categories ?? []);
    });
  }, []);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Extract unique colors from images
  const imageColors = [...new Set(form.images.map((img) => img.color).filter(Boolean))];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    try {
      const payload: any = {
        ...form,
        slug: form.slug || slugify(form.name),
        price: parseFloat(form.price) || 0,
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        images: [],
      };

      // Create Supabase client for uploading
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      for (const img of form.images) {
        if (img.file) {
          // Upload to Supabase Storage bucket 'media'
          const fileExt = img.file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data, error } = await supabase.storage.from("media").upload(fileName, img.file);
          if (error) {
            throw new Error(`Échec de l'upload: ${error.message}`);
          }
          const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(data.path);
          payload.images.push({ color: img.color, url: publicUrlData.publicUrl });
        } else {
          payload.images.push({ color: img.color, url: img.url });
        }
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error(res.status === 413 ? "Le fichier est trop volumineux" : "Erreur de serveur");
      }
      
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Erreur");
      router.push("/admin/produits");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const addVariant = () => {
    const c = variantColor.trim();
    const s = variantSize.trim();
    const q = parseInt(variantQty) || 0;
    if (!c || !s) return;
    // Check if variant already exists
    const exists = form.variants.some((v) => v.color === c && v.size === s);
    if (exists) return;
    setForm((f) => ({ ...f, variants: [...f.variants, { color: c, size: s, quantity: q }] }));
    setVariantQty("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/produits"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 hover:border-black"
        >
          <IconArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold">Nouveau produit</h1>
          <p className="text-sm text-neutral-500">
            Ajoutez un nouvel article à votre catalogue
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Informations générales</h2>
            <div className="space-y-4">
              <Field label="Nom du produit *">
                <input
                  required
                  className="admin-input"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.slug || slugify(e.target.value),
                    }));
                  }}
                />
              </Field>
              <Field label="Slug (URL) *">
                <input
                  required
                  className="admin-input"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={4}
                  className="admin-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Field>
              <Field label="Catégorie">
                <select
                  className="admin-input"
                  value={form.categoryId ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoryId: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                >
                  <option value="">— Aucune —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Images with color linking */}
          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Images & Vidéos</h2>
            <p className="mb-3 text-xs text-neutral-500">
              Ajoutez vos images et vidéos, puis spécifiez la couleur sous chaque média.
            </p>
            <div className="mb-4">
              <label className="admin-btn-outline cursor-pointer whitespace-nowrap inline-flex">
                <IconPlus size={14} />
                <span className="ml-1">Ajouter médias (Images/Vidéos)</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files) return;
                    for (const file of Array.from(files)) {
                      if (file.type.startsWith("video/")) {
                        // Store the original video file to be sent via FormData
                        setForm((f) => ({
                          ...f,
                          images: [...f.images, { url: URL.createObjectURL(file), color: "", file }],
                        }));
                      } else {
                        const compressed = await compressImage(file);
                        setForm((f) => ({
                          ...f,
                          images: [...f.images, { url: compressed, color: "" }],
                        }));
                      }
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {form.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {form.images.map((img, idx) => (
                  <div key={idx} className="group relative rounded-lg border border-neutral-200 p-2">
                    <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-md bg-neutral-100">
                      {img.url.startsWith("data:video/") ? (
                        <video src={img.url} className="h-full w-full object-cover" controls />
                      ) : (
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            images: f.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-500 shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                    <input
                      placeholder="Couleur (ex: Noir)"
                      value={img.color}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        setForm((f) => {
                          const newImages = [...f.images];
                          newImages[idx] = { ...newImages[idx], color: newColor };
                          return { ...f, images: newImages };
                        });
                      }}
                      className="admin-input h-8 w-full px-2 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants: Tailles & Tags */}
          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Tailles & Tags</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <ChipInput
                label="Tailles (S, M, L...)"
                value={sizeInput}
                onChange={setSizeInput}
                items={form.sizes}
                onAdd={(v) => {
                  setForm((f) => ({ ...f, sizes: [...f.sizes, v] }));
                  setSizeInput("");
                }}
                onRemove={(v) =>
                  setForm((f) => ({
                    ...f,
                    sizes: f.sizes.filter((s) => s !== v),
                  }))
                }
              />
              <ChipInput
                label="Tags (nouveau, solde...)"
                value={tagInput}
                onChange={setTagInput}
                items={form.tags}
                onAdd={(v) => {
                  setForm((f) => ({ ...f, tags: [...f.tags, v] }));
                  setTagInput("");
                }}
                onRemove={(v) =>
                  setForm((f) => ({
                    ...f,
                    tags: f.tags.filter((s) => s !== v),
                  }))
                }
              />
            </div>
          </div>

          {/* Stock per variant */}
          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Stock par variante (Couleur + Taille)</h2>
            <p className="mb-3 text-xs text-neutral-500">
              Définissez la quantité disponible pour chaque combinaison couleur + taille.
            </p>

            <div className="flex flex-wrap items-end gap-2 mb-4">
              <div className="flex-1 min-w-[120px]">
                <span className="admin-label">Couleur</span>
                <select
                  className="admin-input"
                  value={variantColor}
                  onChange={(e) => setVariantColor(e.target.value)}
                >
                  <option value="">— Choisir —</option>
                  {imageColors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <span className="admin-label">Taille</span>
                <select
                  className="admin-input"
                  value={variantSize}
                  onChange={(e) => setVariantSize(e.target.value)}
                >
                  <option value="">— Choisir —</option>
                  {form.sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <span className="admin-label">Quantité</span>
                <input
                  type="number"
                  min={0}
                  className="admin-input"
                  value={variantQty}
                  onChange={(e) => setVariantQty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addVariant(); }
                  }}
                />
              </div>
              <button type="button" onClick={addVariant} className="admin-btn-outline h-[42px]">
                <IconPlus size={14} />
              </button>
            </div>

            {/* Auto-generate all combinations button */}
            {imageColors.length > 0 && form.sizes.length > 0 && (
              <button
                type="button"
                className="mb-4 text-xs text-blue-600 hover:underline"
                onClick={() => {
                  const newVariants: ProductVariant[] = [];
                  for (const c of imageColors) {
                    for (const s of form.sizes) {
                      if (!form.variants.some((v) => v.color === c && v.size === s)) {
                        newVariants.push({ color: c, size: s, quantity: 0 });
                      }
                    }
                  }
                  if (newVariants.length > 0) {
                    setForm((f) => ({ ...f, variants: [...f.variants, ...newVariants] }));
                  }
                }}
              >
                ✦ Générer toutes les combinaisons manquantes
              </button>
            )}

            {form.variants.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-neutral-100">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Couleur</th>
                      <th>Taille</th>
                      <th>Quantité</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((v, i) => (
                      <tr key={`${v.color}-${v.size}`}>
                        <td className="font-medium">{v.color}</td>
                        <td>{v.size}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            className="admin-input w-20"
                            value={v.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0;
                              setForm((f) => ({
                                ...f,
                                variants: f.variants.map((vr, vi) =>
                                  vi === i ? { ...vr, quantity: qty } : vr
                                ),
                              }));
                            }}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                variants: f.variants.filter((_, vi) => vi !== i),
                              }))
                            }
                            className="rounded p-1 text-red-500 hover:bg-red-50"
                          >
                            <IconTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {form.variants.length > 0 && (
              <p className="mt-2 text-xs text-neutral-500">
                Stock total : {form.variants.reduce((s, v) => s + v.quantity, 0)} unités
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Prix</h2>
            <div className="space-y-4">
              <Field label="Prix (DA) *">
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  className="admin-input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </Field>
              <Field label="Prix barré (DA)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="admin-input"
                  value={form.comparePrice}
                  onChange={(e) =>
                    setForm({ ...form, comparePrice: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>

          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Visibilité</h2>
            <div className="space-y-3">
              <Toggle
                label="Produit actif"
                desc="Affiché sur la boutique"
                value={form.isActive}
                onChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Toggle
                label="Mis en avant"
                desc="Affiché sur la page d'accueil"
                value={form.isFeatured}
                onChange={(v) => setForm({ ...form, isFeatured: v })}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="admin-btn justify-center"
            >
              {submitting ? (
                "Création..."
              ) : (
                <>
                  <IconCheck size={16} /> Créer le produit
                </>
              )}
            </button>
            <Link href="/admin/produits" className="admin-btn-outline justify-center">
              Annuler
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      {children}
    </label>
  );
}

function ChipInput({
  label,
  value,
  onChange,
  items,
  onAdd,
  onRemove,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  return (
    <div>
      <span className="admin-label">{label}</span>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (value.trim()) onAdd(value.trim());
            }
          }}
        />
        <button
          type="button"
          onClick={() => value.trim() && onAdd(value.trim())}
          className="admin-btn-outline"
        >
          <IconPlus size={14} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((it) => (
          <span
            key={it}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm"
          >
            {it}
            <button
              type="button"
              onClick={() => onRemove(it)}
              className="text-neutral-500 hover:text-red-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <div>
        <div className="text-sm font-medium text-black">{label}</div>
        <div className="text-xs text-neutral-500">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-black" : "bg-neutral-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}