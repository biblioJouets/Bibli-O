import GiftCardForm from "./GiftCardForm";
import "@/styles/gift-card.css";

export const metadata = {
  title: "Carte Cadeau — Bibli'o Jouets",
  description: "Offrez une carte cadeau Bibli'o Jouets, montant libre à partir de 10 €.",
};

export default function CarteCadeauPage() {
  return (
    <main className="gift-page">
      <div className="gift-page__inner">
        <section className="gift-hero">
          <h1>Carte Cadeau Bibli&apos;o Jouets</h1>
          <p>
            Offrez du jeu sans le plastique qui s&apos;accumule. Montant libre à partir de 10 €,
            envoyé par e-mail ou en carte postale. Louez, Jouez, Échangez !
          </p>
        </section>
        <GiftCardForm />
      </div>
    </main>
  );
}
