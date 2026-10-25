"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IconCheck } from "@/components/store/Icons";

function ThankYouContent() {
  const sp = useSearchParams();
  const order = sp.get("order") ?? "RS-XXXX";
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center md:px-8">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black text-white">
        <IconCheck size={36} />
      </div>
      <h1 className="font-serif text-4xl font-bold">Merci pour votre commande !</h1>
      <p className="mt-4 text-neutral-600">
        Votre commande a été enregistrée avec succès. Nous vous contacterons
        sous peu pour confirmer la livraison.
      </p>
      <div className="mt-6 rounded-full bg-neutral-100 px-5 py-2 text-sm font-mono tracking-wider">
        N° {order}
      </div>
      <Link
        href="/"
        className="mt-10 rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-smooth hover:bg-neutral-800"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-24 text-center md:px-8">
          <p>Chargement...</p>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}