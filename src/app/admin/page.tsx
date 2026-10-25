"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconBox,
  IconTag,
  IconTrend,
  IconUsers,
  IconDollar,
  IconArrowRight,
} from "@/components/store/Icons";

interface DashboardData {
  products: number;
  categories: number;
  orders: number;
  customers: number;
  revenue: number;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  productsByCategory: Array<{ name: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="admin-card h-28 shimmer" />
        ))}
      </div>
    );
  }

  if (!data) return <p>Erreur de chargement</p>;
  if ('error' in data) return <p className="text-red-500 p-5 font-medium">Erreur: {String((data as any).error)}</p>;

  const maxCount = Math.max(1, ...data.productsByCategory.map((c) => c.count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Tableau de bord</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Vue d'ensemble de votre boutique Milina Luxury
          </p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="admin-btn"
        >
          + Nouveau produit
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IconDollar size={20} />}
          label="Revenus"
          value={`${data.revenue.toLocaleString("fr-DZ")} DA`}
          trend="+12.5%"
          color="#10b981"
        />
        <StatCard
          icon={<IconTrend size={20} />}
          label="Commandes"
          value={data.orders.toString()}
          trend="+4 cette semaine"
          color="#3b82f6"
        />
        <StatCard
          icon={<IconBox size={20} />}
          label="Produits"
          value={data.products.toString()}
          trend={`${data.categories} catégories`}
          color="#8b5cf6"
        />
        <StatCard
          icon={<IconUsers size={20} />}
          label="Clients"
          value={data.customers.toString()}
          trend="Total inscrits"
          color="#f59e0b"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="admin-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-100 p-5">
            <h2 className="font-semibold">Commandes récentes</h2>
            <Link
              href="/admin/commandes"
              className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black"
            >
              Voir tout <IconArrowRight size={14} />
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="p-10 text-center text-neutral-500">
              Aucune commande pour l'instant.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N° commande</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs">{o.orderNumber}</td>
                    <td>{o.customerName}</td>
                    <td className="font-medium">
                      {o.total.toLocaleString("fr-DZ")} DA
                    </td>
                    <td>
                      <span
                        className="admin-pill"
                        style={{
                          background: `${STATUS_COLORS[o.status] ?? "#999"}15`,
                          color: STATUS_COLORS[o.status] ?? "#666",
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="text-xs text-neutral-500">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Categories chart */}
        <div className="admin-card p-5">
          <h2 className="font-semibold">Produits par catégorie</h2>
          <div className="mt-5 space-y-3">
            {data.productsByCategory.length === 0 && (
              <p className="text-sm text-neutral-500">Aucune donnée.</p>
            )}
            {data.productsByCategory.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-neutral-700">{c.name}</span>
                  <span className="font-semibold">{c.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-black transition-all"
                    style={{ width: `${(c.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/admin/categories"
            className="mt-5 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black"
          >
            Gérer les catégories <IconArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-2">
        <QuickCard
          href="/admin/produits"
          icon={<IconBox size={20} />}
          title="Gérer le catalogue"
          desc="Ajoutez, modifiez ou supprimez des produits"
        />
        <QuickCard
          href="/admin/parametres"
          icon={<IconTag size={20} />}
          title="Paramètres du site"
          desc="Personnalisez votre boutique"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  color: string;
}) {
  return (
    <div className="admin-card p-5">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        <span className="text-xs text-neutral-500">{trend}</span>
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function QuickCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="admin-card flex items-center gap-4 p-5 transition-smooth hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-neutral-500">{desc}</p>
      </div>
      <IconArrowRight size={16} />
    </Link>
  );
}