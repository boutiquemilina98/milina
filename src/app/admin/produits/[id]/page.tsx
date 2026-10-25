"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconCheck,
} from "@/components/store/Icons";
import type { CategoryDTO, ProductDTO, ProductImage, ProductVariant } from "@/lib/types";

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

interface Form {
  slug: string;
  name: string;
  description: string;
  categoryId: number | null;
  price: string;
  comparePrice: string;
  currency: string;
  images: ProductImage[];
  sizes: string[];
  variants: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [imageColorInput, setImageColorInput] = useState("");
  const [variantColor, setVariantColor] = useState("");
  const [variantSize, setVariantSize] = useState("");
  const [variantQty, setVariantQty] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => {
        const p = (d.products as ProductDTO[]).find(
          (x) => x.id === parseInt(params.id)
        );
        if (p) {
          setForm({
            slug: p.slug,
            name: p.name,
            description: p.description ?? "",
            categoryId: p.categoryId,
            price: String(p.price),
            comparePrice: p.comparePrice ? String(p.comparePrice) : "",
            currency: p.currency,
            images: p.images,
            sizes: p.sizes,
            variants: p.variants ?? [],
            tags: p.tags,
            isFeatured: p.isFeatured,
            isActive: p.isActive,
          });
        }
      });
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, [params.id]);

  // Extract unique colors from images
  const imageColors = form
    ? [...new Set(form.images.map((img) => img.color).filter(Boolean))]
    : [];

  const addVariant = () => {
    if (!form) return;
    const c = variantColor.trim();
    const s = variantSize.trim();
    const q = parseInt(variantQty) || 0;
    if (!c || !s) return;
    const exists = form.variants.some((v) => v.color === c && v.size === s);
    if (exists) return;
    setForm((f) => f && { ...f, variants: [...f.variants, { color: c, size: s, quantity: q }] });
    setVariantQty("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload: any = {
        ...form,
        price: parseFloat(form.price) || 0,
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        images: [],
      };

      // Create Supabase client for uploading
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      for (const img of form.images as any[]) {
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

      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Erreur");
      router.push("/admin/produits");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  if (!form) {
    return <p className="text-neutral-500">Chargement...</p>;
  }

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
          <h1 className="font-serif text-3xl font-bold">Modifier le produit</h1>
          <p className="text-sm text-neutral-500">{form.name}</p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Informations générales</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="admin-label">Nom</span>
                <input
                  required
                  className="admin-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="admin-label">Slug</span>
                <input
                  required
                  className="admin-input"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="admin-label">Description</span>
                <textarea
                  rows={4}
                  className="admin-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <label className="block">
                <span className="admin-label">Catégorie</span>
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
              </label>
            </div>
          </div>

          {/* Images with color linking */}
          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Images & Couleurs</h2>
            <p className="mb-3 text-xs text-neutral-500">
              Chaque image est associée à une couleur. Entrez le nom de la couleur puis choisissez les images.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                placeholder="Nom de la couleur (ex: Noir, Beige...)"
                value={imageColorInput}
                onChange={(e) => setImageColorInput(e.target.value)}
                className="admin-input flex-1"
              />
              <label className="admin-btn-outline cursor-pointer whitespace-nowrap">
                <IconPlus size={14} />
                <span className="ml-1">Ajouter images</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    const color = imageColorInput.trim();
                    if (!files || !color) {
                      alert("Veuillez entrer le nom de la couleur d'abord");
                      return;
                    }
                    for (const file of Array.from(files)) {
                      if (file.type.startsWith("video/")) {
                        setForm((f) => f && ({
                          ...f,
                          images: [...f.images, { url: URL.createObjectURL(file), color, file } as any],
                        }));
                      } else {
                        const compressed = await compressImage(file);
                        setForm((f) => f && ({
                          ...f,
                          images: [...f.images, { url: compressed, color }],
                        }));
                      }
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {/* Group images by color */}
            {imageColors.length > 0 && (
              <div className="space-y-4">
                {imageColors.map((color) => {
                  const colorImages = form.images
                    .map((img, idx) => ({ ...img, idx }))
                    .filter((img) => img.color === color);
                  return (
                    <div key={color} className="rounded-lg border border-neutral-100 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold">{color}</span>
                        <span className="text-xs text-neutral-400">{colorImages.length} image(s)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {colorImages.map((img) => (
                          <div
                            key={img.idx}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200"
                          >
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setForm((f) => f ? {
                                  ...f,
                                  images: f.images.filter((_, i) => i !== img.idx),
                                } : f)
                              }
                              className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 group-hover:opacity-100"
                            >
                              <IconTrash size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sizes & Tags */}
          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Tailles & Tags</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <ChipInput
                label="Tailles"
                value={sizeInput}
                onChange={setSizeInput}
                items={form.sizes}
                onAdd={(v) => {
                  setForm((f) => f && { ...f, sizes: [...f.sizes, v] });
                  setSizeInput("");
                }}
                onRemove={(v) =>
                  setForm((f) =>
                    f ? { ...f, sizes: f.sizes.filter((s) => s !== v) } : f
                  )
                }
              />
              <ChipInput
                label="Tags"
                value={tagInput}
                onChange={setTagInput}
                items={form.tags}
                onAdd={(v) => {
                  setForm((f) => f && { ...f, tags: [...f.tags, v] });
                  setTagInput("");
                }}
                onRemove={(v) =>
                  setForm((f) =>
                    f ? { ...f, tags: f.tags.filter((s) => s !== v) } : f
                  )
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
                    setForm((f) => f && { ...f, variants: [...f.variants, ...newVariants] });
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
                              setForm((f) => f && ({
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
                              setForm((f) => f ? {
                                ...f,
                                variants: f.variants.filter((_, vi) => vi !== i),
                              } : f)
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
              <label className="block">
                <span className="admin-label">Prix (DA)</span>
                <input
                  type="number"
                  className="admin-input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="admin-label">Prix barré (DA)</span>
                <input
                  type="number"
                  className="admin-input"
                  value={form.comparePrice}
                  onChange={(e) =>
                    setForm({ ...form, comparePrice: e.target.value })
                  }
                />
              </label>
            </div>
          </div>

          <div className="admin-card p-5">
            <h2 className="mb-4 font-semibold">Visibilité</h2>
            <div className="space-y-3">
              <Toggle
                label="Produit actif"
                value={form.isActive}
                onChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Toggle
                label="Mis en avant"
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
              {submitting ? "Enregistrement..." : (
                <>
                  <IconCheck size={16} /> Enregistrer
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
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
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