import { getCachedSettings } from "@/lib/cache";
import { IconFacebook, IconInstagram, IconWhatsApp, IconMail, IconTikTok } from "@/components/store/Icons";
import { ContactForm } from "@/components/store/ContactForm";

export default async function ContactPage() {
  const settings = await getCachedSettings();

  const facebook = (settings.facebook_url as string) ?? "https://facebook.com/milina.luxury";
  const instagram = (settings.instagram_url as string) ?? "https://instagram.com/milina.luxury";
  const tiktok = (settings.tiktok_url as string) ?? "https://tiktok.com/@milina.luxury";
  const whatsappNumber = (settings.whatsapp_number as string) ?? "213660989407";
  const whatsapp = `https://wa.me/${String(whatsappNumber).replace(/[^0-9]/g, '')}`;
  const email = (settings.contact_email as string) ?? "milina.luxury@gmail.com";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16 min-h-[60vh]">
      <div className="text-center mb-10">
        <h1 
          className="font-serif text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "'Playfair Display', 'Amiri', serif" }}
        >
          Contactez-nous
        </h1>
        <div className="mx-auto h-0.5 w-16 bg-black mb-4"></div>
        <p className="text-neutral-600 max-w-xl mx-auto text-sm md:text-base">
          Une question sur un modèle, une commande ou la livraison ? Envoyez-nous un message ou contactez-nous directement via nos réseaux.
        </p>
      </div>

      {/* Interactive Contact Form */}
      <div className="mb-14">
        <ContactForm />
      </div>

      {/* Social and Direct Links */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 text-center mb-6">
          Ou retrouvez-nous sur
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facebook && (
          <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all shadow-sm bg-white group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconFacebook size={20} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm">Facebook</h3>
              <p className="text-xs text-neutral-500">Boutique Milina</p>
            </div>
          </a>
        )}

        {instagram && (
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all shadow-sm bg-white group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconInstagram size={20} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm">Instagram</h3>
              <p className="text-xs text-neutral-500">@milina.luxury</p>
            </div>
          </a>
        )}

        {tiktok && (
          <a href={tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all shadow-sm bg-white group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconTikTok size={20} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm">TikTok</h3>
              <p className="text-xs text-neutral-500">@milina.luxury</p>
            </div>
          </a>
        )}

        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all shadow-sm bg-white group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconWhatsApp size={20} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm">WhatsApp</h3>
              <p className="text-xs text-neutral-500">Service client</p>
            </div>
          </a>
        )}

        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all shadow-sm bg-white group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconMail size={20} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm">E-mail</h3>
              <p className="text-xs text-neutral-500 truncate">{email}</p>
            </div>
          </a>
        )}
      </div>
      </div>
    </div>
  );
}
