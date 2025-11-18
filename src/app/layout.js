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
