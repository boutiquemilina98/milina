"use client";

import { useEffect, useState } from "react";
import { IconEye } from "@/components/store/Icons";
import type { OrderDTO } from "@/lib/types";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [viewing, setViewing] = useState<OrderDTO | null>(null);

  const load = () => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders ?? []);
        setLoading(false);
      });
  };
  useEffect(() => load, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Commandes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Gérez les commandes de votre boutique ({orders.length} au total)
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === s
                ? "bg-black text-white"
                : "border border-neutral-200 hover:border-black"
            }`}
          >
            {s === "all" ? "Toutes" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="p-10 text-center text-neutral-500">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">
            Aucune commande pour ce filtre.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Client</th>
                  <th>Wilaya</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs">{o.orderNumber}</td>
                    <td>
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-neutral-500">
                        {o.customerPhone}
                      </div>
                    </td>
                    <td>{o.wilaya}</td>
                    <td className="font-semibold">
                      {o.total.toLocaleString("fr-DZ")} DA
                    </td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="rounded-md border border-neutral-200 px-2 py-1 text-xs"
                        style={{
                          background: `${STATUS_COLORS[o.status]}15`,
                          color: STATUS_COLORS[o.status],
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-xs text-neutral-500">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setViewing(o)}
                        className="rounded p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black"
                      >
                        <IconEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="admin-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold">
                  Commande {viewing.orderNumber}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {new Date(viewing.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded p-2 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs uppercase tracking-wider text-neutral-500">
                  Client
                </h3>
                <p className="font-medium">{viewing.customerName}</p>
                <p className="text-sm text-neutral-600">{viewing.customerPhone}</p>
                {viewing.customerEmail && (
                  <p className="text-sm text-neutral-600">
                    {viewing.customerEmail}
                  </p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-xs uppercase tracking-wider text-neutral-500">
                  Livraison
                </h3>
                <p className="text-sm">{viewing.wilaya}</p>
                <p className="text-sm">{viewing.commune}</p>
                <p className="text-sm text-neutral-600">{viewing.address}</p>
              </div>
            </div>

            <h3 className="mb-2 mt-6 text-xs uppercase tracking-wider text-neutral-500">
              Articles
            </h3>
            <ul className="space-y-2">
              {viewing.items.map((it, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-neutral-500">
                      {it.size && `T:${it.size}`} {it.color && `· C:${it.color}`} · ×
                      {it.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {(it.price * it.quantity).toLocaleString("fr-DZ")} DA
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 border-t border-neutral-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{viewing.subtotal.toLocaleString("fr-DZ")} DA</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{viewing.shipping.toLocaleString("fr-DZ")} DA</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{viewing.total.toLocaleString("fr-DZ")} DA</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}