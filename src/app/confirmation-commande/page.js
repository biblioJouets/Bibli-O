'use client';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Home, Package } from "lucide-react";

const CONTEXTS = {
  refill: {
    accent: "#88D4AB",
    icon: "🎁",
    title: "Réassort confirmé !",
    subtitle: "Votre nouveau jouet est en préparation.",
    body: "Nous préparons votre jouet de remplacement avec le plus grand soin.\nVous recevrez un email de confirmation dans quelques instants.",
    cta: { label: "Voir mes commandes", href: "/mon-compte/commandes" },
  },
  default: {
    accent: "#16a34a",
    icon: null,
    title: "Merci !",
    subtitle: "Commande validée avec succès.",
    body: "Nous préparons votre box de jouets avec le plus grand soin.\nVous recevrez un email de confirmation dans quelques instants.",
    cta: { label: "Retour à l'accueil", href: "/" },
  },
};

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const ctx = CONTEXTS[type] ?? CONTEXTS.default;

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "20px",
      background: "#FFF7EB",
      backgroundImage: "radial-gradient(#FF8C94 2px, transparent 2px), radial-gradient(#88D4AB 2px, transparent 2px)",
      backgroundSize: "30px 30px",
      backgroundPosition: "0 0, 15px 15px",
    }}>
      <div style={{
        background: "white",
        padding: "50px",
        borderRadius: "30px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        maxWidth: "600px",
      }}>
        <div style={{ display: "inline-flex", padding: "20px", borderRadius: "50%", background: "#dcfce7", marginBottom: "30px" }}>
          {ctx.icon
            ? <span style={{ fontSize: "64px", lineHeight: 1 }}>{ctx.icon}</span>
            : <CheckCircle size={64} color={ctx.accent} />
          }
        </div>

        <h1 style={{ fontSize: "2.5rem", color: "#2E1D21", marginBottom: "20px", fontWeight: "800" }}>{ctx.title}</h1>
        <h2 style={{ fontSize: "1.5rem", color: ctx.accent, marginBottom: "20px" }}>{ctx.subtitle}</h2>

        <p style={{ color: "#666", fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "40px", whiteSpace: "pre-line" }}>
          {ctx.body}
        </p>

        <Link href={ctx.cta.href} style={{
          background: "#2E1D21",
          color: "white",
          padding: "15px 30px",
          borderRadius: "50px",
          textDecoration: "none",
          fontWeight: "bold",
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
        }}>
          {type === "refill" ? <Package size={20} /> : <Home size={20} />}
          {ctx.cta.label}
        </Link>
      </div>
    </div>
  );
}