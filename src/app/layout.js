// /src/app/layout.js

import HeaderBiblioJouets from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/globals.css";


import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});
if (process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Ignore les erreurs liées à content_script.js
    if (args[0] && typeof args[0] === 'string' && args[0].includes('content_script.js')) {
      return;
    }
    originalConsoleError(...args);
  };
}
export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={quicksand.className}>
      <body>
        <HeaderBiblioJouets />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
