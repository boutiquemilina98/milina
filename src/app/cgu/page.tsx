export const dynamic = "force-static";

export default function CguPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-serif text-4xl font-bold">Conditions Générales De Vente</h1>

      <div className="prose prose-neutral mt-6 max-w-none text-neutral-700">
        <p>
          Bienvenue chez Milina Luxury. En passant commande sur notre site, vous
          acceptez les présentes conditions générales de vente.
        </p>

        <h2 className="mt-6 font-serif text-2xl">1. Commandes</h2>
        <p>
          Toute commande passée sur le site implique l'acceptation pleine et
          entière des présentes conditions générales de vente.
        </p>

        <h2 className="mt-6 font-serif text-2xl">2. Prix</h2>
        <p>
          Les prix sont indiqués en dinars algériens (DA), toutes taxes
          comprises. Les frais de livraison sont calculés à l'étape de la
          commande.
        </p>

        <h2 className="mt-6 font-serif text-2xl">3. Livraison</h2>
        <p>
          Nous livrons dans les 58 wilayas du territoire algérien. Le délai de
          livraison habituel est de 2 à 5 jours ouvrés.
        </p>

        <h2 className="mt-6 font-serif text-2xl">4. Échanges et retours</h2>
        <p>
          Les échanges sont possibles dans les 24 heures suivant la réception.
          Le produit doit être dans son état d'origine.
        </p>

        <h2 className="mt-6 font-serif text-2xl">5. Contact</h2>
        <p>
          Pour toute question, contactez-nous à milina.luxury@gmail.com.
        </p>
      </div>
    </div>
  );
}