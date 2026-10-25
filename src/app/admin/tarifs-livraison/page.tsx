"use client";

import { useEffect, useState } from "react";
import { getShippingRates, saveShippingRates } from "./actions";
import { WILAYAS } from "@/lib/format";
import { IconCheck, IconChevronRight } from "@/components/store/Icons";

export default function TarifsLivraisonPage() {
  const [rates, setRates] = useState<Record<string, { home: number; desk: number }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getShippingRates().then((data) => {
      // Initialize with existing data or defaults
      const initRates: Record<string, { home: number; desk: number }> = {};
      WILAYAS.forEach((w) => {
        initRates[w] = data[w] || { home: 0, desk: 0 };
      });
      setRates(initRates);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    await saveShippingRates(rates);
    setSuccess(true);
    setSaving(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const updateRate = (wilaya: string, type: "home" | "desk", value: string) => {
    const num = parseInt(value) || 0;
    setRates((prev) => ({
      ...prev,
      [wilaya]: {
        ...prev[wilaya],
        [type]: num,
      },
    }));
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Tarifs de livraison</h1>
          <p className="mt-2 text-neutral-500">
            Définissez les coûts de livraison pour chaque wilaya (en DA).
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-smooth hover:bg-neutral-800 disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : success ? "Enregistré" : "Sauvegarder"}
          {success ? <IconCheck size={16} /> : <IconChevronRight size={16} />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {WILAYAS.map((w, index) => (
          <div
            key={w}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-smooth hover:border-black/50"
          >
            <div className="mb-4 flex items-center font-semibold text-black">
              <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              {w}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-neutral-600">
                  À domicile
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={rates[w]?.home === 0 ? "" : rates[w]?.home || ""}
                    onChange={(e) => updateRate(w, "home", e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm outline-none transition-smooth focus:border-black"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                    DA
                  </span>
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-neutral-600">
                  Au bureau / Stop desk
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={rates[w]?.desk === 0 ? "" : rates[w]?.desk || ""}
                    onChange={(e) => updateRate(w, "desk", e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm outline-none transition-smooth focus:border-black"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                    DA
                  </span>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
