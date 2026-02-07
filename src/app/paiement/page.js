'use client';

import { useState, useEffect } from 'react';
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, Package, MapPin, AlertCircle } from "lucide-react"; 

export default function PaiementPage() {
  const { cart, loading } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState("DOMICILE"); 
  const [selectedRelay, setSelectedRelay] = useState(null); 
  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    phone: ""
  });

  // --- 1. CONFIGURATION DES ZONES ÉLIGIBLES À DOMICILE ---
  const AUTHORIZED_HOME_DELIVERY = {
    "34690": ["FABREGUES", "FABRÈGUES"],
    "34570": ["PIGNAN", "SAUSSAN"]
  };

  // Fonction utilitaire pour nettoyer le texte (enlever accents, mettre en majuscule)
  const normalizeText = (text) => {
    return text
      .toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents
      .trim(); 
  };

  // Vérifie si l'adresse saisie est éligible
  const isEligibleForHome = () => {
    if (deliveryMode !== 'DOMICILE') return true; // Si Mondial Relay, toujours OK

    const zip = shipping.zipCode.trim();
    const city = normalizeText(shipping.city);

    // Si le code postal n'est pas dans la liste
    if (!AUTHORIZED_HOME_DELIVERY[zip]) return false;

    // Si le code postal est bon, on vérifie si la ville est dans la liste autorisée
    const allowedCities = AUTHORIZED_HOME_DELIVERY[zip].map(c => normalizeText(c));
    return allowedCities.some(allowed => city.includes(allowed));
  };
  
  const canSubmit = isEligibleForHome();

  // --- 2. CALCUL DU PRIX (MISE À JOUR) ---
  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const getSubscriptionPrice = (count) => {
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
    // Retourne le prix ou 0 si hors grille (ex: > 9 jouets)
    return pricingMap[count] || 0;
  };

  const subscriptionPrice = getSubscriptionPrice(itemCount);

  // --- CHARGEMENT SCRIPTS (Mondial Relay) ---
  useEffect(() => {
    const loadScripts = async () => {
      const injectScript = (src, id) => {
        return new Promise((resolve, reject) => {
          if (document.getElementById(id)) return resolve(); 
          const script = document.createElement("script");
          script.src = src;
          script.id = id;
          script.async = false; 
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      try {
        await injectScript("https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js", "jquery-script");
        
        const waitForJQuery = setInterval(() => {
          if (window.jQuery) {
            clearInterval(waitForJQuery);
            window.$ = window.jQuery; 

            Promise.all([
              injectScript("https://unpkg.com/leaflet/dist/leaflet.js", "leaflet-js"),
              injectScript("https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js", "mr-plugin")
            ]).then(() => {
              if (deliveryMode === 'MONDIAL_RELAY') loadMondialRelayWidget();
            });
          }
        }, 50);
      } catch (err) {
        console.error("❌ Erreur scripts:", err);
      }
    };
    loadScripts();
  }, []); 

  useEffect(() => {
     if (deliveryMode === 'MONDIAL_RELAY' && window.$ && window.$.fn.MR_ParcelShopPicker) {
         loadMondialRelayWidget();
     }
  }, [deliveryMode]);

  const loadMondialRelayWidget = () => {
    if (!window.$ || !window.$("#Zone_Widget").length) return;
    window.$("#Zone_Widget").html(""); 
    window.$("#Zone_Widget").MR_ParcelShopPicker({
      Target: "#Zone_Widget",
      Brand: process.env.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID || "BDTEST13", 
      Country: "FR",
      PostCode: shipping.zipCode || "34000", 
      ColLivMod: "24R",
      NbResults: "7",
      ShowResultsOnMap: true, 
      OnParcelShopSelected: (data) => {
        setSelectedRelay({
          id: data.ID,
          name: data.Nom,
          address: data.Adresse1,
          zip: data.CP,
          city: data.Ville
        });
      }
    });
  };

  const handleOrder = async (e) => {
    e.preventDefault();

    // Sécurité : Si le prix est 0 (ex: 10 jouets ou bug), on bloque
    if (subscriptionPrice === 0) {
        alert("Pour plus de 9 jouets, veuillez nous contacter pour une offre sur mesure.");
        return;
    }

    if (deliveryMode === 'DOMICILE' && !canSubmit) {
        alert("La livraison à domicile n'est pas disponible pour votre adresse. Veuillez choisir Mondial Relay.");
        return;
    }

    if (deliveryMode === 'MONDIAL_RELAY' && !selectedRelay) {
        alert("Veuillez sélectionner un point relais sur la carte.");
        return;
    }

    setIsSubmitting(true);

    try {
      const finalShippingData = {
        shippingName: deliveryMode === 'MONDIAL_RELAY'
            ? selectedRelay.name
            : `${shipping.firstName} ${shipping.lastName}`,
        shippingPhone: shipping.phone,
        shippingAddress: deliveryMode === 'MONDIAL_RELAY' ? selectedRelay.address : shipping.address,
        shippingZip: deliveryMode === 'MONDIAL_RELAY' ? selectedRelay.zip : shipping.zipCode,
        shippingCity: deliveryMode === 'MONDIAL_RELAY' ? selectedRelay.city : shipping.city,
        mondialRelayPointId: deliveryMode === 'MONDIAL_RELAY' ? selectedRelay.id : "DOMICILE"
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cart.items,
          cartId: cart.id,
          shippingData: finalShippingData
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert("Erreur init paiement : " + (data.error || "Inconnue"));
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur connexion.");
      setIsSubmitting(false);
    }
  };

  if (!loading && (!cart.items || cart.items.length === 0)) {
    return <div className="p-20 text-center">Votre panier est vide.</div>;
  }

  return (
  <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "120px 20px" }}>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />

    <h1 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#2E1D21", textAlign: "center" }}>
        Finaliser mon abonnement 🔒
    </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "40px" }} className="checkout-grid">
        
        {/* COLONNE GAUCHE */}
        <div>
          {/* 1. CHOIX DU MODE DE LIVRAISON */}
          <div style={{ background: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
             <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Truck color="#88D4AB" /> Mode de livraison
            </h2>

            {/* MESSAGE D'INFORMATION IMPORTANT */}
            <div style={{ background: "#EAF7FC", color: "#0077b6", padding: "15px", borderRadius: "8px", fontSize: "0.9rem", marginBottom: "20px", borderLeft: "4px solid #0077b6" }}>
                <strong style={{display: "flex", alignItems: "center", gap: "5px"}}><AlertCircle size={16}/> Info Livraison :</strong>
                La livraison à domicile est assurée par nos soins uniquement sur <strong>Fabrègues, Saussan et Pignan</strong>.
                Pour toute autre ville, merci de choisir <strong>Mondial Relay</strong>.
            </div>

            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <button 
                    type="button"
                    onClick={() => setDeliveryMode("DOMICILE")}
                    style={{
                        flex: 1, padding: "15px", borderRadius: "10px", border: deliveryMode === "DOMICILE" ? "2px solid #2E1D21" : "1px solid #ddd",
                        background: deliveryMode === "DOMICILE" ? "#FFF7EB" : "white", cursor: "pointer", fontWeight: "bold"
                    }}
                >
                    🏠 Domicile
                </button>
                <button 
                    type="button"
                    onClick={() => setDeliveryMode("MONDIAL_RELAY")}
                    style={{
                        flex: 1, padding: "15px", borderRadius: "10px", border: deliveryMode === "MONDIAL_RELAY" ? "2px solid #2E1D21" : "1px solid #ddd",
                        background: deliveryMode === "MONDIAL_RELAY" ? "#FFF7EB" : "white", cursor: "pointer", fontWeight: "bold",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                    }}
                >
                   📦 Point Relais <span style={{fontSize: "0.7rem", background: "#88D4AB", color: "white", padding: "2px 6px", borderRadius: "4px"}}>Recommandé</span>
                </button>
            </div>
          </div>

          {/* 2. FORMULAIRE ADRESSE */}
          <div style={{ background: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              📍 Mes Coordonnées
            </h2>
            
            <form id="payment-form" onSubmit={handleOrder} style={{ display: "grid", gap: "15px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <input required placeholder="Prénom" className="input-field"
                  value={shipping.firstName} onChange={(e) => setShipping({...shipping, firstName: e.target.value})} />
                <input required placeholder="Nom" className="input-field"
                  value={shipping.lastName} onChange={(e) => setShipping({...shipping, lastName: e.target.value})} />
              </div>

              {/* LOGIQUE D'AFFICHAGE ET D'ERREUR POUR DOMICILE */}
              {deliveryMode === 'DOMICILE' && (
                  <>
                    <input required placeholder="Adresse (Rue, n°...)" className="input-field"
                        value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} />
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "15px" }}>
                        <input required placeholder="Code Postal (ex: 34570)" className="input-field"
                        value={shipping.zipCode} 
                        onChange={(e) => setShipping({...shipping, zipCode: e.target.value})} 
                        style={{ border: !canSubmit && shipping.zipCode ? "2px solid red" : "1px solid #ddd" }}
                        />
                        <input required placeholder="Ville (ex: Pignan)" className="input-field"
                        value={shipping.city} 
                        onChange={(e) => setShipping({...shipping, city: e.target.value})} 
                        style={{ border: !canSubmit && shipping.city ? "2px solid red" : "1px solid #ddd" }}
                        />
                    </div>
                    
                    {/* Message d'erreur dynamique */}
                    {!canSubmit && shipping.zipCode && shipping.city && (
                        <div style={{ color: "red", fontSize: "0.85rem", marginTop: "-10px" }}>
                            ⚠️ Livraison à domicile impossible pour cette zone ({shipping.city}). <br/>
                            Veuillez choisir <strong>Mondial Relay</strong>.
                        </div>
                    )}
                  </>
              )}

              {deliveryMode === 'MONDIAL_RELAY' && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "15px" }}>
                    <input required placeholder="Code Postal (pour la carte)" className="input-field"
                        value={shipping.zipCode} 
                        onChange={(e) => {
                            setShipping({...shipping, zipCode: e.target.value});
                        }} 
                    />
                    <div style={{ display: "flex", alignItems: "center", fontSize: "0.9rem", color: "#666" }}>
                        Code postal pour centrer la carte.
                    </div>
                  </div>
              )}

              <input required placeholder="Téléphone (pour le suivi)" className="input-field"
                value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})} />
            
              {deliveryMode === 'MONDIAL_RELAY' && (
                  <div style={{ marginTop: "20px" }}>
                      <p style={{marginBottom: "10px", fontWeight: "bold"}}>Choisissez votre point de retrait :</p>
                      <div id="Zone_Widget" style={{ width: "100%", height: "500px", background: "#f9f9f9", borderRadius: "10px" }}></div>
                      {selectedRelay && (
                          <div style={{ marginTop: "15px", padding: "15px", background: "#EAF7FC", border: "1px solid #6EC1E4", borderRadius: "10px", color: "#0077b6" }}>
                              <strong>Point sélectionné :</strong><br/>
                              {selectedRelay.name}<br/>
                              {selectedRelay.address}, {selectedRelay.zip} {selectedRelay.city}
                          </div>
                      )}
                  </div>
              )}
            </form>
          </div>
        </div>

        {/* COLONNE DROITE : RÉCAP */}
        <div>
          <div style={{ background: "#FFF7EB", padding: "30px", borderRadius: "20px", position: "sticky", top: "100px" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "20px", borderBottom: "1px solid #e5e5e5", paddingBottom: "10px" }}>
              Mon Panier
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", maxHeight: "200px", overflowY: "auto" }}>
              {cart.items?.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "#666" }}>
                  <Package size={16} color="#2E1D21" />
                  <span>{item.quantity}x {item.product.name}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px dashed #ccc", margin: "20px 0" }}></div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "1rem" }}>
              <span>
                {itemCount <= 9 ? `Box ${itemCount} jouet${itemCount > 1 ? 's' : ''}` : `Maxi Box (${itemCount} jouets)`}
              </span>
              <strong>{Number(subscriptionPrice).toFixed(2)}€ <span style={{fontSize: "0.7em", fontWeight: "normal"}}>/mois</span></strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "0.9rem", color: "#666" }}>
              <span>Livraison</span>
              <span style={{ color: "#88D4AB", fontWeight: "bold" }}>OFFERTE</span>
            </div>

            {deliveryMode === 'MONDIAL_RELAY' && selectedRelay && (
                <div style={{ marginBottom: "20px", fontSize: "0.85rem", color: "#666", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                    <span style={{display:"flex", alignItems:"center", gap:"5px"}}> <MapPin size={14}/> Livraison à :</span>
                    <strong>{selectedRelay.name}</strong><br/>
                    {selectedRelay.city} ({selectedRelay.id})
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", fontWeight: "bold", fontSize: "1.5rem", color: "#2E1D21" }}>
              <span>Total à régler</span>
              <span>{Number(subscriptionPrice).toFixed(2)}€</span>
            </div>

            <button 
              type="submit" 
              form="payment-form"
              disabled={isSubmitting || subscriptionPrice === 0 || (deliveryMode === 'DOMICILE' && !canSubmit)}
              style={{ 
                width: "100%", 
                marginTop: "25px", 
                background: (isSubmitting || (deliveryMode === 'DOMICILE' && !canSubmit)) ? "#ccc" : "#2E1D21", 
                color: "white", 
                padding: "15px", 
                borderRadius: "50px", 
                fontWeight: "bold", 
                border: "none", 
                cursor: (isSubmitting || (deliveryMode === 'DOMICILE' && !canSubmit)) ? "not-allowed" : "pointer",
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