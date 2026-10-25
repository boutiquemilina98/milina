"use client";

import Link from "next/link";
import { IconStore } from "@/components/store/Icons";
import { useActionState, useEffect, useState } from "react";
import { login } from "./actions";

function Typewriter({ text, speed = 50, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    const start = setTimeout(() => {
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayed(text.substring(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(intervalId);
      }, speed);
      return () => clearInterval(intervalId);
    }, delay);
    return () => clearTimeout(start);
  }, [text, speed, delay]);
  
  return <>{displayed}</>;
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.logo_image) {
          setLogo(d.settings.logo_image);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white text-black selection:bg-black/10">
      {/* Interactive Header */}
      <header className="relative z-50 w-full cursor-default bg-black px-6 py-5 shadow-lg transition-colors duration-300 hover:bg-neutral-900">
        <h1 className="text-center text-base font-bold font-serif italic tracking-widest text-white md:text-xl min-h-[1.75rem]">
          <Typewriter text="Controle Pannel De Boutique Milina Luxury" delay={300} />
        </h1>
      </header>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-black/5 blur-[100px]" />
      </div>

      <div className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-8">
        <div
          className={`w-full max-w-md p-8 transition-all duration-1000 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
        <div className="mb-16 flex flex-col items-center">
          {/* Dynamic Logo */}
          {logo && (
            <img 
              src={logo}
              alt="Logo" 
              className="h-24 w-auto object-contain transition-transform duration-500 hover:scale-105" 
            />
          )}
          <div className="mt-8 flex w-full flex-col items-center gap-2 rounded-2xl bg-black/5 px-6 py-4 text-center text-base font-bold font-serif italic tracking-widest text-black backdrop-blur-sm min-h-[5rem] justify-center">
            <p><Typewriter text="Accès Sécurisé" delay={800} /></p>
            <p><Typewriter text="Pour Milina Soulement" delay={1300} /></p>
          </div>
        </div>

        <form action={formAction} className="space-y-6">
          <div
            className={`transition-all duration-700 delay-100 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="group relative pt-10">
              <input
                id="email"
                name="email"
                type="email"
                autoFocus
                required
                placeholder=" "
                className="peer w-full border-b border-black/20 bg-transparent px-0 py-2 text-base font-bold font-serif italic text-black placeholder-transparent transition-colors focus:border-black focus:outline-none focus:ring-0 text-center"
                style={{ WebkitBoxShadow: "0 0 0px 1000px #ffffff inset", WebkitTextFillColor: "#000" }}
              />
              <label
                htmlFor="email"
                className="absolute left-0 -top-1 text-sm font-bold font-serif italic text-black/50 transition-all peer-placeholder-shown:top-12 peer-placeholder-shown:text-base peer-focus:-top-1 peer-focus:text-sm peer-focus:text-black peer-focus:left-1/2 peer-focus:-translate-x-1/2"
              >
                Adresse e-mail
              </label>
            </div>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="group relative flex items-center pt-10">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder=" "
                className="peer w-full border-b border-black/20 bg-transparent px-0 py-2 pr-10 text-base font-bold font-serif italic text-black placeholder-transparent transition-colors focus:border-black focus:outline-none focus:ring-0 text-center"
                style={{ WebkitBoxShadow: "0 0 0px 1000px #ffffff inset", WebkitTextFillColor: "#000" }}
              />
              <label
                htmlFor="password"
                className="absolute left-0 -top-1 text-sm font-bold font-serif italic text-black/50 transition-all peer-placeholder-shown:top-12 peer-placeholder-shown:text-base peer-focus:-top-1 peer-focus:text-sm peer-focus:text-black peer-focus:left-1/2 peer-focus:-translate-x-1/2"
              >
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-10 p-2 text-black/50 hover:text-black focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div
            className={`transition-all duration-700 delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            {state?.error && (
              <p className="mb-4 text-center text-sm font-light text-red-400">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full overflow-hidden rounded-full bg-black px-8 py-3.5 text-lg font-bold font-serif italic tracking-wide text-white transition-all hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black/50 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span
                className={`transition-opacity duration-300 ${
                  isPending ? "opacity-0" : "opacity-100"
                }`}
              >
                Connexion
              </span>
              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </button>
          </div>
        </form>

        <div
          className={`mt-8 transition-all duration-700 delay-500 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 text-sm font-bold font-serif italic text-black/40 transition-colors hover:text-black"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
