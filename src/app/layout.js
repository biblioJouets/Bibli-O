// /src/app/layout.js
import CookieBanner from "@/components/CookieBanner"; 
import HeaderBiblioJouets from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProviderClient from "@/components/SessionProviderClient"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CartProvider } from "@/context/CartContext";
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
  
  // CORRECTION 1 : J'ai ajouté "Bibliojouets" (attaché) dans la phrase naturellement
  description: "Découvrez Bibliojouets (Bibli'O), votre service de location de jouets éducatifs par abonnement. Une solution ludique, économique et écologique pour toute la famille.",
  
  // CORRECTION 2 : Ajout des variantes orthographiques que les gens vont taper
  keywords: ["bibliojouets", "biblio jouets", "bibli o jouets", "ludothèque", "jeux de société", "location jeux", "abonnement jouets", "famille"],
  
  openGraph: {
    title: "Bibli'O jouets - Location par abonnement", 
    description: "Une solution pratique, ludique, économique et écologique pour toute la famille.",
    
    // CORRECTION 3 : Vérifie bien si c'est avec ou sans tiret ici !
    // Si ton site est bibliojouets.fr, enlève le tiret ci-dessous :
    url: 'https://www.bibliojouets.fr', 
    
    siteName: "Bibli'O jouets",
    locale: 'fr_FR',
    type: 'website',
  },
  
  // CORRECTION 4 : Idem, attention au tiret
  metadataBase: new URL('https://www.bibliojouets.fr'),
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
const session = await getServerSession(authOptions);

export default function RootLayout({ children }) {
  return (
<html lang="fr" className={`${quicksand.variable} ${quicksand.className}`}>
      <body>
        {/* Accessibilité : skip link */}
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>

      <SessionProviderClient session={session}>
        <CartProvider>
          <HeaderBiblioJouets />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
        </CartProvider>
        </SessionProviderClient>

      </body>
    </html>
  );
}