import { getCachedSettings } from "@/lib/cache";
import { IconFacebook, IconInstagram, IconWhatsApp, IconMail, IconTikTok } from "@/components/store/Icons";

export default async function ContactPage() {
  const settings = await getCachedSettings();

  const facebook = (settings.facebook_url as string) ?? "https://facebook.com/milina.luxury";
  const instagram = (settings.instagram_url as string) ?? "https://instagram.com/milina.luxury";
  const tiktok = (settings.tiktok_url as string) ?? "https://tiktok.com/@milina.luxury";
  const whatsappNumber = (settings.whatsapp_number as string) ?? "213660989407";
  const whatsapp = `https://wa.me/${String(whatsappNumber).replace(/[^0-9]/g, '')}`;
  const email = (settings.contact_email as string) ?? "milina.luxury@gmail.com";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16 min-h-[60vh]">
      <div className="text-center mb-12">
        <h1 
          className="font-serif text-4xl font-bold mb-4"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          Contactez-nous
        </h1>
        <div className="mx-auto h-1 w-20 bg-black mb-6"></div>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Nous sommes à votre disposition pour toute question. N'hésitez pas à nous contacter sur nos réseaux sociaux ou par e-mail.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {facebook && (
          <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-6 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md bg-white group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconFacebook size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Facebook</h3>
              <p className="text-sm text-neutral-500">Suivez-nous sur Facebook</p>
            </div>
          </a>
        )}

        {instagram && (
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-6 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md bg-white group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconInstagram size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Instagram</h3>
              <p className="text-sm text-neutral-500">Découvrez nos nouveautés</p>
            </div>
          </a>
        )}

        {tiktok && (
          <a href={tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-6 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md bg-white group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconTikTok size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">TikTok</h3>
              <p className="text-sm text-neutral-500">Regardez nos vidéos</p>
            </div>
          </a>
        )}

        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-6 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md bg-white group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconWhatsApp size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">WhatsApp</h3>
              <p className="text-sm text-neutral-500">Discutez avec nous</p>
            </div>
          </a>
        )}

        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-4 p-6 border border-neutral-200 rounded-xl hover:border-black hover:bg-neutral-50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md bg-white group md:col-span-2 md:w-1/2 md:mx-auto w-full">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white shadow-sm group-hover:scale-110 transition-transform">
              <IconMail size={24} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-lg">E-mail</h3>
              <p className="text-sm text-neutral-500 truncate">{email}</p>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
