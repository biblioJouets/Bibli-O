'use client';
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, Truck, CheckCircle, Gift } from "lucide-react";
import ButtonBlue from "@/components/ButtonBlue";
import '@/styles/panier.css'; 


export default function PanierPage() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const [promoCode, setPromoCode] = useState("");

  // Calcul valeur théorique (Prix boutique des jouets)
  const cartValue = cart.items?.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0) || 0;

  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

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

  const suggestedPlan = getSuggestedPlan(itemCount);
  const isPromoValid = promoCode === 'BIBLIOMOISOFFERT';
  
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
            {!suggestedPlan.contactLink && (
              <div className="mb-4 text-left w-full mt-2">
                <input
                  type="text"
                  placeholder="Code promo (ex: BIBLIOMOISOFFERT)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#FFFAF4] border-2 border-[#DFF1F9] rounded-[25px] px-4 py-3 text-[#2E1D21] focus:outline-none focus:border-[#6EC1E4] transition-colors"
                />
                {isPromoValid && (
                  <p className="text-[#88D4AB] text-sm mt-2 font-medium px-2">
                    Super ! 1er mois payé, 2ème mois à 0€ !
                  </p>
                )}
              </div>
            )}

            <div className="cart-checkout-btn-wrapper">
                {suggestedPlan.contactLink ? (
                      <ButtonBlue text="Demander un devis" href="/contact" />
                ) : (
                      <ButtonBlue text="Valider ma sélection" href={`/paiement${isPromoValid ? '?promo=BIBLIOMOISOFFERT' : ''}`} />
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