/* src/app/paiement/page.js */
'use client';

import { useState, useEffect } from 'react';
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, Package, MapPin, AlertCircle } from "lucide-react"; 
import '@/styles/paiement.css';

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

  // --- NOUVEAU : RÉCUPÉRATION DES DONNÉES UTILISATEUR POUR PRÉ-REMPLIR LE FORMULAIRE ---
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/users/${session.user.id}`);
          if (res.ok) {
            const response = await res.json();
            const userData = response.data;
            
            if (userData) {
              // Récupération des adresses et recherche de celle par défaut
              const addresses = userData.Addresses || userData.addresses || userData.Address || [];
              const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];

              // Mise à jour de l'état avec les données récupérées
              setShipping({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                phone: userData.phone || "",
                address: defaultAddress ? defaultAddress.street : "",
                city: defaultAddress ? defaultAddress.city : "",
                zipCode: defaultAddress ? defaultAddress.zipCode : "",
              });
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur", error);
        }
      }
    };

    fetchUserData();
  }, [session]); // Ce useEffect se déclenche quand la session est chargée
  // ----------------------------------------------------------------------------------

  // Zones éligibles domicile
  const AUTHORIZED_HOME_DELIVERY = {
    "34690": ["FABREGUES", "FABRÈGUES"],
    "34570": ["PIGNAN", "SAUSSAN"]
  };

  const normalizeText = (text) => {
    if (!text) return "";
    return text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); 
  };

  const isEligibleForHome = () => {
    if (deliveryMode !== 'DOMICILE') return true; 
    const zip = shipping.zipCode.trim();
    const city = normalizeText(shipping.city);
    if (!AUTHORIZED_HOME_DELIVERY[zip]) return false;
    const allowedCities = AUTHORIZED_HOME_DELIVERY[zip].map(c => normalizeText(c));
    return allowedCities.some(allowed => city.includes(allowed));
  };
  
  const canSubmit = isEligibleForHome();

  // Calcul prix
  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const getSubscriptionPrice = (count) => {
    const pricingMap = {
        1: 20, 2: 25, 3: 35, 4: 38, 5: 45, 
        6: 51, 7: 56, 8: 60, 9: 63
    };
    return pricingMap[count] || 0;
  };
  const subscriptionPrice = getSubscriptionPrice(itemCount);

  // Scripts Mondial Relay
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
      Responsive: true,
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

    if (subscriptionPrice === 0) {
        alert("Pour plus de 9 jouets, veuillez nous contacter.");
        return;
    }
    if (deliveryMode === 'DOMICILE' && !canSubmit) {
        alert("Adresse non éligible domicile.");
        return;
    }
    if (deliveryMode === 'MONDIAL_RELAY' && !selectedRelay) {
        alert("Veuillez sélectionner un point relais.");
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
    return <div className="page-container cart-empty-msg">Votre panier est vide.</div>;
  }

  return (
  <div className="page-container">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />

    <h1 className="page-title">Finaliser mon abonnement 🔒</h1>

      <div className="checkout-grid">
        
        {/* COLONNE GAUCHE (Formulaire) */}
        <div>
          {/* Mode de livraison */}
          <div className="card-section">
             <h2 className="section-title">
              <Truck color="#88D4AB" /> Mode de livraison
            </h2>

            <div className="info-box">
                <strong className="info-title"><AlertCircle size={16}/> Info Livraison :</strong>
                La livraison à domicile est assurée par nos soins uniquement sur <strong>Fabrègues, Saussan et Pignan</strong>.
                Pour toute autre ville, merci de choisir <strong>Mondial Relay</strong>.
            </div>

            <div className="delivery-buttons-container">
                <button 
                    type="button"
                    onClick={() => setDeliveryMode("DOMICILE")}
                    className={`delivery-btn ${deliveryMode === "DOMICILE" ? "active" : ""}`}
                >
                    🏠 Domicile
                </button>
                <button 
                    type="button"
                    onClick={() => setDeliveryMode("MONDIAL_RELAY")}
                    className={`delivery-btn ${deliveryMode === "MONDIAL_RELAY" ? "active" : ""}`}
                >
                   📦 Point Relais <span className="badge-recommend">Recommandé</span>
                </button>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="card-section">
            <h2 className="section-title">📍 Mes Coordonnées</h2>
            
            <form id="payment-form" onSubmit={handleOrder} className="form-grid">
              <div className="row-grid-2">
                <input required placeholder="Prénom" className="input-field"
                  value={shipping.firstName} onChange={(e) => setShipping({...shipping, firstName: e.target.value})} />
                <input required placeholder="Nom" className="input-field"
                  value={shipping.lastName} onChange={(e) => setShipping({...shipping, lastName: e.target.value})} />
              </div>

              {/* Domicile */}
              {deliveryMode === 'DOMICILE' && (
                  <>
                    <input required placeholder="Adresse (Rue, n°...)" className="input-field full-width"
                        value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} />
                    
                    <div className="row-grid-1-2">
                        <input required placeholder="Code Postal" 
                        className={`input-field ${!canSubmit && shipping.zipCode ? 'input-error' : ''}`}
                        value={shipping.zipCode} 
                        onChange={(e) => setShipping({...shipping, zipCode: e.target.value})} 
                        />
                        <input required placeholder="Ville (ex: Pignan)" 
                        className={`input-field ${!canSubmit && shipping.city ? 'input-error' : ''}`}
                        value={shipping.city} 
                        onChange={(e) => setShipping({...shipping, city: e.target.value})} 
                        />
                    </div>
                    
                    {!canSubmit && shipping.zipCode && shipping.city && (
                        <div className="error-msg">
                            ⚠️ Livraison impossible (Zone non desservie). Choisissez Mondial Relay.
                        </div>
                    )}
                  </>
              )}

              {/* Mondial Relay */}
              {deliveryMode === 'MONDIAL_RELAY' && (
                  <div className="row-grid-1-2-relay">
                    <input required placeholder="Code Postal (pour la carte)" className="input-field"
                        value={shipping.zipCode} 
                        onChange={(e) => setShipping({...shipping, zipCode: e.target.value})} 
                    />
                    <div className="helper-text-relay">Code postal pour centrer la carte.</div>
                  </div>
              )}

              <input required placeholder="Téléphone (pour le suivi)" className="input-field full-width"
                value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})} />
            
              {deliveryMode === 'MONDIAL_RELAY' && (
                  <div className="relay-section-wrapper">
                      <p className="relay-title">Choisissez votre point de retrait :</p>
                      
                      {/* CONTENEUR DU WIDGET */}
                      <div id="Zone_Widget" className="mondial-relay-widget-container"></div>
                      
                      {selectedRelay && (
                          <div className="relay-selected-box">
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

        {/* COLONNE DROITE (Récap) */}
        <div>
          <div className="summary-card">
            <h3 className="summary-title">Mon Panier</h3>
            
            <div className="cart-items-list">
              {cart.items?.map(item => (
                <div key={item.id} className="cart-item-row">
                  <Package size={16} color="#2E1D21" />
                  <span>{item.quantity}x {item.product.name}</span>
                </div>
              ))}
            </div>

            <div className="divider"></div>

            <div className="price-row">
              <span>{itemCount <= 9 ? `Box ${itemCount} jouet${itemCount > 1 ? 's' : ''}` : `Maxi Box`}</span>
              <strong>{Number(subscriptionPrice).toFixed(2)}€ <span className="month-suffix">/mois</span></strong>
            </div>

            <div className="price-row-small">
              <span>Livraison</span>
              <span className="free-text">OFFERTE</span>
            </div>

            {deliveryMode === 'MONDIAL_RELAY' && selectedRelay && (
                <div className="relay-summary">
                    <span className="icon-text-row"> <MapPin size={14}/> Livraison à :</span>
                    <strong>{selectedRelay.name}</strong><br/>
                    {selectedRelay.city} ({selectedRelay.id})
                </div>
            )}

            <div className="total-row">
              <span>Total à régler</span>
              <span>{Number(subscriptionPrice).toFixed(2)}€</span>
            </div>

            <button 
              type="submit" 
              form="payment-form"
              disabled={isSubmitting || subscriptionPrice === 0 || (deliveryMode === 'DOMICILE' && !canSubmit)}
              className={`submit-btn ${(isSubmitting || (deliveryMode === 'DOMICILE' && !canSubmit)) ? 'disabled' : ''}`}
            >
              {isSubmitting ? "Validation..." : "Payer et Valider"} <ShieldCheck size={20} />
            </button>
            
            <p className="secure-text">Paiement sécurisé. En validant, vous acceptez les CGV.</p>
          </div>
        </div>
      </div>
    </div>
  );
}