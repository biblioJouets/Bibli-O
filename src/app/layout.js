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

export const metadata = {
  icons: {
    icon: '/favicon.ico',
  },
  
  title: {
    default: "Bibli'O jouets - Location de jeux pour enfants",
    template: "%s | Bibli'O jouets",
  },
  
  description: "Découvrez Bibliojouets (Bibli'O), votre service de location de jouets éducatifs par abonnement. Une solution ludique, économique et écologique pour toute la famille.",
  
  keywords: ["bibliojouets", "biblio jouets", "bibli o jouets", "ludothèque", "jeux de société", "location jeux", "abonnement jouets", "famille"],
  
  openGraph: {
    title: "Bibli'O jouets - Location par abonnement", 
    description: "Une solution pratique, ludique, économique et écologique pour toute la famille.",
        url: 'https://www.bibliojouets.fr', 
    siteName: "Bibli'O jouets",
    locale: 'fr_FR',
    type: 'website',
  },
    metadataBase: new URL('https://www.bibliojouets.fr'),
};
export const viewport = {
  themeColor: '#FF8C94', 
  width: 'device-width',
  initialScale: 1,
};
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