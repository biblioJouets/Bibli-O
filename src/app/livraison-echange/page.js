'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { Truck, MapPin, AlertCircle } from 'lucide-react';
import '@/styles/paiement.css';

const AUTHORIZED_HOME_DELIVERY = {
  "34690": ["FABREGUES", "FABRÈGUES"],
  "34570": ["PIGNAN", "SAUSSAN"],
};

const normalizeText = (text) => {
  if (!text) return "";
  return text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

export default function LivraisonEchangePage() {
  const { data: session } = useSession();
  const { cart, exchangeContext, setExchangeContext, refillContext, setRefillContext, clearCart } = useCart();
  const router = useRouter();

  // Détermine le mode actif : échange ou réassort
  const isRefillMode    = !!refillContext?.sourceOrderId;
  const isExchangeMode  = !!exchangeContext?.orderId;

  const [deliveryMode, setDeliveryMode] = useState("DOMICILE");
  const [selectedRelay, setSelectedRelay] = useState(null);
  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", address: "", city: "", zipCode: "", phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState(null);

  // Redirection si ni échange ni réassort actif
  useEffect(() => {
    if (!isExchangeMode && !isRefillMode) {
      router.replace('/mon-compte');
    }
  }, [isExchangeMode, isRefillMode, router]);

  // Pré-remplir depuis les données utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        if (!res.ok) return;
        const { data: userData } = await res.json();
        const addresses = userData?.Addresses || userData?.addresses || [];
        const addr = addresses.find(a => a.isDefault) || addresses[0];
        setShipping({
          firstName: userData?.firstName || "",
          lastName: userData?.lastName || "",
          phone: userData?.phone || "",
          address: addr?.street || "",
          city: addr?.city || "",
          zipCode: addr?.zipCode || "",
        });
      } catch {}
    };
    fetchUser();
  }, [session]);

  // Scripts Mondial Relay
  useEffect(() => {
    const loadScripts = async () => {
      const injectScript = (src, id) => new Promise((resolve, reject) => {
        if (document.getElementById(id)) return resolve();
        const s = document.createElement("script");
        s.src = src; s.id = id; s.async = false;
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
      try {
        await injectScript("https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js", "jquery-script");
        const wait = setInterval(() => {
          if (window.jQuery) {
            clearInterval(wait);
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
        console.error("Erreur scripts:", err);
      }
    };
    loadScripts();
  }, []);

  useEffect(() => {
    if (deliveryMode === 'MONDIAL_RELAY' && window.$ && window.$.fn?.MR_ParcelShopPicker) {
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
        setSelectedRelay({ id: data.ID, name: data.Nom, address: data.Adresse1, zip: data.CP, city: data.Ville });
      }
    });
  };

  const isEligibleForHome = () => {
    if (deliveryMode !== 'DOMICILE') return true;
    const zip = shipping.zipCode.trim();
    const city = normalizeText(shipping.city);
    if (!AUTHORIZED_HOME_DELIVERY[zip]) return false;
    return AUTHORIZED_HOME_DELIVERY[zip].map(c => normalizeText(c)).some(a => city.includes(a));
  };

  const buildShippingPayload = () => {
    if (deliveryMode === 'MONDIAL_RELAY' && selectedRelay) {
      return {
        shippingName: selectedRelay.name,
        shippingAddress: selectedRelay.address,
        shippingZip: selectedRelay.zip,
        shippingCity: selectedRelay.city,
        shippingPhone: shipping.phone || null,
        mondialRelayPointId: selectedRelay.id,
      };
    }
    return {
      shippingName: `${shipping.firstName} ${shipping.lastName}`.trim(),
      shippingAddress: shipping.address,
      shippingZip: shipping.zipCode,
      shippingCity: shipping.city,
      shippingPhone: shipping.phone || null,
      mondialRelayPointId: "DOMICILE",
    };
  };

  const callExchangeAPI = async (confirmUpgrade = false, newToyCount = null) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const body = {
        orderId: exchangeContext.orderId,
        newCartItems: cart.items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        shipping: buildShippingPayload(),
        confirmUpgrade,
        ...(confirmUpgrade && newToyCount ? { newToyCount } : {}),
      };
      const res = await fetch('/api/orders/initiate-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Une erreur est survenue."); return; }
      if (data.requiresUpgrade) {
        setUpgradeInfo({ newToyCount: data.newToyCount, newMonthlyPrice: data.newMonthlyPrice });
        setShowUpgradeModal(true);
        return;
      }
      setExchangeContext(null);
      clearCart();
      router.push(`/echange-confirme${data.exchangeOrderId ? `?id=${data.exchangeOrderId}` : ''}`);
    } catch {
      setError("Problème de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const callRefillAPI = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const body = {
        sourceOrderId: refillContext.sourceOrderId,
        newCartItems: cart.items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        shipping: buildShippingPayload(),
      };
      const res = await fetch('/api/orders/initiate-refill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Une erreur est survenue."); return; }
      setRefillContext(null);
      clearCart();
      router.push('/reassort-confirme');
    } catch {
      setError("Problème de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Validation des champs communs
    if (!shipping.firstName.trim() || !shipping.lastName.trim() || !shipping.phone.trim()) {
      setError("Veuillez renseigner votre prénom, nom et téléphone.");
      return;
    }

    if (deliveryMode === 'DOMICILE') {
      if (!shipping.address.trim() || !shipping.zipCode.trim() || !shipping.city.trim()) {
        setError("Veuillez renseigner votre adresse complète.");
        return;
      }
      if (!isEligibleForHome()) {
        setError("Adresse non éligible à la livraison domicile. Veuillez choisir un Point Relais.");
        return;
      }
    }

    if (deliveryMode === 'MONDIAL_RELAY' && !selectedRelay) {
      setError("Veuillez sélectionner un Point Relais sur la carte.");
      return;
    }

    setError(null);
    if (isRefillMode) {
      callRefillAPI();
    } else {
      callExchangeAPI(false);
    }
  };

  if (!isExchangeMode && !isRefillMode) return null;

  return (
    <div className="page-container">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />

      {/* Modale upgrade */}
      {showUpgradeModal && upgradeInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E1D21]/40 backdrop-blur-sm px-4">
          <div className="bg-[#FAFAFA] p-6 sm:p-8 rounded-[25px] shadow-xl max-w-md w-full flex flex-col gap-4">
            <h3 className="text-xl font-bold text-[#2E1D21]">Passer à la formule supérieure ?</h3>
            <p className="text-[#2E1D21] opacity-90 text-sm leading-relaxed">
              Votre panier contient <strong>{upgradeInfo.newToyCount} jouets</strong>, ce qui dépasse votre abonnement actuel.
            </p>
            {upgradeInfo.newMonthlyPrice && (
              <div className="bg-white border border-[#6EC1E4] rounded-2xl p-4 text-center">
                <p className="text-xs text-[#2E1D21]/60 mb-1">Nouveau tarif mensuel</p>
                <p className="text-3xl font-bold text-[#6EC1E4]">{upgradeInfo.newMonthlyPrice}€<span className="text-sm font-normal">/mois</span></p>
              </div>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2">
              <button onClick={() => { setShowUpgradeModal(false); setUpgradeInfo(null); }}
                className="px-5 py-2.5 rounded-full border border-[#2E1D21]/20 text-[#2E1D21] hover:bg-[#2E1D21]/5 transition-colors text-sm font-medium" type="button">
                Non, retirer des jouets
              </button>
              <button onClick={() => callExchangeAPI(true, upgradeInfo.newToyCount)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-[#6EC1E4] hover:bg-[#5aafcf] text-white text-sm font-medium shadow-sm disabled:opacity-50" type="button">
                {isSubmitting ? 'Traitement...' : 'Oui, mettre à jour mon abonnement'}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="page-title">{isRefillMode ? 'Livraison de votre réassort 🎁' : 'Livraison de votre échange 🔄'}</h1>

      <div className="checkout-grid">
        <div>
          {/* Mode de livraison */}
          <div className="card-section">
            <h2 className="section-title"><Truck color="#88D4AB" /> Mode de livraison</h2>
            <div className="info-box">
              <strong className="info-title"><AlertCircle size={16} /> Info Livraison :</strong>
              La livraison à domicile est assurée uniquement sur <strong>Fabrègues, Saussan et Pignan</strong>.
              Pour toute autre ville, choisissez <strong>Mondial Relay</strong>.
            </div>
            <div className="delivery-buttons-container">
              <button type="button" onClick={() => setDeliveryMode("DOMICILE")}
                className={`delivery-btn ${deliveryMode === "DOMICILE" ? "active" : ""}`}>
                🏠 Domicile
              </button>
              <button type="button" onClick={() => setDeliveryMode("MONDIAL_RELAY")}
                className={`delivery-btn ${deliveryMode === "MONDIAL_RELAY" ? "active" : ""}`}>
                📦 Point Relais <span className="badge-recommend">Recommandé</span>
              </button>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="card-section">
            <h2 className="section-title"><MapPin size={18} color="#6EC1E4" /> Mes Coordonnées</h2>
            <form id="exchange-form" onSubmit={handleSubmit} className="form-grid">
              <div className="row-grid-2">
                <input required placeholder="Prénom" className="input-field"
                  value={shipping.firstName} onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })} />
                <input required placeholder="Nom" className="input-field"
                  value={shipping.lastName} onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })} />
              </div>
              <input required placeholder="Téléphone" className="input-field"
                value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />

              {deliveryMode === 'DOMICILE' && (
                <>
                  <input required placeholder="Adresse" className="input-field"
                    value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
                  <div className="row-grid-2">
                    <input required placeholder="Code postal" className="input-field"
                      value={shipping.zipCode} onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })} />
                    <input required placeholder="Ville" className="input-field"
                      value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                  </div>
                  {shipping.zipCode && shipping.city && !isEligibleForHome() && (
                    <p className="text-sm text-red-500 mt-1">
                      ⚠️ Cette adresse n&apos;est pas éligible à la livraison domicile. Choisissez un Point Relais.
                    </p>
                  )}
                </>
              )}

              {deliveryMode === 'MONDIAL_RELAY' && (
                <>
                  <input placeholder="Code postal (pour la recherche)" className="input-field"
                    value={shipping.zipCode} onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })} />
                  <div id="Zone_Widget" style={{ minHeight: '400px', marginTop: '1rem' }} />
                  {selectedRelay && (
                    <div className="relay-selected-box">
                      <strong>📍 Point sélectionné :</strong> {selectedRelay.name}<br />
                      {selectedRelay.address}, {selectedRelay.zip} {selectedRelay.city}
                    </div>
                  )}
                </>
              )}
            </form>
          </div>
        </div>

        {/* Colonne droite : récapitulatif + bouton */}
        <div>
          <div className="card-section">
            <h2 className="section-title">{isRefillMode ? '🎁 Récapitulatif du réassort' : '🔄 Récapitulatif de l\'échange'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
              {cart.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.product.name}</span>
                  <span style={{ color: '#6EC1E4', fontWeight: 600 }}>Inclus</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #eee', marginTop: '1rem', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', color: '#2E1D21' }}>
                <span>Total échange</span>
                <span style={{ color: '#6EC1E4' }}>0 €</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#a0888c', marginTop: '0.4rem' }}>
                L&apos;échange est inclus dans votre abonnement mensuel.
              </p>
            </div>

            {error && !showUpgradeModal && (
              <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full mt-4 px-6 py-3 rounded-full font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRefillMode
                  ? 'bg-[#88D4AB] hover:bg-[#6abf92] text-[#2E1D21]'
                  : 'bg-[#6EC1E4] hover:bg-[#5aafcf] text-white'
              }`}
            >
              {isSubmitting ? 'Traitement...' : isRefillMode ? 'Confirmer le réassort — 0€' : 'Confirmer l\'échange — 0€'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
