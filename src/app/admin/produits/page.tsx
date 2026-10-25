"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconEye,
} from "@/components/store/Icons";
import type { ProductDTO } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setLoading(false);
      });
  };
  useEffect(() => { load(); }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Produits</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gérez votre catalogue ({products.length} produits)
          </p>
        </div>
        <Link href="/admin/produits/nouveau" className="admin-btn">
          <IconPlus size={16} /> Nouveau produit
        </Link>
      </div>

      <div className="admin-card">
        <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <IconSearch size={16} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="admin-input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-neutral-500">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">
            Aucun produit trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>État</th>
                  <th>Mis en avant</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {p.images[0] && (
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-black">{p.name}</div>
                          <div className="text-xs text-neutral-500">
                            /{p.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium">
                      {p.price.toLocaleString("fr-DZ")} {p.currency}
                      {p.comparePrice && (
                        <span className="ml-2 text-xs text-neutral-400 line-through">
                          {p.comparePrice.toLocaleString("fr-DZ")}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          p.totalStock > 0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {p.totalStock > 0 ? `${p.totalStock} en stock` : "Rupture"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          p.isActive
                            ? "bg-blue-50 text-blue-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {p.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td>
                      {p.isFeatured ? (
                        <span className="admin-badge bg-purple-50 text-purple-700">
                          ★ Vedette
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/produit/${p.slug}`}
                          target="_blank"
                          aria-label="Voir"
                          className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black"
                        >
                          <IconEye size={16} />
                        </Link>
                        <Link
                          href={`/admin/produits/${p.id}`}
                          aria-label="Modifier"
                          className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black"
                        >
                          <IconEdit size={16} />
                        </Link>
                        <button
                          type="button"
                          aria-label="Supprimer"
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="rounded-md p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}