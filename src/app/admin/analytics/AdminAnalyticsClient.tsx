"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  IconChart,
  IconEye,
  IconUsers,
  IconTrend,
  IconRefresh,
  IconExternal,
  IconGlobe,
  IconSmartphone,
} from "@/components/store/Icons";

interface TimeseriesItem {
  timestamp: string;
  pageviews: number;
  visitors: number;
}

interface PathItem {
  path: string;
  pageviews: number;
  visitors: number;
}

interface ReferrerItem {
  referrer: string;
  pageviews: number;
  visitors: number;
}

interface CountryItem {
  country: string;
  pageviews: number;
  visitors: number;
}

interface DeviceItem {
  device: string;
  pageviews: number;
  visitors: number;
}

interface OsItem {
  os: string;
  pageviews: number;
  visitors: number;
}

interface AnalyticsData {
  configured: boolean;
  period: string;
  since: string;
  until: string;
  summary: {
    pageviews: number;
    visitors: number;
    avgViewsPerVisitor: number;
  };
  timeseries: TimeseriesItem[];
  paths: PathItem[];
  referrers: ReferrerItem[];
  countries: CountryItem[];
  devices: DeviceItem[];
  os: OsItem[];
  error?: string;
}

const PERIOD_LABELS: Record<string, string> = {
  "24h": "Dernières 24h",
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
};

