'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, Truck, CheckCircle, Gift } from "lucide-react";
import ButtonBlue from "@/components/ButtonBlue";
import '@/styles/panier.css';


export default function PanierPage() {
  const { cart, updateQuantity, removeFromCart, loading, exchangeContext, setExchangeContext } = useCart();
  const router = useRouter();

  const exchangeMode = !!exchangeContext;
  const exchangeOrderId = exchangeContext?.orderId ?? null;

  // États pour la modale upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState(null); // { newToyCount, newMonthlyPrice }
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeError, setExchangeError] = useState(null);

  
  // Calcul valeur théorique (Prix boutique des jouets)
  const cartValue = cart.items?.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0) || 0;

  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // --- LOGIQUE MODE ÉCHANGE ---
  const buildCartPayload = () =>
    cart.items.map((item) => ({ productId: item.product.id, quantity: item.quantity }));

  const handleExchangeValidation = async (confirmUpgrade = false) => {
    setExchangeLoading(true);
    setExchangeError(null);
    try {
      const body = {
        orderId: exchangeOrderId,
        newCartItems: buildCartPayload(),
        confirmUpgrade,
        ...(confirmUpgrade && upgradeInfo ? { newToyCount: upgradeInfo.newToyCount } : {}),
      };
      const res = await fetch('/api/orders/initiate-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setExchangeError(data.error || "Une erreur est survenue.");
        return;
      }
      if (data.requiresUpgrade) {
        setUpgradeInfo({ newToyCount: data.newToyCount, newMonthlyPrice: data.newMonthlyPrice });
        setShowUpgradeModal(true);
        return;
      }
      // Succès — effacer le contexte d'échange
      setExchangeContext(null);
      router.push('/mon-compte?exchange=success');
    } catch {
      setExchangeError("Problème de connexion. Veuillez réessayer.");
    } finally {
      setExchangeLoading(false);
    }
  };

  // ---  NOUVELLE LOGIQUE TARIFAIRE ---
  const getSuggestedPlan = (count) => {
    // Grille tarifaire exacte fournie
    const pricingMap = {
        1: 20,
        2: 25,
        3: 35,
        4: 38,
        5: 45,
        6: 51,
        7: 56,
        8: 60,
        9: 63
    };

    // Si le panier est vide
    if (!count || count === 0) return { name: "Aucune formule", price: "0€", contactLink: null };

    // Si le nombre est dans la grille (1 à 9)
    if (pricingMap[count]) {
        return { 
            name: `Box ${count} Jouet${count > 1 ? 's' : ''}`, 
            price: `${pricingMap[count]}€`, 
            contactLink: null,
            details: null
        };
    }

    // Au-delà de 9 jouets -> Sur devis
    return { 
        name: "Maxi Box (+9 jouets)", 
        price: "Sur devis", 
        contactLink: "/contact",
        details: "Besoin d'une offre sur mesure ?"
    };
  };

    // ---   CODE PROMO ---  
  const suggestedPlan = getSuggestedPlan(itemCount);
  const [promoCode, setPromoCode] = useState("");  
  const cleanCode = promoCode.trim().toUpperCase();
  const isPromoValid = cleanCode.length > 0;

  const [promoStatus, setPromoStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
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
            body: JSON.stringify({ promoCode: promoCode.trim() })
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
  // ------------------------------------------------


  // --- AFFICHAGE PANIER VIDE ---
  if (!loading && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="cart-empty-container">
        <div className="cart-empty-icon-wrapper">
             <Gift size={64} color="#88D4AB" />
        </div>
        <h2 className="cart-empty-title">Votre coffre à jouets est vide 🛒</h2>
        <p className="cart-empty-text">Commencez par ajouter des jeux pour composer votre box idéale !</p>
        <ButtonBlue text="Parcourir la bibliothèque" href="/bibliotheque" />
      </div>
    );
  }

  // --- AFFICHAGE PANIER REMPLI ---
  return (
    <div className="cart-page-container">

      {/* Bandeau mode échange */}
      {exchangeMode && (
        <div className="w-full bg-[#6EC1E4] text-white px-6 py-3 flex items-center justify-between gap-4 rounded-[16px] mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔄</span>
            <div>
              <p className="font-semibold text-sm leading-tight">Mode Échange — Panier à 0€</p>
              <p className="text-xs opacity-90">Votre sélection remplacera vos jouets actuels sans frais supplémentaires.</p>
            </div>
          </div>
          <a href="/mon-compte" className="text-xs underline underline-offset-2 opacity-80 hover:opacity-100 whitespace-nowrap">
            Annuler
          </a>
        </div>
      )}

      {/* Modale upgrade abonnement */}
      {showUpgradeModal && upgradeInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E1D21]/40 backdrop-blur-sm px-4">
          <div className="bg-[#FAFAFA] p-6 sm:p-8 rounded-[25px] shadow-xl max-w-md w-full flex flex-col gap-4">
            <h3 className="text-xl font-bold text-[#2E1D21]">Passer à la formule supérieure ?</h3>
            <p className="text-[#2E1D21] opacity-90 text-sm leading-relaxed">
              Votre panier contient <strong>{upgradeInfo.newToyCount} jouets</strong>, ce qui dépasse votre abonnement actuel.
              Pour finaliser cet échange, votre abonnement sera mis à jour.
            </p>
            {upgradeInfo.newMonthlyPrice && (
              <div className="bg-white border border-[#6EC1E4] rounded-2xl p-4 text-center">
                <p className="text-xs text-[#2E1D21]/60 mb-1">Nouveau tarif mensuel</p>
                <p className="text-3xl font-bold text-[#6EC1E4]">{upgradeInfo.newMonthlyPrice}€<span className="text-sm font-normal">/mois</span></p>
                <p className="text-xs text-[#2E1D21]/50 mt-1">Facturation au prorata immédiate</p>
              </div>
            )}
            {exchangeError && <p className="text-red-500 text-sm text-center">{exchangeError}</p>}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2">
              <button
                onClick={() => { setShowUpgradeModal(false); setUpgradeInfo(null); }}
                className="px-5 py-2.5 rounded-full border border-[#2E1D21]/20 text-[#2E1D21] hover:bg-[#2E1D21]/5 transition-colors text-sm font-medium"
                type="button"
              >
                Non, retirer des jouets
              </button>
              <button
                onClick={() => handleExchangeValidation(true)}
                disabled={exchangeLoading}
                className="px-6 py-2.5 rounded-full bg-[#6EC1E4] hover:bg-[#5aafcf] text-white text-sm font-medium shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {exchangeLoading ? 'Traitement...' : 'Oui, mettre à jour mon abonnement'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="cart-header">
        <h1 className="cart-header-title">
          Ma Sélection
        </h1>
        <p className="cart-header-subtitle">
          Vous avez sélectionné <strong>{itemCount} jouet{itemCount > 1 ? 's' : ''}</strong> pour votre prochaine box.
        </p>
      </header>

      <div className="cart-layout">
        
        {/* --- COLONNE GAUCHE : LISTE DES JOUETS --- */}
        <div className="cart-items-list">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item-card">
              
              <div className="cart-item-badge">
                INCLUS
              </div>

              <div className="cart-item-image-wrapper">
                <Image 
                  src={item.product.images && item.product.images[0] ? item.product.images[0] : "/assets/toys/jouet1.jpg"} 
                  alt={item.product.name}
                  fill
                  className="cart-item-image"
                />
              </div>

              <div className="cart-item-details">
                <h3 className="cart-item-title">{item.product.name}</h3>
                <p className="cart-item-ref">Réf: {item.product.reference}</p>
                
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
                  aria-label="Supprimer"
                >
                  <Trash2 size={20} />
                </button>

                <div className="cart-item-qty-wrapper">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="cart-item-qty-btn"
                  >
                    <Minus size={14} color="#2E1D21" />
                  </button>
                  <span className="cart-item-qty-text">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="cart-item-qty-btn"
                  >
                    <Plus size={14} color="#2E1D21" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- COLONNE DROITE : RÉSUMÉ & ABONNEMENT --- */}
        <div className="cart-summary-card">
          <h3 className="cart-summary-title">
            Ma future Box
          </h3>

          <div className="cart-summary-row">
            <span>Nombre de jouets</span>
            <strong className="cart-summary-row-bold">{itemCount}</strong>
          </div>

          <div className="cart-summary-row">
            <span>Valeur réelle des jouets</span>
            <span className="cart-summary-price-old">{cartValue.toFixed(2)}€</span>
          </div>

          <div className="cart-summary-row cart-summary-margin-bottom">
            <span className="cart-summary-delivery-label">
                <Truck size={18} color="#88D4AB" /> Livraison
            </span>
            <span className="cart-summary-delivery-value">OFFERTE</span>
          </div>

          {/* FORMULE DYNAMIQUE MISE À JOUR */}
          <div className="cart-plan-box">
            <p className="cart-plan-label">Formule calculée :</p>
            
            <div className="cart-plan-header">
                <span className="cart-plan-name">{suggestedPlan.name}</span>
                
                {suggestedPlan.contactLink ? (
                    <Link 
                        href={suggestedPlan.contactLink}
                        className="cart-plan-link"
                    >
                        Nous contacter
                    </Link>
                ) : (
                    <span className="cart-plan-price">
                        {suggestedPlan.price}<span className="cart-plan-price-month">/mois</span>
                    </span>
                )}
            </div>
            
            {suggestedPlan.details && (
                <p className="cart-plan-details">
                    {suggestedPlan.details}
                </p>
            )}
          </div>

          <div className="cart-checkout-section">
            <p className="cart-checkout-text">
                Aucun paiement n'est prélevé maintenant. Vous confirmerez votre abonnement à l'étape suivante.
            </p>

            {/* Section Promo Code  */}
  {/* 🛡️ CHAMP CODE PROMO INTERACTIF */}
{!suggestedPlan.contactLink && (
  <div className="mb-4 text-left w-full mt-2">
    <form onSubmit={handleVerifyPromo} className="flex gap-2 w-full">
      <input
        type="text"
        placeholder="Code promo :"
        value={promoCode}
        onChange={(e) => {
          setPromoCode(e.target.value.toUpperCase());
          setPromoStatus("idle"); // Efface le message dès qu'on retape
        }}
        className={`flex-1 bg-[#FFFAF4] border-2 rounded-[25px] px-4 py-3 text-[#2E1D21] focus:outline-none transition-colors ${
          promoStatus === 'error' ? 'border-[#FF8C94] animate-shake' : 
          promoStatus === 'success' ? 'border-[#88D4AB]' : 
          'border-[#DFF1F9] focus:border-[#6EC1E4]'
        }`}
      />
      <button 
        type="submit" 
        disabled={promoStatus === 'loading' || !promoCode} 
        className="bg-[#DFF1F9] text-[#6EC1E4] hover:bg-[#6EC1E4] hover:text-white font-bold rounded-[25px] px-5 py-3 transition-colors disabled:opacity-50"
      >
         {promoStatus === 'loading' ? '...' : 'Appliquer'}
      </button>
    </form>
    
    {/* Messages de retour visuel */}
    {promoStatus === 'success' && (
      <p className="text-[#88D4AB] text-sm mt-2 font-medium px-2">{promoMessage}</p>
    )}
    {promoStatus === 'error' && (
      <p className="text-[#FF8C94] text-sm mt-2 font-medium px-2">{promoMessage}</p>
    )}
  </div>
)}

{/* BOUTON DE VALIDATION DU PANIER */}
<div className="cart-checkout-btn-wrapper">
    {exchangeMode ? (
      <>
        {exchangeError && !showUpgradeModal && (
          <p className="text-red-500 text-sm text-center mb-2">{exchangeError}</p>
        )}
        <button
          onClick={() => handleExchangeValidation(false)}
          disabled={exchangeLoading || itemCount === 0}
          className="w-full px-6 py-3 rounded-full bg-[#6EC1E4] hover:bg-[#5aafcf] text-white font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {exchangeLoading ? 'Traitement...' : 'Confirmer l\'échange — 0€'}
        </button>
      </>
    ) : suggestedPlan.contactLink ? (
          <ButtonBlue text="Demander un devis" href="/contact" />
    ) : (
          <ButtonBlue
            text="Valider ma sélection"
            href={`/paiement${promoStatus === 'success' ? `?promo=${promoCode.trim().toUpperCase()}` : ''}`}
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