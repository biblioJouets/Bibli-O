"use client";

import { usePathname } from "next/navigation";
import HeaderBiblioJouets from "@/components/Header";
import Footer from "@/components/Footer";

export default function ConditionalShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <HeaderBiblioJouets />}
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}
