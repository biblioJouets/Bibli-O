"use client";

import CookieConsent from "react-cookie-consent";
import { CONSENT_EVENT } from "@/components/ConsentAnalytics";

export default function CookieBanner() {
  // Couleurs inspirées de l'univers ludique (à ajuster avec vos codes HEX exacts)
  const colors = {
    background: "#fff7eb",     
    text: "#2e1d21",            
    primary: "#ff8c94",         
    secondary: "#fff7eb",       
    secondaryText: "#4a5568"
  };

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accepter et jouer"
      enableDeclineButton
      declineButtonText="Continuer sans tracer"
      cookieName="biblio-jouets-consent"
      expires={365}
      onAccept={() => {
        window.dispatchEvent(new Event(CONSENT_EVENT));
      }}
      
      // 1. Le conteneur principal (La bannière)
      style={{
        background: colors.background,
        color: colors.text,
        boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)", // Ombre douce pour la profondeur
        padding: "10px 20px",
        borderTop: `5px solid ${colors.primary}`, // Une petite touche de couleur en haut
        alignItems: "center",
      }}

      // 2. Le bouton "Accepter" (Ludique et rond)
      buttonStyle={{
        background: colors.primary,
        color: "white",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "50px", // Très arrondi (style pillule/jouet)
        padding: "10px 20px",
        margin: "30px",
        border: "none",
        cursor: "pointer",
        transition: "transform 0.2s", // Pourrait être animé en CSS externe
      }}

      // 3. Le bouton "Refuser" (Plus discret)
      declineButtonStyle={{
        background: colors.secondary,
        color: colors.secondaryText,
        fontSize: "14px",
        borderRadius: "50px",
        padding: "10px 20px",
        margin: "10px",
        cursor: "pointer",
      }}
    >
      <div style={{ paddingRight: "10px" }}>
        <span style={{ fontSize: "1.2em", display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          🍪 Un petit cookie pour la route ?
        </span>
        Nous utilisons des cookies pour rendre votre visite sur Bibli'O Jouets plus agréable.
      </div>
    </CookieConsent>
  );
}