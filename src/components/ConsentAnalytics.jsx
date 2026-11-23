"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

const CONSENT_COOKIE = "biblio-jouets-consent";
export const CONSENT_EVENT = "biblio-consent-accepted";

function hasAnalyticsConsent() {
  return document.cookie.split("; ").includes(`${CONSENT_COOKIE}=true`);
}

export default function ConsentAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(hasAnalyticsConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!gaId || !allowed) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
