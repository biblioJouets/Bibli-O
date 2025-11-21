"use client";

import CookieConsent from "react-cookie-consent";

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="J'accepte"
      cookieName="biblio-jouets-consent"
      expires={365}
    >
      Ce site utilise des cookies pour améliorer votre expérience.
    </CookieConsent>
  );
}
