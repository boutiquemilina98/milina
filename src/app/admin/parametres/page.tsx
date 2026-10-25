"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconCheck, IconTrash } from "@/components/store/Icons";

const FIELDS = [
  { key: "site_name", label: "Nom du site", type: "text" },
  { key: "site_tagline", label: "Slogan", type: "text" },
  { key: "shipping_notice", label: "Bandeau d'annonce", type: "text" },
  { key: "contact_email", label: "Email de contact", type: "email" },
  { key: "contact_phone", label: "Téléphone", type: "tel" },
  { key: "contact_address", label: "Adresse", type: "text" },
  { key: "instagram_url", label: "Instagram URL", type: "url" },
  { key: "facebook_url", label: "Facebook URL", type: "url" },
  { key: "tiktok_url", label: "TikTok URL", type: "url" },
  { key: "whatsapp_number", label: "Numéro WhatsApp (ex: 213660989407)", type: "text" },
  { key: "about_text", label: "Texte 'À propos'", type: "textarea" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(d.settings ?? {})) {
          normalized[k] =
            typeof v === "string" ? v : v ? JSON.stringify(v) : "";
        }
        setSettings(normalized);
        setLoading(false);
      });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Paramètres</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Personnalisez votre boutique Milina Luxury
        </p>
      </div>

      {loading ? (
        <p className="text-neutral-500">Chargement...</p>
      ) : (
        <form onSubmit={save} className="admin-card p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {FIELDS.map((f) => (
              <label
                key={f.key}
                className={`block ${f.type === "textarea" ? "md:col-span-2" : ""}`}
              >
                <span className="admin-label">{f.label}</span>
                {f.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={settings[f.key] ?? ""}
                    onChange={(e) =>
                      setSettings({ ...settings, [f.key]: e.target.value })
                    }
                    className="admin-input"
                  />
                ) : (
                  <input
                    type={f.type}
                    value={settings[f.key] ?? ""}
                    onChange={(e) =>
                      setSettings({ ...settings, [f.key]: e.target.value })
                    }
                    className="admin-input"
                  />
                )}
              </label>
            ))}
          </div>

          <div className="mt-8 border-t border-neutral-100 pt-6">
            <h2 className="mb-4 font-serif text-xl font-bold">Images & Logos</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div>
                  <h3 className="font-semibold text-sm text-neutral-900">Bannière Hero (Diaporama, Vidéos & Textes)</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">La gestion complète de la bannière Hero se trouve désormais dans son propre onglet dédié.</p>
                </div>
                <Link href="/admin/hero" className="admin-btn text-xs shrink-0">
                  Gérer la Bannière Hero →
                </Link>
              </div>
              <div>
                <ImageField
                  label="Logo principal"
                  value={settings["logo_image"] ?? ""}
                  onChange={(v) => setSettings({ ...settings, logo_image: v })}
                />
                <label className="mt-4 block">
                  <span className="admin-label">Taille (Hauteur en px)</span>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={settings["logo_size"] ?? "40"}
                    onChange={(e) => setSettings({ ...settings, logo_size: e.target.value })}
                    className="w-full accent-black"
                  />
                  <div className="text-right text-xs text-neutral-500">{settings["logo_size"] ?? "40"}px</div>
                </label>
              </div>
              <div>
                <ImageField
                  label="Logo du footer"
                  value={settings["footer_logo_image"] ?? ""}
                  onChange={(v) => setSettings({ ...settings, footer_logo_image: v })}
                />
                <label className="mt-4 block">
                  <span className="admin-label">Taille (Hauteur en px)</span>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    value={settings["footer_logo_size"] ?? "64"}
                    onChange={(e) => setSettings({ ...settings, footer_logo_size: e.target.value })}
                    className="w-full accent-black"
                  />
                  <div className="text-right text-xs text-neutral-500">{settings["footer_logo_size"] ?? "64"}px</div>
                </label>
              </div>
              <ImageField
                label="Favicon (Icône de l'onglet)"
                value={settings["favicon_image"] ?? ""}
                onChange={(v) => setSettings({ ...settings, favicon_image: v })}
              />
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-100 pt-6">
            <h2 className="mb-4 font-serif text-xl font-bold">WhatsApp</h2>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings["whatsapp_visible"] === "true"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_visible: e.target.checked ? "true" : "false",
                    })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-[#25D366] peer-checked:after:translate-x-full" />
              </label>
              <span className="text-sm text-neutral-700">
                {settings["whatsapp_visible"] === "true"
                  ? "Icône WhatsApp visible sur le site"
                  : "Icône WhatsApp masquée"}
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              L&apos;icône flottante WhatsApp s&apos;affichera en bas à droite du site lorsqu&apos;elle est activée et qu&apos;un numéro WhatsApp est configuré ci-dessus.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5">
            <button type="submit" disabled={saving} className="admin-btn">
              {saving ? "Enregistrement..." : (
                <>
                  <IconCheck size={16} /> Enregistrer
                </>
              )}
            </button>
            {saved && (
              <span className="text-sm text-green-600">
                Paramètres enregistrés ✓
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => {
              onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
          className="admin-input flex-1 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-neutral-200"
        />
        {value && (
          <div className="group relative mt-2 h-24 w-auto self-start overflow-hidden rounded border border-neutral-200 bg-neutral-50 flex items-center justify-center p-2">
            <img src={value} alt="" className="h-full w-auto object-contain" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 group-hover:opacity-100 shadow"
            >
              <IconTrash size={14} />
            </button>
          </div>
        )}
      </div>
    </label>
  );
}

function MultiMediaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string; // JSON string of string[] or single string
  onChange: (v: string) => void;
}) {
  let items: string[] = [];
  try {
    items = value ? JSON.parse(value) : [];
    if (!Array.isArray(items)) items = value ? [value] : [];
  } catch {
    items = value ? [value] : [];
  }

  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => {
            const files = e.target.files;
            if (!files) return;
            const newItems = [...items];
            let loaded = 0;
            Array.from(files).forEach((file) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                newItems.push(reader.result as string);
                loaded++;
                if (loaded === files.length) {
                  onChange(JSON.stringify(newItems));
                }
              };
              reader.readAsDataURL(file);
            });
            e.target.value = "";
          }}
          className="admin-input flex-1 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-neutral-200"
        />
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {items.map((item, idx) => (
              <div key={idx} className="group relative h-24 w-24 overflow-hidden rounded border border-neutral-200 bg-neutral-50 flex items-center justify-center p-1">
                {item.startsWith("data:video/") ? (
                  <video src={item} className="h-full w-full object-cover" />
                ) : (
                  <img src={item} alt="" className="h-full w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const newItems = items.filter((_, i) => i !== idx);
                    onChange(JSON.stringify(newItems));
                  }}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 group-hover:opacity-100 shadow"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}
