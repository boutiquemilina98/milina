"use client";

import { useEffect, useState } from "react";
import { IconSearch } from "@/components/store/Icons";

interface CustomerRow {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  wilaya: string | null;
  totalOrders: number;
  totalSpent: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => {
        setCustomers(d.customers ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Clients</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {customers.length} clients au total
        </p>
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
              placeholder="Rechercher un client..."
              className="admin-input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-neutral-500">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">Aucun client.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Wilaya</th>
                <th>Commandes</th>
                <th>Total dépensé</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-neutral-500">{c.email}</div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.wilaya}</td>
                  <td>{c.totalOrders}</td>
                  <td className="font-semibold">
                    {parseFloat(c.totalSpent).toLocaleString("fr-DZ")} DA
                  </td>
                  <td className="text-xs text-neutral-500">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}