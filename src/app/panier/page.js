'use client';

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, Gift, Truck, CheckCircle } from "lucide-react";
import ButtonBlue from "@/components/ButtonBlue";

export default function PanierPage() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();

  // Calcul du totale des produits 
  const cartValue = cart.items?.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0) || 0;

  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // --- LOGIQUE SUGGESTION ABONNEMENT ---
  const getSuggestedPlan = (count) => {
    // Cas standards
    if (count <= 2) return { name: "Découverte", price: "25.99€", contactLink: null };
    if (count <= 4) return { name: "Standard", price: "39.99€", contactLink: null };
    if (count <= 6) return { name: "Premium", price: "55.99€", contactLink: null };
    
    // SUR DEVIS
    return { 
        name: "Sur devis", 
        price: null, 
        contactLink: "/contact"
    };
  };

  const suggestedPlan = getSuggestedPlan(itemCount);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "100px 20px",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ background: "#DAEEE6", padding: "2rem", borderRadius: "50%", marginBottom: "2rem" }}>
            <Gift size={64} color="#88D4AB" />
        </div>
        <h2 style={{ fontSize: "2rem", color: "#2E1D21", marginBottom: "1rem" }}>Votre coffre à jouets est vide 🛒</h2>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>Commencez par ajouter des jeux pour composer votre box idéale !</p>
        <br />
        <ButtonBlue text="Parcourir la bibliothèque" href="/bibliotheque" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 20px 60px 20px" }}>
      
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "#2E1D21", fontWeight: "800" }}>
          Ma Sélection
        </h1>
        <p style={{ color: "#666" }}>
          Vous avez sélectionné <strong>{itemCount} jouet{itemCount > 1 ? 's' : ''}</strong> pour votre prochaine box.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", alignItems: "start" }} className="cart-layout">
        
        {/* --- LISTE DES JOUETS --- */}
        <div style={{ display: "grid", gap: "20px" }}>
          {cart.items.map((item) => (
            <div key={item.id} style={{ 
              display: "flex", 
              alignItems: "center", 
              background: "white", 
              padding: "20px", 
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              border: "1px solid #f0f0f0",
              position: "relative",
              overflow: "hidden"
            }}>
              
              <div style={{
                position: "absolute",
                top: "0",
                left: "0",
                background: "#88D4AB",
                color: "white",
                fontSize: "0.7rem",
                padding: "5px 10px",
                borderBottomRightRadius: "10px",
                fontWeight: "bold"
              }}>
                INCLUS
              </div>

              <div style={{ flexShrink: 0, width: "120px", height: "120px", position: "relative", background: "#f9f9f9", borderRadius: "15px", overflow: "hidden" }}>
                <Image 
                  src={item.product.images && item.product.images[0] ? item.product.images[0] : "/assets/toys/jouet1.jpg"} 
                  alt={item.product.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div style={{ flex: 1, padding: "0 25px" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", color: "#2E1D21" }}>{item.product.name}</h3>
                <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: "10px" }}>Réf: {item.product.reference}</p>
                
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ textDecoration: "line-through", color: "#ccc", fontSize: "0.9rem" }}>
                        Valeur : {item.product.price}€
                    </span>
                    <span style={{ color: "#6EC1E4", fontWeight: "bold", background: "#EAF7FC", padding: "4px 12px", borderRadius: "20px", fontSize: "0.9rem"}}>
                        0€ avec abonnement
                    </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: "15px" }}>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: "none", border: "none", color: "#FF8C94", cursor: "pointer", padding: "5px" }}
                  aria-label="Supprimer"
                >
                  <Trash2 size={20} />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFF7EB", borderRadius: "30px", padding: "5px" }}>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ border: "none", background: "white", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}
                  >
                    <Minus size={14} color="#2E1D21" />
                  </button>
                  <span style={{ fontWeight: "bold", width: "20px", textAlign: "center", fontSize: "0.9rem" }}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ border: "none", background: "white", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}
                  >
                    <Plus size={14} color="#2E1D21" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- RÉSUMÉ & ABONNEMENT --- */}
        <div style={{ 
          background: "white", 
          padding: "30px", 
          borderRadius: "25px", 
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          border: "2px solid #FFF7EB",
          position: "sticky",
          top: "100px"
        }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #FFF7EB", paddingBottom: "15px" }}>
            Ma future Box
          </h3>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#666" }}>
            <span>Nombre de jouets</span>
            <strong>{itemCount}</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#666" }}>
            <span>Valeur réelle des jouets</span>
            <span style={{ textDecoration: "line-through" }}>{cartValue.toFixed(2)}€</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", color: "#2E1D21", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} color="#88D4AB" /> Livraison
            </span>
            <span style={{ color: "#88D4AB", fontWeight: "bold" }}>OFFERTE</span>
          </div>

          {/*  FORMULE DYNAMIQUE */}
          <div style={{ background: "#FFF7EB", padding: "20px", borderRadius: "15px", marginBottom: "25px" }}>
            <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "5px" }}>Formule suggérée :</p>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#FF8C94" }}>{suggestedPlan.name}</span>
                
                {/* Condition : Afficher le prix OU le lien Contact */}
                {suggestedPlan.contactLink ? (
                    <Link 
                        href={suggestedPlan.contactLink}
                        style={{ 
                            color: "#6EC1E4", 
                            fontWeight: "bold", 
                            textDecoration: "underline",
                            fontSize: "1rem" 
                        }}
                    >
                        Nous contacter
                    </Link>
                ) : (
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#2E1D21" }}>
                        {suggestedPlan.price}<span style={{fontSize: "0.8rem", fontWeight: "normal"}}>/mois</span>
                    </span>
                )}
            </div>
            
            <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "5px" }}>
                {itemCount} jouets sélectionnés
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "#999", marginBottom: "15px" }}>
                Aucun paiement n'est prélevé maintenant. Vous choisirez votre abonnement à l'étape suivante.
            </p>
            <div style={{ width: "100%" }}>
                {suggestedPlan.contactLink ? (
                     <ButtonBlue text="Demander un devis" href="/contact" />
                ) : (
                     <ButtonBlue text="Valider ma sélection" href="/paiement" />
                )}
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#88D4AB" }}>
                <CheckCircle size={14} /> Sans engagement
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#88D4AB" }}>
                <CheckCircle size={14} /> Nettoyage & désinfection
             </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}