export function AdminAnalyticsClient() {
  const [period, setPeriod] = useState<string>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (selectedPeriod: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?period=${selectedPeriod}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "Impossible de charger les données");
      }
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const maxTimeseriesValue = useMemo(() => {
    if (!data?.timeseries?.length) return 1;
    const maxVal = Math.max(
      ...data.timeseries.map((t) => Math.max(t.pageviews, t.visitors)),
      1
    );
    return maxVal;
  }, [data]);

  const maxPathViews = useMemo(() => {
    if (!data?.paths?.length) return 1;
    return Math.max(...data.paths.map((p) => p.pageviews), 1);
  }, [data]);

  const maxReferrerViews = useMemo(() => {
    if (!data?.referrers?.length) return 1;
    return Math.max(...data.referrers.map((r) => r.pageviews), 1);
  }, [data]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              Vercel Web Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Suivi des visiteurs, des pages vues et du trafic en temps réel pour Boutique Milina
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-1 shadow-sm">
            {(["24h", "7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p
                    ? "bg-black text-white"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(period)}
            disabled={loading}
            title="Rafraîchir"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
          >
            <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <a
            href="https://vercel.com/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-800"
          >
            <span>Console Vercel</span>
            <IconExternal size={14} />
          </a>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Visitors */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Visiteurs Uniques
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconUsers size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              {loading ? "..." : (data?.summary?.visitors ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Sur la période sélectionnée
            </div>
          </div>
        </div>

        {/* Pageviews */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pages Vues
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <IconEye size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              {loading ? "..." : (data?.summary?.pageviews ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Total des consultations
            </div>
          </div>
        </div>

        {/* Avg views / visitor */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pages / Visiteur
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <IconTrend size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              {loading ? "..." : (data?.summary?.avgViewsPerVisitor ?? 0)}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Engagement moyen
            </div>
          </div>
        </div>

        {/* Project Status */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Intégration
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
              <IconChart size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base font-semibold text-neutral-900">
              @vercel/analytics
            </div>
            <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Connecté & actif
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeseries Chart */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Évolution du Trafic
            </h2>
            <p className="text-xs text-neutral-500">
              Comparaison entre les visites et les visiteurs uniques
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-neutral-900" />
              <span className="text-neutral-600">Pages Vues</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-500" />
              <span className="text-neutral-600">Visiteurs</span>
            </div>
          </div>
        </div>

        {/* Visual Chart Bars */}
        <div className="mt-6">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
              Chargement du graphique...
            </div>
          ) : !data?.timeseries?.length ? (
            <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
              Aucune donnée pour cette période
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-end gap-1.5 h-48 pt-4 overflow-x-auto pb-2">
                {data.timeseries.map((item, idx) => {
                  const pvHeight = Math.max(
                    Math.round((item.pageviews / maxTimeseriesValue) * 100),
                    item.pageviews > 0 ? 6 : 0
                  );
                  const vHeight = Math.max(
                    Math.round((item.visitors / maxTimeseriesValue) * 100),
                    item.visitors > 0 ? 6 : 0
                  );
                  const dateStr = item.timestamp
                    ? new Date(item.timestamp).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "";

                  return (
                    <div
                      key={idx}
                      className="group flex-1 min-w-[20px] max-w-[40px] flex flex-col items-center justify-end h-full relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-black text-white text-[10px] rounded px-2 py-1 shadow-md whitespace-nowrap pointer-events-none">
                        <div>{dateStr}</div>
                        <div>{item.pageviews} vues • {item.visitors} vis.</div>
                      </div>

                      <div className="w-full flex items-end justify-center gap-0.5 h-full">
                        {/* Pageviews bar */}
                        <div
                          style={{ height: `${pvHeight}%` }}
                          className="w-1/2 bg-neutral-900 rounded-t-sm transition-all group-hover:bg-black"
                        />
                        {/* Visitors bar */}
                        <div
                          style={{ height: `${vHeight}%` }}
                          className="w-1/2 bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Date labels */}
              <div className="flex justify-between text-[10px] text-neutral-400 pt-2 border-t border-neutral-100">
                <span>
                  {data.timeseries[0]?.timestamp &&
                    new Date(data.timeseries[0].timestamp).toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "short" }
                    )}
                </span>
                <span>
                  {data.timeseries[data.timeseries.length - 1]?.timestamp &&
                    new Date(
                      data.timeseries[data.timeseries.length - 1].timestamp
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Top Pages & Referrers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Pages les plus visitées
              </h3>
              <p className="text-xs text-neutral-500">
                Articles et pages consultées par vos clients
              </p>
            </div>
            <span className="text-xs font-medium text-neutral-400">Vues</span>
          </div>

          <div className="mt-4 divide-y divide-neutral-100">
            {loading ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Chargement...
              </div>
            ) : !data?.paths?.length ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Aucune page enregistrée
              </div>
            ) : (
              data.paths.map((p, idx) => {
                const pct = Math.round((p.pageviews / maxPathViews) * 100);
                return (
                  <div key={idx} className="py-2.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-neutral-800 truncate max-w-[70%]">
                        {p.path === "/" ? "/ (Accueil)" : p.path}
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {p.pageviews.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Sources de Trafic (Referrers)
              </h3>
              <p className="text-xs text-neutral-500">
                D'où proviennent vos visiteurs
              </p>
            </div>
            <span className="text-xs font-medium text-neutral-400">Visites</span>
          </div>

          <div className="mt-4 divide-y divide-neutral-100">
            {loading ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Chargement...
              </div>
            ) : !data?.referrers?.length ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Aucune source externe
              </div>
            ) : (
              data.referrers.map((r, idx) => {
                const pct = Math.round((r.pageviews / maxReferrerViews) * 100);
                return (
                  <div key={idx} className="py-2.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-800 font-medium truncate max-w-[70%]">
                        {r.referrer}
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {r.pageviews.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid: Countries & Devices */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Countries */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <IconGlobe size={15} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Pays d'origine
                </h3>
                <p className="text-xs text-neutral-500">
                  Distribution géographique des visiteurs
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 divide-y divide-neutral-100">
            {loading ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                Chargement...
              </div>
            ) : !data?.countries?.length ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                Aucun pays répertorié
              </div>
            ) : (
              data.countries.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-neutral-700">
                      {c.country}
                    </span>
                    <span className="text-neutral-800">
                      {c.country === "DZ"
                        ? "Algérie"
                        : c.country === "FR"
                        ? "France"
                        : c.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500">{c.visitors} visiteurs</span>
                    <span className="font-semibold text-neutral-900">{c.pageviews} vues</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Devices & OS */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <IconSmartphone size={15} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Appareils & Systèmes
                </h3>
                <p className="text-xs text-neutral-500">
                  Types d'écrans et systèmes d'exploitation
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Devices breakdown */}
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
                Types d'appareils
              </div>
              <div className="space-y-2">
                {!data?.devices?.length ? (
                  <div className="text-xs text-neutral-400">Aucune donnée</div>
                ) : (
                  data.devices.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <span className="capitalize text-neutral-700">{d.device}</span>
                      <span className="font-semibold text-neutral-900">{d.pageviews} vues</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* OS breakdown */}
            <div className="pt-3 border-t border-neutral-100">
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
                Systèmes d'exploitation
              </div>
              <div className="space-y-2">
                {!data?.os?.length ? (
                  <div className="text-xs text-neutral-400">Aucune donnée</div>
                ) : (
                  data.os.map((o, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <span className="text-neutral-700">{o.os}</span>
                      <span className="font-semibold text-neutral-900">{o.pageviews} vues</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
