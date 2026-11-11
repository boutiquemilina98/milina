"use client";

import { useState } from "react";
import { trackContact } from "@/lib/pixel";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires (*)");
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setStatus("success");
      try {
        trackContact();
      } catch {}
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Impossible d'envoyer le message. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8 shadow-sm">
      <h2
        className="text-xl md:text-2xl font-bold mb-2 text-gray-900"
        style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
      >
        Envoyez-nous un message
      </h2>
      <p className="text-sm text-neutral-500 mb-6">
        Remplissez le formulaire ci-dessous et notre équipe vous répondra par e-mail dans les plus brefs délais.
      </p>

      {status === "success" && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm">
          <div className="font-bold flex items-center gap-2">
            <span>✓</span> Message envoyé avec succès !
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            Merci de nous avoir contactés. Nous reviendrons vers vous très rapidement.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Sarah Benali"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Adresse e-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="exemple@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Numéro de téléphone <span className="text-neutral-400 font-normal">(optionnel)</span>
          </label>
          <input
            type="tel"
            placeholder="05 / 06 / 07 ..."
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Votre message <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Écrivez votre message ou votre question ici..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-black px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Envoi en cours..." : "Envoyer le message"}
        </button>
      </form>
    </div>
  );
}
