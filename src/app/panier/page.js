'use client';

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import ButtonBlue from "@/components/ButtonBlue";

export default function PanierPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, loading } = useCart();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2>Votre panier est vide 🛒</h2>
        <p>Allez vite découvrir nos jouets !</p>
        <br />
        <ButtonBlue text="Voir le catalogue" href="/bibliotheque" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#2E1D21" }}>Mon Panier</h1>

      <div style={{ display: "grid", gap: "20px" }}>
        {cart.items.map((item) => (
          <div key={item.id} style={{ 
            display: "flex", 
            alignItems: "center", 
            background: "white", 
            padding: "20px", 
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
          }}>
            {/* Image */}
            <div style={{ flexShrink: 0, width: "100px", height: "100px", position: "relative" }}>
              <Image 
                src={item.product.images[0] || "/assets/toys/jouet1.jpg"} 
                alt={item.product.name}
                fill
                style={{ objectFit: "cover", borderRadius: "10px" }}
              />
            </div>

            {/* Infos */}
            <div style={{ flex: 1, padding: "0 20px" }}>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "1.2rem" }}>{item.product.name}</h3>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>Réf: {item.product.reference}</p>
              <div style={{ color: "#6EC1E4", fontWeight: "bold", marginTop: "5px" }}>
                {item.product.price}€ / mois
              </div>
            </div>

            {/* Quantité */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "30px" }}>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={{ border: "1px solid #ddd", background: "white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer" }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontWeight: "bold", width: "20px", textAlign: "center" }}>{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={{ border: "1px solid #ddd", background: "white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer" }}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Supprimer */}
            <button 
              onClick={() => removeFromCart(item.id)}
              style={{ background: "none", border: "none", color: "#FF8C94", cursor: "pointer" }}
              aria-label="Supprimer"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Résumé */}
      <div style={{ 
        marginTop: "40px", 
        textAlign: "right", 
        background: "#FFFAF4", 
        padding: "30px", 
        borderRadius: "20px" 
      }}>
        <h2 style={{ marginBottom: "10px" }}>Total mensuel : <span style={{ color: "#6EC1E4" }}>{cartTotal.toFixed(2)}€</span></h2>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "0.9rem" }}>Frais de port calculés à l'étape suivante</p>
        <ButtonBlue text="Valider mon panier" href="/commande" />
      </div>
    </div>
  );
}