"use client";

import { useEffect, useState } from "react";
import {
  IconCheck,
  IconFacebook,
  IconTikTok,
  IconTarget,
  IconExternal,
  IconEye,
  IconBag,
  IconTrend,
  IconMessage,
  IconHeart,
} from "@/components/store/Icons";
import {
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackContact,
  trackAddToWishlist,
} from "@/lib/pixel";

export default function AdminPixelsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

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
      })
      .catch(() => setLoading(false));

    if (typeof window !== "undefined") {
      setDebugMode(localStorage.getItem("milina_pixel_debug") === "true");
    }
  }, []);

  const toggleDebug = (enabled: boolean) => {
    setDebugMode(enabled);
    if (typeof window !== "undefined") {
      if (enabled) {
        localStorage.setItem("milina_pixel_debug", "true");
      } else {
        localStorage.removeItem("milina_pixel_debug");
      }
    }
  };

  const save = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const triggerTestEvent = (eventName: string) => {
    switch (eventName) {
      case "PageView":
        trackPageView();
        break;
      case "ViewContent":
        trackViewContent({
          id: 999,
          name: "Produit Test Robe Luxe",
          price: 14500,
          category: "Caftans",
          currency: "DZD",
        });
        break;
      case "AddToCart":
        trackAddToCart({
          id: 999,
          name: "Produit Test Robe Luxe",
          price: 14500,
          quantity: 1,
          category: "Caftans",
          currency: "DZD",
        });
        break;
      case "InitiateCheckout":
        trackInitiateCheckout({
          items: [
            { id: 999, name: "Produit Test Robe Luxe", price: 14500, quantity: 1 },
          ],
          total: 14500,
          currency: "DZD",
        });
        break;
      case "Purchase":
        trackPurchase({
          orderNumber: "TEST-" + Math.floor(1000 + Math.random() * 9000),
          total: 14500,
          items: [
            { id: 999, name: "Produit Test Robe Luxe", price: 14500, quantity: 1 },
          ],
          currency: "DZD",
        });
        break;
      case "Contact":
        trackContact();
        break;
      case "AddToWishlist":
        trackAddToWishlist({
          id: 999,
          name: "Produit Test Robe Luxe",
          price: 14500,
          currency: "DZD",
        });
        break;
    }

    setTestNotification(`Événement "${eventName}" envoyé ! Ouvrez la console ou votre extension Pixel Helper.`);
    setTimeout(() => setTestNotification(null), 4000);
  };

  const fbEnabled = settings.facebook_pixel_enabled === "true";
  const fbId = settings.facebook_pixel_id || "";
  const ttEnabled = settings.tiktok_pixel_enabled === "true";
  const ttId = settings.tiktok_pixel_id || "";

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <IconTarget size={22} />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Pixels & Marketing</h1>
              <p className="text-sm text-neutral-500">
                Intégration de Facebook Pixel et TikTok Pixel avec suivi complet des événements
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => save()}
          disabled={saving || loading}
          className="admin-btn self-start sm:self-auto flex items-center gap-2"
        >
          {saving ? (
            "Enregistrement..."
          ) : (
            <>
              <IconCheck size={16} /> Enregistrer les pixels
            </>
          )}
        </button>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-800 text-sm flex items-center gap-2">
          <IconCheck size={18} />
          <span className="font-semibold">Paramètres enregistrés avec succès ! Les pixels sont mis à jour sur votre boutique.</span>
        </div>
      )}

      {testNotification && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-800 text-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span>{testNotification}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-card p-8 text-center text-neutral-500">
          Chargement de la configuration...
        </div>
      ) : (
        <form onSubmit={save} className="space-y-8">
          {/* Pixels Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Meta (Facebook) Pixel Card */}
            <div className="admin-card p-6 flex flex-col justify-between border-t-4 border-t-[#1877F2]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877F2] text-white">
                      <IconFacebook size={22} />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-neutral-900">Facebook Pixel (Meta)</h2>
                      <span className="text-xs text-neutral-500">Meta Events Manager</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      fbEnabled && fbId.trim()
                        ? "bg-green-100 text-green-800"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        fbEnabled && fbId.trim() ? "bg-green-600" : "bg-neutral-400"
                      }`}
                    />
                    {fbEnabled && fbId.trim() ? "Actif" : "Inactif"}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Activer le Pixel Meta</span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={fbEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            facebook_pixel_enabled: e.target.checked ? "true" : "false",
                          })
                        }
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-[#1877F2] peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  <div>
                    <label className="admin-label block mb-1">
                      ID du Pixel Facebook (Pixel ID)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1234567890123456"
                      value={fbId}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          facebook_pixel_id: e.target.value.trim(),
                        })
                      }
                      className="admin-input font-mono text-sm"
                    />
                    <p className="mt-1.5 text-xs text-neutral-400">
                      Entrez l&apos;identifiant à 15-16 chiffres fourni par le Gestionnaire d&apos;événements Meta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Vérification : Meta Pixel Helper</span>
                <a
                  href="https://business.facebook.com/events_manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1877F2] hover:underline flex items-center gap-1 font-medium"
                >
                  Meta Business <IconExternal size={12} />
                </a>
              </div>
            </div>

            {/* TikTok Pixel Card */}
            <div className="admin-card p-6 flex flex-col justify-between border-t-4 border-t-black">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                      <IconTikTok size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-neutral-900">TikTok Pixel</h2>
                      <span className="text-xs text-neutral-500">TikTok Ads Manager</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      ttEnabled && ttId.trim()
                        ? "bg-green-100 text-green-800"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        ttEnabled && ttId.trim() ? "bg-green-600" : "bg-neutral-400"
                      }`}
                    />
                    {ttEnabled && ttId.trim() ? "Actif" : "Inactif"}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Activer le Pixel TikTok</span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={ttEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            tiktok_pixel_enabled: e.target.checked ? "true" : "false",
                          })
                        }
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  <div>
                    <label className="admin-label block mb-1">
                      ID du Pixel TikTok (Pixel Code)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: C9ABCDEF1234567890"
                      value={ttId}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          tiktok_pixel_id: e.target.value.trim(),
                        })
                      }
                      className="admin-input font-mono text-sm"
                    />
                    <p className="mt-1.5 text-xs text-neutral-400">
                      Entrez le code alphanumérique fourni par TikTok Ads Manager (Assets &gt; Events).
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Vérification : TikTok Pixel Helper</span>
                <a
                  href="https://ads.tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-900 hover:underline flex items-center gap-1 font-medium"
                >
                  TikTok Ads <IconExternal size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Events Table Section */}
          <div className="admin-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-neutral-100">
              <div>
                <h2 className="font-serif text-xl font-bold">Événements Suivis Automatiquement</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tous les événements standard e-commerce sont préconfigurés et envoyés aux deux plateformes avec leurs paramètres détaillés.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Mode Débogage Console :</span>
                <button
                  type="button"
                  onClick={() => toggleDebug(!debugMode)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    debugMode
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {debugMode ? "Activé (Logs ON)" : "Désactivé"}
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Action Client</th>
                    <th className="py-3 px-3">Facebook Pixel (Meta)</th>
                    <th className="py-3 px-3">TikTok Pixel</th>
                    <th className="py-3 px-3">Paramètres transmis</th>
                    <th className="py-3 px-3 text-right">Test direct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {/* PageView */}
                  <tr className="hover:bg-neutral-50">
                    <td className="py-3.5 px-3 font-medium flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      Visite d&apos;une page
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#1877F2] font-semibold">PageView</td>
                    <td className="py-3.5 px-3 font-mono text-xs text-neutral-900 font-semibold">PageView (ttq.page)</td>
                    <td className="py-3.5 px-3 text-xs text-neutral-500">URL, Titre de la page</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => triggerTestEvent("PageView")}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100"
                      >
                        Tester
                      </button>
                    </td>
                  </tr>

                  {/* ViewContent */}
                  <tr className="hover:bg-neutral-50">
                    <td className="py-3.5 px-3 font-medium flex items-center gap-2">
                      <IconEye size={16} className="text-neutral-500" />
                      Consultation Produit
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#1877F2] font-semibold">ViewContent</td>
                    <td className="py-3.5 px-3 font-mono text-xs text-neutral-900 font-semibold">ViewContent</td>
                    <td className="py-3.5 px-3 text-xs text-neutral-500">id, name, price, category, currency: &apos;DZD&apos;</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => triggerTestEvent("ViewContent")}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100"
                      >
                        Tester
                      </button>
                    </td>
                  </tr>

                  {/* AddToCart */}
                  <tr className="hover:bg-neutral-50">
                    <td className="py-3.5 px-3 font-medium flex items-center gap-2">
                      <IconBag size={16} className="text-neutral-500" />
                      Ajout au panier
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#1877F2] font-semibold">AddToCart</td>
                    <td className="py-3.5 px-3 font-mono text-xs text-neutral-900 font-semibold">AddToCart</td>
                    <td className="py-3.5 px-3 text-xs text-neutral-500">id, name, price, quantity, value, currency</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => triggerTestEvent("AddToCart")}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100"
                      >
                        Tester
                      </button>
                    </td>
                  </tr>

                  {/* InitiateCheckout */}
                  <tr className="hover:bg-neutral-50">
                    <td className="py-3.5 px-3 font-medium flex items-center gap-2">
                      <IconTrend size={16} className="text-neutral-500" />
                      Début de commande
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#1877F2] font-semibold">InitiateCheckout</td>
                    <td className="py-3.5 px-3 font-mono text-xs text-neutral-900 font-semibold">InitiateCheckout</td>
                    <td className="py-3.5 px-3 text-xs text-neutral-500">contents, num_items, total, currency: &apos;DZD&apos;</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => triggerTestEvent("InitiateCheckout")}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100"
                      >
                        Tester
                      </button>
                    </td>
                  </tr>

                  {/* Purchase */}
                  <tr className="hover:bg-neutral-50 bg-amber-50/40">
                    <td className="py-3.5 px-3 font-medium flex items-center gap-2 text-neutral-900 font-bold">
                      <IconCheck size={16} className="text-emerald-600" />
                      Achat validé (Commande)
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#1877F2] font-bold">Purchase</td>
                    <td className="py-3.5 px-3 font-mono text-xs text-neutral-900 font-bold">CompletePayment</td>
                    <td className="py-3.5 px-3 text-xs text-neutral-700 font-medium">order_id, contents, value, currency: &apos;DZD&apos;</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => triggerTestEvent("Purchase")}
                        className="rounded border border-amber-300 bg-white px-2 py-1 text-xs hover:bg-neutral-100 font-medium"
                      >
                        Tester
                      </button>
                    </td>
                  </tr>

                  {/* Contact */}
                  <tr className="hover:bg-neutral-50">
                    <td className="py-3.5 px-3 font-medium flex items-center gap-2">
                      <IconMessage size={16} className="text-neutral-500" />
                      Formulaire contact
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#1877F2] font-semibold">Contact</td>
                    <td className="py-3.5 px-3 font-mono text-xs text-neutral-900 font-semibold">Contact</td>
                    <td className="py-3.5 px-3 text-xs text-neutral-500">Lead / Confirmation</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => triggerTestEvent("Contact")}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100"
                      >
                        Tester
                      </button>
                    </td>
                  </tr>

                  {/* AddToWishlist */}
                  <tr className="hover:bg-neutral-50">
                    <td className="py-3.5 px-3 font-medium flex items-center gap-2">
                      <IconHeart size={16} className="text-neutral-500" />
                      Ajout aux favoris
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-[#1877F2] font-semibold">AddToWishlist</td>
                    <td className="py-3.5 px-3 font-mono text-xs text-neutral-900 font-semibold">AddToWishlist</td>
                    <td className="py-3.5 px-3 text-xs text-neutral-500">id, name, currency</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => triggerTestEvent("AddToWishlist")}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100"
                      >
                        Tester
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Guide & Testing Instructions Card */}
          <div className="admin-card p-6 bg-gradient-to-br from-neutral-50 to-neutral-100/50">
            <h3 className="font-bold text-sm text-neutral-900 mb-3">
              Comment vérifier que vos Pixels fonctionnent correctement ?
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 text-xs text-neutral-600">
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="font-bold text-[#1877F2] flex items-center gap-1.5 mb-1.5">
                  <IconFacebook size={16} /> Extension Meta Pixel Helper
                </div>
                <p>
                  Installez l&apos;extension Chrome officielle <strong>Meta Pixel Helper</strong>. Rendez-vous sur votre boutique : l&apos;icône deviendra bleue et affichera les événements détectés en temps réel (PageView, ViewContent, AddToCart, Purchase).
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5 mb-1.5">
                  <IconTikTok size={16} /> Extension TikTok Pixel Helper
                </div>
                <p>
                  Installez l&apos;extension Chrome officielle <strong>TikTok Pixel Helper</strong>. Elle permet de diagnostiquer l&apos;état du pixel, vérifier les paramètres de devise DZD et tester vos événements de conversion.
                </p>
              </div>
            </div>
          </div>

          {/* Submit bar */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="admin-btn flex items-center gap-2"
            >
              {saving ? (
                "Enregistrement..."
              ) : (
                <>
                  <IconCheck size={16} /> Enregistrer les pixels
                </>
              )}
            </button>
            {saved && (
              <span className="text-sm font-medium text-green-600">
                Modifications appliquées ✓
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
