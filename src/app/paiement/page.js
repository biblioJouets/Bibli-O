'use client';

import { useState } from 'react';
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, CreditCard, Package } from "lucide-react";

export default function PaiementPage() {
  const { cart, loading } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    phone: ""
  });

  // --- 1. CALCUL DU PRIX DE L'ABONNEMENT AVEC OPTION MAXI BOX ---
  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const getSubscriptionPrice = (count) => {
    // Offres standards
    if (count <= 2) return 25.99;
    if (count <= 4) return 39.99;
    if (count <= 6) return 55.99;

    // Offre Maxi Box (7 à 9 jouets) : 32€ + 9€ par jouet sup
    if (count <= 9) {
        const extra = count - 6;
        const total = 55.99 + (extra * 9);
    }

    return 0; // Cas "Sur devis" (> 9)
  };

  const subscriptionPrice = getSubscriptionPrice(itemCount);

  // Si pas connecté ou panier vide
  if (!loading && (!cart.items || cart.items.length === 0)) {
    return <div className="p-20 text-center">Votre panier est vide.</div>;
  }

const handleOrder = async (e) => {
    e.preventDefault();
    
    // Sécurité Maxi Box
    if (subscriptionPrice === 0) {
        alert("Pour plus de 9 jouets, contactez-nous.");
        return;
    }

    setIsSubmitting(true);

    try {
      // 1. Sauvegarder l'adresse en BDD avant de partir chez Stripe (Optionnel mais bien)
      // Tu peux faire un appel à ton API /api/users/[id]/addresses si tu veux
      
      // 2. Appeler notre route Checkout pour avoir l'URL Stripe
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cart.items,
          shippingData: {
            shippingName: `${shipping.firstName} ${shipping.lastName}`,
            shippingAddress: shipping.address,
            shippingZip: shipping.zipCode,
            shippingCity: shipping.city,
            // ... autres champs
          }
        })
      });

      const data = await res.json();

      if (data.url) {
        // 3. Redirection vers Stripe !
        window.location.href = data.url; 
      } else {
        alert("Erreur lors de l'initialisation du paiement.");
        setIsSubmitting(false);
      }

    } catch (error) {
      console.error(error);
      alert("Erreur de connexion.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "120px 20px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#2E1D21", textAlign: "center" }}>
        Finaliser mon abonnement 🔒
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "40px" }} className="checkout-grid">
        
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div>
          <div style={{ background: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Truck color="#88D4AB" /> Adresse de livraison
            </h2>
            
            <form id="payment-form" onSubmit={handleOrder} style={{ display: "grid", gap: "15px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <input 
                  required placeholder="Prénom" 
                  className="input-field"
                  value={shipping.firstName}
                  onChange={(e) => setShipping({...shipping, firstName: e.target.value})}
                />
                <input 
                  required placeholder="Nom" 
                  className="input-field"
                  value={shipping.lastName}
                  onChange={(e) => setShipping({...shipping, lastName: e.target.value})}
                />
              </div>
              <input 
                required placeholder="Adresse (Rue, n°...)" 
                className="input-field"
                value={shipping.address}
                onChange={(e) => setShipping({...shipping, address: e.target.value})}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "15px" }}>
                <input 
                  required placeholder="Code Postal" 
                  className="input-field"
                  value={shipping.zipCode}
                  onChange={(e) => setShipping({...shipping, zipCode: e.target.value})}
                />
                <input 
                  required placeholder="Ville" 
                  className="input-field"
                  value={shipping.city}
                  onChange={(e) => setShipping({...shipping, city: e.target.value})}
                />
              </div>
              <input 
                required placeholder="Téléphone (pour le suivi)" 
                className="input-field"
                value={shipping.phone}
                onChange={(e) => setShipping({...shipping, phone: e.target.value})}
              />
            </form>
          </div>

          <div style={{ marginTop: "30px", background: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <CreditCard color="#FF8C94" /> Paiement
            </h2>
            <div style={{ padding: "15px", border: "2px solid #88D4AB", borderRadius: "10px", background: "#f0fdf4", color: "#166534" }}>
              <strong>Simulateur de Paiement (Démo)</strong>
              <p style={{ fontSize: "0.9rem" }}>Aucun prélèvement réel. Validation immédiate pour démonstration.</p>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : RÉCAP */}
        <div>
          <div style={{ background: "#FFF7EB", padding: "30px", borderRadius: "20px", position: "sticky", top: "100px" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "20px", borderBottom: "1px solid #e5e5e5", paddingBottom: "10px" }}>
              Mon Panier
            </h3>
            
            {/* Liste simplifiée des jouets */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", maxHeight: "200px", overflowY: "auto" }}>
              {cart.items?.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "#666" }}>
                  <Package size={16} color="#2E1D21" />
                  <span>{item.quantity}x {item.product.name}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px dashed #ccc", margin: "20px 0" }}></div>

            {/* Détail du prix */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "1rem" }}>
              <span>
                {itemCount <= 6 ? `Formule (${itemCount} jouets)` : `Maxi Box (${itemCount} jouets)`}
              </span>
            <strong>{Number(subscriptionPrice).toFixed(2)}€ <span style={{fontSize: "0.7em", fontWeight: "normal"}}>/mois</span></strong>            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "0.9rem", color: "#666" }}>
              <span>Livraison</span>
              <span style={{ color: "#88D4AB", fontWeight: "bold" }}>OFFERTE</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", fontWeight: "bold", fontSize: "1.5rem", color: "#2E1D21" }}>
              <span>Total à régler</span>
            <span>{Number(subscriptionPrice).toFixed(2)}€</span>
            </div>

            <button 
              type="submit" 
              form="payment-form"
              disabled={isSubmitting || subscriptionPrice === 0}
              style={{ 
                width: "100%", 
                marginTop: "25px", 
                background: isSubmitting ? "#ccc" : "#2E1D21", 
                color: "white", 
                padding: "15px", 
                borderRadius: "50px", 
                fontWeight: "bold", 
                border: "none", 
                cursor: (isSubmitting || subscriptionPrice === 0) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                fontSize: "1.1rem"
              }}
            >
              {isSubmitting ? "Validation..." : "Payer et Valider"} <ShieldCheck size={20} />
            </button>
            
            <p style={{ fontSize: "0.75rem", color: "#999", textAlign: "center", marginTop: "15px" }}>
              Paiement sécurisé. En validant, vous acceptez les CGV et le démarrage immédiat de l'abonnement.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          background: #f9f9f9;
        }
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}