"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconSearch, IconClose } from "./Icons";

interface Result {
  slug: string;
  name: string;
  price: number;
  image: string;
}

export function SearchBar({ onResultClick }: { onResultClick?: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(term)}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        setResults(
          (data.products ?? []).slice(0, 8).map((p: any) => ({
            slug: p.slug,
            name: p.name,
            price: p.price,
            image: p.images?.[0] ?? "",
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [q]);

  return (
    <div className="mt-6">
      <div className="relative">
        <input
          autoFocus
          type="text"
          placeholder="Rechercher des produits..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-full border border-neutral-200 bg-white px-5 py-3 pr-12 text-base outline-none transition-smooth focus:border-black"
        />
        {q && (
          <button
            type="button"
            aria-label="Effacer"
            onClick={() => setQ("")}
            className="absolute right-12 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-neutral-100"
          >
            <IconClose size={16} />
          </button>
        )}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
          <IconSearch size={20} />
        </span>
      </div>

      <div className="mt-6">
        {loading && (
          <p className="text-sm text-neutral-500">Recherche en cours...</p>
        )}
        {!loading && q && results.length === 0 && (
          <p className="text-sm text-neutral-500">Aucun produit trouvé.</p>
        )}
        <ul className="divide-y divide-neutral-100">
          {results.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/produit/${r.slug}`}
                onClick={onResultClick}
                className="flex items-center gap-4 py-3 transition-smooth hover:bg-neutral-50"
              >
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.name}
                    className="h-14 w-14 rounded-md object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium text-black">{r.name}</div>
                  <div className="text-sm text-neutral-500">
                    {r.price.toLocaleString("fr-DZ")} DA
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}