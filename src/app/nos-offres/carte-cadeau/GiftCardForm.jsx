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

    if (offer && (!giftMetadata.recipientFirstName || !giftMetadata.recipientLastName || !giftMetadata.recipientEmail.includes("@"))) {
      setError("Indiquez le prénom, le nom et un e-mail valide du bénéficiaire.");
      return;
    }

    if (status === "loading") return;

    if (!session) {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({
        amount: numericAmount,
        isGift: offer,
        recipientFirstName: giftMetadata.recipientFirstName,
        recipientLastName: giftMetadata.recipientLastName,
        recipientEmail: giftMetadata.recipientEmail,
        message: giftMetadata.message,
      }));
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
      const replaced = await addGiftCard({ customAmount: numericAmount, giftMetadata, replace: true });
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
      <h2>Montant de la carte</h2>
      <div className="gift-presets">
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
        <span>Montant personnalisé</span>
        <input
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
          aria-describedby="gift-amount-hint"
        />
      </label>
      <p id="gift-amount-hint" className="gift-hint">
        Minimum 10 €, uniquement des euros entiers. Montant retenu : {numericAmount || 0} €.
      </p>

      <label className="gift-offer">
        <input type="checkbox" checked={offer} onChange={(event) => setOffer(event.target.checked)} />
        Offrir à un proche par mail
      </label>

      {offer && (
        <div className="gift-recipient">
          <div className="gift-recipient-row">
            <label className="gift-field">
              <span>Prénom</span>
              <input
                value={recipient.recipientFirstName}
                onChange={(event) => updateRecipient("recipientFirstName", event.target.value)}
                required
              />
            </label>
            <label className="gift-field">
              <span>Nom</span>
              <input
                value={recipient.recipientLastName}
                onChange={(event) => updateRecipient("recipientLastName", event.target.value)}
                required
              />
            </label>
          </div>
          <label className="gift-field">
            <span>E-mail du bénéficiaire</span>
            <input
              type="email"
              value={recipient.recipientEmail}
              onChange={(event) => updateRecipient("recipientEmail", event.target.value)}
              required
            />
          </label>
          <label className="gift-field">
            <span>Petit mot</span>
            <textarea
              maxLength={500}
              value={recipient.message}
              onChange={(event) => updateRecipient("message", event.target.value)}
              placeholder="Un message qui accompagnera le code..."
            />
          </label>
        </div>
      )}

      {error && <p className="gift-error">{error}</p>}

      <button type="submit" className="gift-submit" disabled={loading}>
        {loading ? "Ajout..." : "Ajouter au panier"}
      </button>
    </form>
  );
}
