"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  Truck,
  CheckCircle,
  Gift,
  Package,
} from "lucide-react";
import ButtonBlue from "@/components/ButtonBlue";
import "@/styles/panier.css";

// Grille tarifaire pour affichage dans la modale downgrade
const PRICING_MAP = {
  1: 20,
  2: 25,
  3: 35,
  4: 38,
  5: 45,
  6: 51,
  7: 56,
  8: 60,
  9: 63,
};

// Modale unifiée : sous-occupation (déficit > 0) ET surcapacité (surplus > 0)
function BoxSizeModal({
  finalCount,
  totalCapacity,
  orderId,
  selectedCount,
  onClose,
  onSuccess,
}) {
  const isUnder = finalCount < totalCapacity;
  const isOver = finalCount > totalCapacity;
  const diff = Math.abs(finalCount - totalCapacity);
  const newPrice = PRICING_MAP[finalCount];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAdjust = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isOver
        ? "/api/stripe/upgrade-subscription"
        : "/api/stripe/downgrade-subscription";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newToyCount: finalCount }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Erreur lors de la mise à jour.");
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-header__icon">{isOver ? "⬆️" : "📦"}</span>
          <h3 className="modal-header__title">
            {isOver ? "Box agrandie" : "Box sous-occupée"}
          </h3>
          <p className="modal-header__desc">
            Votre abonnement actuel prévoit{" "}
            <strong>
              {totalCapacity} jouet{totalCapacity > 1 ? "s" : ""}
            </strong>
            , mais votre prochaine box en contiendra{" "}
            <strong>{finalCount}</strong>.
          </p>
          {isUnder && (
            <p className="modal-header__note">
              Il vous manque{" "}
              <strong>
                {diff} jouet{diff > 1 ? "s" : ""}
              </strong>{" "}
              pour remplir votre box.
            </p>
          )}
          {isOver && (
            <p className="modal-header__note">
              Vous avez{" "}
              <strong>
                {diff} jouet{diff > 1 ? "s" : ""} de plus
              </strong>{" "}
              que votre formule actuelle.
            </p>
          )}
        </div>

        <div className="modal-actions">
          {isUnder && (
            <button
              type="button"
              onClick={() => {
                onClose();
                window.location.href = `/bibliotheque?mode=exchange&orderId=${orderId}&slots=${selectedCount}`;
              }}
              className="modal-btn-primary-blue"
            >
              🔍 Compléter ma box ({diff} jouet{diff > 1 ? "s" : ""} à ajouter)
            </button>
          )}
          <button
            type="button"
            onClick={handleAdjust}
            disabled={loading}
            className={
              isOver ? "modal-btn-primary-blue" : "modal-btn-secondary-green"
            }
          >
            {loading
              ? "Mise à jour..."
              : isOver
                ? `⬆️ Passer à ${finalCount} jouet${finalCount > 1 ? "s" : ""}${newPrice ? ` — ${newPrice}€/mois` : ""}`
                : `⬇️ Réduire à ${finalCount} jouet${finalCount > 1 ? "s" : ""}${newPrice ? ` — ${newPrice}€/mois` : ""}`}
          </button>
          {isOver && (
            <p className="modal-note">
              Le changement prend effet immédiatement avec prorata.
            </p>
          )}
          {isUnder && (
            <p className="modal-note">
              La réduction prend effet à la fin de votre cycle de facturation
              actuel.
            </p>
          )}
          {error && <p className="modal-error">{error}</p>}
          <button type="button" onClick={onClose} className="modal-cancel-link">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PanierPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    loading,
    exchangeContext,
    setExchangeContext,
    refillContext,
    setRefillContext,
    planName,
    cartTotalDisplay,
    isBoxMystereCart,
  } = useCart();
  const router = useRouter();

  // --- CRÉDIT CARTE CADEAU ---
  const [giftCredit, setGiftCredit] = useState(0);

  useEffect(() => {
    fetch("/api/user/stripe-balance")
      .then((r) => r.json())
      .then((data) => setGiftCredit(data.balance ?? 0))
      .catch(() => setGiftCredit(0));
  }, []);

  const exchangeMode = !!exchangeContext;
  const exchangeOrderId = exchangeContext?.orderId ?? null;
  const refillMode = !!refillContext;
  const refillOrderId = refillContext?.sourceOrderId ?? null;
  const refillSlots = refillContext?.slots ?? 0;

  const exchangeLoading = false;
  const exchangeError = null;
  const [refillError, setRefillError] = useState(null);
  const [showBoxSizeModal, setShowBoxSizeModal] = useState(false);
  const [boxAdjustSuccess, setBoxAdjustSuccess] = useState(null);

  // --- FONCTION DE MISE À JOUR DE L'INTENTION (LOCATION VS ACHAT) ---
  const updateItemIntent = async (productId, newIntent) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateIntent",
          productId,
          intent: newIntent,
        }),
      });
      if (response.ok) {
        // Recharge la page pour actualiser le contexte du panier (solution la plus fiable)
        window.location.reload();
      } else {
        console.error("Erreur lors de la modification de l'option.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  // --- SÉPARATION DES ARTICLES PAR INTENTION ---
  const rentalItems =
    cart.items?.filter((item) => item.intent !== "PURCHASE") || [];
  const purchaseItems =
    cart.items?.filter((item) => item.intent === "PURCHASE") || [];

  const rentalCount = rentalItems.reduce((acc, item) => acc + item.quantity, 0);
  const purchaseCount = purchaseItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const totalItemCount = rentalCount + purchaseCount;

  const rentalTheoreticalValue = rentalItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const purchaseTotal = purchaseItems.reduce((total, item) => {
    const activePrice = item.product.biblioPrice || item.product.price;
    return total + activePrice * item.quantity;
  }, 0);

  // --- TOTAL AVEC DÉDUCTION DU CRÉDIT CARTE CADEAU ---
  const subscriptionPriceValue = rentalItems.length > 0
    ? parseFloat(String(cartTotalDisplay).replace('€', '').replace(',', '.')) || 0
    : 0;
  const baseTotal = subscriptionPriceValue + purchaseTotal;
  const giftCreditAmount = giftCredit / 100;
  const totalAfterCredit = Math.max(0, baseTotal - giftCreditAmount);

  const handleRefillValidation = () => router.push("/livraison-echange");

  // --- LOGIQUE MODE ÉCHANGE (Basée uniquement sur les locations) ---
  const totalCapacity = exchangeContext?.totalActiveCount ?? 0;
  const selectedCount = exchangeContext?.selectedProductIds?.length ?? 0;
  const keptCount = totalCapacity - selectedCount;
  const finalCount = keptCount + rentalCount;
  const mismatch = totalCapacity > 0 && finalCount !== totalCapacity;

  const handleExchangeValidation = () => {
    if (exchangeMode && mismatch) {
      setShowBoxSizeModal(true);
      return;
    }
    router.push("/livraison-echange");
  };

  // --- CODE PROMO ---
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState("idle");
  const [promoMessage, setPromoMessage] = useState("");

  const handleVerifyPromo = async (e) => {
    if (e) e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoStatus("loading");
    setPromoMessage("");

    try {
      const res = await fetch("/api/verify-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode: promoCode.trim(),
          cartItems: cart.items,
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoStatus("success");
        setPromoMessage(data.message);
      } else {
        setPromoStatus("error");
        setPromoMessage(data.message || "Code invalide.");
      }
    } catch (err) {
      setPromoStatus("error");
      setPromoMessage("Erreur de vérification.");
    }
  };

  // --- AFFICHAGE PANIER VIDE ---
  if (!loading && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="cart-empty-container">
        <div className="cart-empty-icon-wrapper">
          <Gift size={64} color="#88D4AB" />
        </div>
        <h2 className="cart-empty-title">Votre coffre à jouets est vide 🛒</h2>
        <p className="cart-empty-text">
          Commencez par ajouter des jeux pour composer votre box idéale !
        </p>
        <ButtonBlue text="Parcourir la bibliothèque" href="/bibliotheque" />
      </div>
    );
  }

  // --- AFFICHAGE PANIER REMPLI ---
  return (
    <div className="cart-page-container">
      {showBoxSizeModal && exchangeMode && (
        <BoxSizeModal
          finalCount={finalCount}
          totalCapacity={totalCapacity}
          orderId={exchangeOrderId}
          selectedCount={selectedCount}
          onClose={() => setShowBoxSizeModal(false)}
          onSuccess={(data) => {
            setShowBoxSizeModal(false);
            setBoxAdjustSuccess(
              `Abonnement mis à jour — ${data.newPrice ?? ""}€/mois. Redirection en cours...`,
            );
            setTimeout(() => router.push("/livraison-echange"), 2000);
          }}
        />
      )}

      {boxAdjustSuccess && (
        <div className="cart-success-banner">✅ {boxAdjustSuccess}</div>
      )}

      {exchangeMode && (
        <div className="cart-exchange-banner">
          <div className="cart-exchange-banner__left">
            <span className="cart-exchange-banner__icon">🔄</span>
            <div>
              <p className="cart-exchange-banner__title">
                Mode Échange — Panier à 0€
              </p>
              <p className="cart-exchange-banner__subtitle">
                Votre sélection remplacera vos jouets actuels sans frais
                supplémentaires.
              </p>
            </div>
          </div>
          <a href="/mon-compte" className="cart-exchange-banner__cancel">
            Annuler
          </a>
        </div>
      )}

      {refillMode && (
        <div className="cart-refill-banner">
          <div className="cart-refill-banner__left">
            <span className="cart-refill-banner__icon">🎁</span>
            <div>
              <p className="cart-refill-banner__title">
                Mode Réassort — Gratuit
              </p>
              <p className="cart-refill-banner__subtitle">
                Choisissez jusqu'à {refillSlots} jouet
                {refillSlots > 1 ? "s" : ""} pour remplacer vos jouets adoptés.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setRefillContext(null);
              router.push("/mon-compte/commandes");
            }}
            className="cart-refill-banner__cancel"
          >
            Annuler
          </button>
        </div>
      )}

      <header className="cart-header">
        <h1 className="cart-header-title">Ma Sélection</h1>
        <p className="cart-header-subtitle">
          Vous avez sélectionné{" "}
          <strong>
            {totalItemCount} article{totalItemCount > 1 ? "s" : ""}
          </strong>
          .
        </p>
      </header>

      <div className="cart-layout">
        {/* --- COLONNE GAUCHE : LISTE DES JOUETS --- */}
        <div className="cart-items-list">
          {/* SECTION LOCATION */}
          {rentalItems.length > 0 && (
            <div>
              <h2 className="cart-section-heading">
                <span className="cart-section-heading__icon">📦</span> Vos
                jouets en location
              </h2>
              <div className="cart-section-items">
                {rentalItems.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-badge cart-item-badge--rental">
                      INCLUS
                    </div>
                    <div className="cart-item-image-wrapper">
                      <Image
                        src={
                          item.product.images?.[0] || "/assets/toys/jouet1.jpg"
                        }
                        alt={item.product.name}
                        fill
                        className="cart-item-image"
                      />
                    </div>
                    <div className="cart-item-details">
                      <h3 className="cart-item-title">{item.product.name}</h3>
                      <p className="cart-item-ref">
                        Réf: {item.product.reference}
                      </p>

                      {/* TOGGLE SUR LOCATION  | ACHAT */}
                      <div className="cart-intent-switch">
                        <button
                          onClick={() =>
                            updateItemIntent(item.product.id, "RENTAL")
                          }
                          className={`cart-intent-switch__btn ${
                            item.intent !== "PURCHASE"
                              ? "cart-intent-switch__btn--active-rental"
                              : "cart-intent-switch__btn--inactive-rental"
                          }`}
                        >
                          Location
                        </button>
                        <button
                          onClick={() =>
                            updateItemIntent(item.product.id, "PURCHASE")
                          }
                          className={`cart-intent-switch__btn ${
                            item.intent === "PURCHASE"
                              ? "cart-intent-switch__btn--active-purchase"
                              : "cart-intent-switch__btn--inactive-purchase"
                          }`}
                        >
                          Achat définitif
                        </button>
                      </div>

                      <div className="cart-item-price-wrapper">
                        <span className="cart-item-price-old">
                          Valeur : {item.product.price}€
                        </span>
                        <span className="cart-item-price-free">
                          0€ avec abonnement
                        </span>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="cart-item-delete-btn"
                      >
                        <Trash2 size={20} />
                      </button>
                      <div className="cart-item-qty-wrapper">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="cart-item-qty-btn"
                        >
                          <Minus size={14} color="#2E1D21" />
                        </button>
                        <span className="cart-item-qty-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="cart-item-qty-btn"
                        >
                          <Plus size={14} color="#2E1D21" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION ACHAT */}
          {purchaseItems.length > 0 && (
            <div className="mt-8">
              <h2 className="cart-section-heading">
                <span className="cart-section-heading__icon"></span> Vos
                achats directs
              </h2>
              <div className="cart-section-items">
                {purchaseItems.map((item) => (
                  <div
                    key={item.id}
                    className="cart-item-card cart-item-card--purchase"
                  >
                    <div className="cart-item-badge cart-item-badge--purchase">
                      ACHAT
                    </div>
                    <div className="cart-item-image-wrapper">
                      <Image
                        src={
                          item.product.images?.[0] || "/assets/toys/jouet1.jpg"
                        }
                        alt={item.product.name}
                        fill
                        className="cart-item-image"
                      />
                    </div>
                    <div className="cart-item-details">
                      <h3 className="cart-item-title">{item.product.name}</h3>
                      <p className="cart-item-ref">
                        Réf: {item.product.reference}
                      </p>

                      {/* TOGGLE PASSAGE DE LOCATION A ACHAT */}
                      <div className="cart-intent-switch">
                        <button
                          onClick={() =>
                            updateItemIntent(item.product.id, "RENTAL")
                          }
                          className={`cart-intent-switch__btn ${
                            item.intent !== "PURCHASE"
                              ? "cart-intent-switch__btn--active-rental"
                              : "cart-intent-switch__btn--inactive-rental"
                          }`}
                        >
                          Location
                        </button>
                        <button
                          onClick={() =>
                            updateItemIntent(item.product.id, "PURCHASE")
                          }
                          className={`cart-intent-switch__btn ${
                            item.intent === "PURCHASE"
                              ? "cart-intent-switch__btn--active-purchase"
                              : "cart-intent-switch__btn--inactive-purchase"
                          }`}
                        >
                          Achat définitif
                        </button>
                      </div>

                      <div className="cart-item-price-wrapper">
                        <span className="cart-item-price-old">
                          Prix neuf : {item.product.price}€
                        </span>
                        <span className="cart-item-price-purchase">
                          {item.product.biblioPrice || item.product.price}€
                          <span className="cart-item-price-purchase__unit">
                            {" "}
                            / unité
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="cart-item-delete-btn"
                      >
                        <Trash2 size={20} />
                      </button>
                      <div className="cart-item-qty-wrapper">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="cart-item-qty-btn"
                        >
                          <Minus size={14} color="#2E1D21" />
                        </button>
                        <span className="cart-item-qty-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="cart-item-qty-btn"
                        >
                          <Plus size={14} color="#2E1D21" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- COLONNE DROITE : RÉSUMÉ & ABONNEMENT --- */}
        <div className="cart-summary-card">
          <h3 className="cart-summary-title">Résumé de la commande</h3>

          {/* RÉSUMÉ LOCATION */}
          {rentalItems.length > 0 && (
            <div className="cart-plan-box">
              <p className="cart-plan-label">
                Abonnement ({rentalCount} jouet{rentalCount > 1 ? "s" : ""}) :
              </p>
              <div className="cart-plan-header">
                <span className="cart-plan-name">{planName}</span>
                <span className="cart-plan-price">
                  {cartTotalDisplay}
                  <span className="cart-plan-price-month">/mois</span>
                </span>
              </div>
              {isBoxMystereCart && (
                <p className="cart-plan-details">
                  Offre non renouvelable. Passage automatique au forfait 4
                  jouets (38 €/mois) dès le 2e mois.
                </p>
              )}
            </div>
          )}

          {/* RÉSUMÉ ACHAT */}
          {purchaseItems.length > 0 && (
            <div className="cart-summary-purchase-row">
              <span className="cart-summary-purchase-label">
                <Package size={18} color="#FF8C94" /> Achat définitif (
                {purchaseCount} article{purchaseCount > 1 ? "s" : ""})
              </span>
              <strong className="cart-summary-purchase-total">
                {purchaseTotal.toFixed(2)}€
              </strong>
            </div>
          )}
{giftCredit > 0 && (
            <div className="cart-gift-credit">
              <Gift size={18} color="#FFC93C" />
              <span className="cart-gift-credit__label">Crédit carte cadeau disponible :</span>
              <strong className="cart-gift-credit__amount">
                {(giftCredit / 100).toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}€
              </strong>
            </div>
          )}
          <div className="cart-summary-row cart-summary-margin-bottom">
            <span className="cart-summary-delivery-label">
              <Truck size={18} color="#88D4AB" /> Livraison
            </span>
            <span className="cart-summary-delivery-value">OFFERTE</span>
          </div>

          {giftCredit > 0 && baseTotal > 0 && (
            <div className="cart-summary-row cart-summary-row--bold cart-total-with-credit">
              <span>Total avec crédit déduit</span>
              <span className="cart-total-with-credit__values">
                <span className="cart-total-with-credit__old">
                  {baseTotal.toFixed(2)}€
                </span>
                <span className="cart-total-with-credit__new">
                  {totalAfterCredit.toFixed(2)}€
                </span>
              </span>
            </div>
          )}

          <div className="cart-checkout-section">
            <p className="cart-checkout-text">
              Aucun paiement n'est prélevé maintenant. Vous confirmerez{" "}
              {rentalCount > 0 && purchaseCount > 0
                ? "votre abonnement et votre achat"
                : "votre commande"}{" "}
              à l'étape suivante.
            </p>

            {/* CODE PROMO */}
            {!isBoxMystereCart && (
              <div className="cart-promo-wrapper">
                <form onSubmit={handleVerifyPromo} className="cart-promo-form">
                  <input
                    type="text"
                    placeholder="Code promo :"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoStatus("idle");
                    }}
                    className={`cart-promo-input${promoStatus === "error" ? " cart-promo-input--error" : promoStatus === "success" ? " cart-promo-input--success" : ""}`}
                  />
                  <button
                    type="submit"
                    disabled={promoStatus === "loading" || !promoCode}
                    className="cart-promo-btn"
                  >
                    {promoStatus === "loading" ? "..." : "Appliquer"}
                  </button>
                </form>
                {promoStatus === "success" && (
                  <p className="cart-promo-msg--success">{promoMessage}</p>
                )}
                {promoStatus === "error" && (
                  <p className="cart-promo-msg--error">{promoMessage}</p>
                )}
              </div>
            )}

            {/* BOUTON DE VALIDATION DU PANIER */}
            <div className="cart-checkout-btn-wrapper">
              {refillMode ? (
                <>
                  {refillError && (
                    <p className="cart-error-msg">{refillError}</p>
                  )}
                  <button
                    onClick={handleRefillValidation}
                    disabled={rentalCount === 0 || rentalCount !== refillSlots}
                    className="cart-checkout-btn-refill"
                    type="button"
                  >
                    Choisir la livraison — 0€
                  </button>
                  {rentalCount !== refillSlots && rentalCount > 0 && (
                    <p className="cart-warning-msg">
                      Vous devez louer exactement {refillSlots} jouet
                      {refillSlots > 1 ? "s" : ""} ({rentalCount} en location).
                    </p>
                  )}
                </>
              ) : exchangeMode ? (
                <>
                  {exchangeError && (
                    <p className="cart-error-msg">{exchangeError}</p>
                  )}
                  <button
                    onClick={() => handleExchangeValidation(false)}
                    disabled={exchangeLoading || rentalCount === 0}
                    className="cart-checkout-btn-exchange"
                    type="button"
                  >
                    {exchangeLoading
                      ? "Traitement..."
                      : "Confirmer l'échange — 0€"}
                  </button>
                </>
              ) : (
                <ButtonBlue
                  text="Valider ma sélection"
                  href={`/paiement${promoStatus === "success" ? `?promo=${promoCode.trim().toUpperCase()}` : ""}`}
                />
              )}
            </div>
          </div>

          <div className="cart-reassurance-wrapper">
            <div className="cart-reassurance-item">
              <CheckCircle size={14} /> Sans engagement
            </div>
            <div className="cart-reassurance-item">
              <CheckCircle size={14} /> Nettoyage PRO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
