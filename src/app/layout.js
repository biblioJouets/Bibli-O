// /src/app/layout.js
import CookieBanner from "@/components/CookieBanner"; 
import HeaderBiblioJouets from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/globals.css";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});

// --- 1. CONFIGURATION SEO GLOBALE ---
export const metadata = {
  title: {
    default: "Bibli'O jouets - Ludothèque et Location de jeux",
    template: "%s | Bibli'O jouets",
  },
  // Ta description optimisée ici 👇
  description: "Bibli'O jouets : Location de jouets éducatifs par abonnement. Une solution pratique, ludique, économique et écologique pour toute la famille.",
  
  keywords: ["ludothèque", "jeux de société", "location jeux", "abonnement jouets", "famille"],
  
  openGraph: {
    title: "Bibli'O jouets - Location par abonnement", // Petit ajustement ici aussi
    description: "Une solution pratique, ludique, économique et écologique pour toute la famille.",
    url: 'https://www.biblio-jouets.fr',
    siteName: "Bibli'O jouets",
    locale: 'fr_FR',
    type: 'website',
  },
  metadataBase: new URL('https://www.biblio-jouets.fr'),
};

// --- 2. CONFIGURATION VIEWPORT (Mobile & UI) ---
export const viewport = {
  themeColor: '#FF8C94', 
  width: 'device-width',
  initialScale: 1,
};

// Code dev existant (inchangé)
if (process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('content_script.js')) {
      return;
    }
    originalConsoleError(...args);
  };
}

export default function RootLayout({ children }) {
  return (
<html lang="fr" className={`${quicksand.variable} ${quicksand.className}`}>
      <body>
        {/* Accessibilité : skip link */}
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>

        {/* Header */}
        <HeaderBiblioJouets />

        {/* Contenu principal */}
        <main id="main-content">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Bandeau cookies */}
               <CookieBanner />
      </body>
    </html>
  );
}