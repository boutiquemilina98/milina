import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-20 bg-white">
      <div className="max-w-md w-full text-center">
        <span className="font-serif text-8xl font-bold text-neutral-200 block select-none">
          404
        </span>
        <h1 
          className="mt-4 font-serif text-3xl font-bold tracking-tight text-neutral-900"
          style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
        >
          Page introuvable
        </h1>
        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
          La page ou l'article que vous recherchez n'existe pas, a été déplacé ou supprimé.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-black px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:bg-neutral-800 shadow-sm"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/categorie/tout"
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-900 transition-all duration-300 hover:bg-neutral-50"
          >
            Découvrir la collection
          </Link>
        </div>
      </div>
    </div>
  );
}
