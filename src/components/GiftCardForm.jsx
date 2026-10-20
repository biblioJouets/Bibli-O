"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";

const PRESETS = [20, 30, 50, 100];
const PENDING_KEY = "pendingGiftCard";
const LOGIN_URL = "/connexion?callbackUrl=/nos-offres/carte-cadeau";

export default function GiftCardForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addGiftCard, loading } = useCart();
  const [amount, setAmount] = useState("30");
  const [offer, setOffer] = useState(false);
  const [recipient, setRecipient] = useState({
    recipientFirstName: "",
    recipientLastName: "",
    recipientEmail: "",
    message: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_KEY);
    try {
      const saved = JSON.parse(raw);
      const restoredAmount = Math.floor(Number(saved.amount));
      if (Number.isInteger(restoredAmount) && restoredAmount > 0) {
        setAmount(String(restoredAmount));
      }
      setOffer(Boolean(saved.isGift));
      setRecipient({
        recipientFirstName: saved.recipientFirstName || "",
        recipientLastName: saved.recipientLastName || "",
        recipientEmail: saved.recipientEmail || "",
        message: saved.message || "",
      });
    } catch {
      setError("");
    }
  }, []);

  const numericAmount = Math.floor(Number(String(amount).replace(/[^\d]/g, "")) || 0);

  function updateRecipient(field, value) {
    setRecipient((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (numericAmount < 10) {
      setError("Le montant minimum est de 10 €, en nombre entier.");
      return;
    }

    const giftMetadata = {
      offerToSomeone: offer,
      recipientFirstName: offer ? recipient.recipientFirstName.trim() : "",
      recipientLastName: offer ? recipient.recipientLastName.trim() : "",
      recipientEmail: offer ? recipient.recipientEmail.trim() : "",
      message: offer ? recipient.message.trim() : "",
    };

    if (
      offer &&
      (!giftMetadata.recipientFirstName ||
        !giftMetadata.recipientLastName ||
        !giftMetadata.recipientEmail.includes("@"))
    ) {
      setError("Indiquez le prénom, le nom et un e-mail valide du bénéficiaire.");
      return;
    }

    if (status === "loading") return;

    if (!session) {
      sessionStorage.setItem(
        PENDING_KEY,
        JSON.stringify({
          amount: numericAmount,
          isGift: offer,
          recipientFirstName: giftMetadata.recipientFirstName,
          recipientLastName: giftMetadata.recipientLastName,
          recipientEmail: giftMetadata.recipientEmail,
          message: giftMetadata.message,
        })
      );
      router.push(LOGIN_URL);
      return;
    }

    const result = await addGiftCard({ customAmount: numericAmount, giftMetadata });
    if (!result.ok && result.code === "CART_MIXED") {
      const replace = window.confirm(
        "Votre panier contient des jouets. Les retirer pour n'y laisser que la carte cadeau ?"
      );
      if (!replace) {
        setError(result.error);
        return;
      }
      const replaced = await addGiftCard({
        customAmount: numericAmount,
        giftMetadata,
        replace: true,
      });
      if (!replaced.ok) {
        setError(replaced.error || "Impossible d'isoler le panier.");
        return;
      }
    } else if (!result.ok) {
      setError(result.error || "Impossible d'ajouter la carte cadeau.");
      return;
    }

    router.push("/panier");
  }

  return (
    <form className="gift-card-panel" onSubmit={handleSubmit}>
      {/* APERÇU VISUEL DYNAMIQUE DE LA CARTE */}
      <div className="gift-preview" aria-hidden="true">
        <div className="gift-preview__top">
          <span className="gift-preview__brand">Bibli&apos;o Jouets</span>
          <span className="gift-preview__amount">{numericAmount || 0} €</span>
        </div>
        <p className="gift-preview__slogan">Louez, Jouez, Échangez !</p>
        {offer && (recipient.recipientFirstName || recipient.message) && (
          <div className="gift-preview__recipient">
            {recipient.recipientFirstName && (
              <strong>
                Pour : {recipient.recipientFirstName} {recipient.recipientLastName}
              </strong>
            )}
            {recipient.message && <p>&laquo; {recipient.message} &raquo;</p>}
          </div>
        )}
      </div>

      <h2 id="buy-section-title" className="gift-card-panel__title">
        1. Choisissez le montant de la carte
      </h2>

      <div className="gift-presets" role="group" aria-label="Montants suggérés">
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            className={`gift-preset${numericAmount === value ? " gift-preset--active" : ""}`}
            onClick={() => setAmount(String(value))}
          >
            {value} €
          </button>
        ))}
      </div>

      <label className="gift-amount-field">
        <span>Ou saisissez un montant libre (en €)</span>
        <div className="gift-amount-input-wrapper">
          <input
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
            aria-describedby="gift-amount-hint"
            placeholder="Ex: 45"
          />
          <span className="gift-amount-suffix">€</span>
        </div>
      </label>
      <p id="gift-amount-hint" className="gift-hint">
        Minimum 10 €, uniquement des euros entiers. Montant retenu :{" "}
        <strong>{numericAmount || 0} €</strong>.
      </p>

      <hr className="gift-divider" />

      <h2 className="gift-card-panel__title">2. Choisissez le mode d&apos;envoi</h2>

      <label className={`gift-offer ${offer ? "gift-offer--checked" : ""}`}>
        <input
          type="checkbox"
          checked={offer}
          onChange={(event) => setOffer(event.target.checked)}
        />
        <div className="gift-offer__text">
          <strong>Offrir directement à un proche par e-mail</strong>
          <span>Nous envoyons la carte cadeau et votre petit mot au bénéficiaire</span>
        </div>
      </label>

      {offer && (
        <div className="gift-recipient">
          <div className="gift-recipient-row">
            <label className="gift-field">
              <span>Prénom du bénéficiaire *</span>
              <input
                value={recipient.recipientFirstName}
                onChange={(event) => updateRecipient("recipientFirstName", event.target.value)}
                placeholder="Ex: Laura"
                required
              />
            </label>
            <label className="gift-field">
              <span>Nom du bénéficiaire *</span>
              <input
                value={recipient.recipientLastName}
                onChange={(event) => updateRecipient("recipientLastName", event.target.value)}
                placeholder="Ex: Dupont"
                required
              />
            </label>
          </div>
          <label className="gift-field">
            <span>E-mail du bénéficiaire *</span>
            <input
              type="email"
              value={recipient.recipientEmail}
              onChange={(event) => updateRecipient("recipientEmail", event.target.value)}
              placeholder="parent@exemple.fr"
              required
            />
          </label>
          <label className="gift-field">
            <span>Votre petit mot doux (optionnel)</span>
            <textarea
              maxLength={500}
              value={recipient.message}
              onChange={(event) => updateRecipient("message", event.target.value)}
              placeholder="Écrivez un message chaleureux qui accompagnera le code de la carte cadeau..."
            />
          </label>
        </div>
      )}

      {error && (
        <p className="gift-error" role="alert">
          ⚠️ {error}
        </p>
      )}

      <button type="submit" className="gift-submit" disabled={loading}>
        {loading
          ? "Ajout en cours..."
          : `Ajouter la carte de ${numericAmount || 0} € au panier`}
      </button>
    </form>
  );
}