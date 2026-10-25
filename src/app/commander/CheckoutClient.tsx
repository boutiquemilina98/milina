"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/store/CartProvider";
import { WILAYAS } from "@/lib/format";
import COMMUNES from "@/lib/communes.json";
import { IconChevronRight, IconBag, IconCheck, IconArrowLeft } from "@/components/store/Icons";

export default function CheckoutClient({
  shippingRates,
}: {
  shippingRates: Record<string, { home: number; desk: number }>;
}) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    wilaya: WILAYAS[15],
    commune: "",
    address: "",
    notes: "",
    paymentMethod: "cod",
    deliveryType: "home",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wilayaRates = shippingRates[form.wilaya] || { home: 0, desk: 0 };
  const shipping = subtotal > 0 ? (form.deliveryType === "desk" ? wilayaRates.desk : wilayaRates.home) : 0;
  const total = subtotal + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          subtotal,
          shipping,
          total,
          paymentMethod: form.paymentMethod,
          deliveryType: form.deliveryType,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Erreur lors de la commande");
      }
      clear();
      router.push(`/commander/merci?order=${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center md:px-8">
        <h1 className="font-serif text-3xl font-bold">Votre panier est vide</h1>
        <p className="mt-3 text-neutral-500">
          Ajoutez d'abord des articles à votre panier avant de passer commande.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm text-white"
        >
          Découvrir la collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black"
      >
        <IconArrowLeft size={16} /> Continuer mes achats
      </Link>
      <h1 className="font-serif text-3xl font-bold md:text-4xl">Finaliser la commande</h1>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-8 md:grid-cols-[1fr_400px]"
      >
        <div className="space-y-6">
          <Section title="Informations de contact">
            <Field
              label="Nom complet *"
              required
              value={form.customerName}
              onChange={(v) => setForm({ ...form, customerName: v })}
            />
            <div className="grid gap-4 md:grid-cols-1">
              <Field
                label="Téléphone *"
                required
                type="tel"
                value={form.customerPhone}
                onChange={(v) => setForm({ ...form, customerPhone: v })}
              />
            </div>
          </Section>

          <Section title="Adresse de livraison">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Wilaya *"
                required
                value={form.wilaya}
                options={WILAYAS.map((w) => ({ value: w, label: w }))}
                onChange={(v) => setForm({ ...form, wilaya: v, commune: "" })}
              />
              <Select
                label="Commune *"
                required
                value={form.commune}
                options={[
                  { value: "", label: "Sélectionner une commune" },
                  ...((COMMUNES as Record<string, string[]>)[form.wilaya] || []).map((c) => ({ value: c, label: c }))
                ]}
                onChange={(v) => setForm({ ...form, commune: v })}
              />
            </div>
            <Field
              label="Adresse complète *"
              required
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
              placeholder="Rue, immeuble, étage, appartement..."
            />
            <Field
              label="Notes (optionnel)"
              value={form.notes}
              onChange={(v) => setForm({ ...form, notes: v })}
              placeholder="Instructions de livraison..."
              textarea
            />
          </Section>

          <Section title="Mode de livraison">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { value: "home", label: "À domicile", desc: "Livraison jusqu'à votre porte" },
                { value: "desk", label: "Au bureau", desc: "Récupérez votre colis en agence (Stop desk)" },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-smooth ${
                    form.deliveryType === m.value
                      ? "border-black bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    value={m.value}
                    checked={form.deliveryType === m.value}
                    onChange={(e) =>
                      setForm({ ...form, deliveryType: e.target.value })
                    }
                    className="mt-1 accent-black"
                  />
                  <div>
                    <div className="font-medium text-black">{m.label}</div>
                    <div className="mt-1 text-xs text-neutral-500">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Mode de paiement">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { value: "cod", label: "Paiement à la livraison", desc: "Payez en espèces à la réception" },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-smooth ${
                    form.paymentMethod === m.value
                      ? "border-black bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.value}
                    checked={form.paymentMethod === m.value}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                    className="mt-1 accent-black"
                  />
                  <div>
                    <div className="font-medium text-black">{m.label}</div>
                    <div className="mt-1 text-xs text-neutral-500">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </Section>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-neutral-100 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Récapitulatif
          </h2>
          <ul className="mt-4 space-y-3">
            {items.map((it) => (
              <li
                key={`${it.productId}-${it.size ?? ""}-${it.color ?? ""}`}
                className="flex gap-3 text-sm"
              >
                <img
                  src={it.image}
                  alt={it.name}
                  className="h-16 w-14 rounded object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-neutral-500">
                    {it.size && `T:${it.size}`} {it.color && `· C:${it.color}`} · ×{it.quantity}
                  </div>
                </div>
                <div className="font-medium">
                  {(it.price * it.quantity).toLocaleString("fr-DZ")} DA
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-neutral-100 pt-4 text-sm">
            <Row label="Sous-total" value={`${subtotal.toLocaleString("fr-DZ")} DA`} />
            <Row label="Livraison" value={`${shipping.toLocaleString("fr-DZ")} DA`} />
            <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-bold">
              <span>Total</span>
              <span>{total.toLocaleString("fr-DZ")} DA</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-smooth hover:bg-neutral-800 disabled:opacity-60"
          >
            {submitting ? "Traitement..." : "Confirmer la commande"}
            <IconChevronRight size={16} />
          </button>
        </aside>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
        <IconBag size={16} /> {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      {textarea ? (
        <textarea
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-smooth focus:border-black"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-smooth focus:border-black"
        />
      )}
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  required,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-smooth focus:border-black"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-neutral-600">
      <span>{label}</span>
      <span className="font-medium text-black">{value}</span>
    </div>
  );
}