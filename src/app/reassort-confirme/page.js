import Link from "next/link";
import { CheckCircle, Package, Home } from "lucide-react";

export default function ReassortConfirmePage() {
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
      backgroundImage: "radial-gradient(#88D4AB 2px, transparent 2px), radial-gradient(#FF8C94 2px, transparent 2px)",
      backgroundSize: "30px 30px",
      backgroundPosition: "0 0, 15px 15px",
    }}>
      <div style={{
        background: "white",
        padding: "50px",
        borderRadius: "30px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        width: "100%",
      }}>
        <div style={{ display: "inline-flex", padding: "20px", borderRadius: "50%", background: "#DAEEE6", marginBottom: "24px" }}>
          <span style={{ fontSize: "64px", lineHeight: 1 }}>🎁</span>
        </div>

        <h1 style={{ fontSize: "2.2rem", color: "#2E1D21", marginBottom: "12px", fontWeight: "800" }}>
          Réassort confirmé !
        </h1>
        <h2 style={{ fontSize: "1.2rem", color: "#3a9e6f", marginBottom: "20px", fontWeight: "600" }}>
          Votre jouet de remplacement est en préparation.
        </h2>

        <p style={{ color: "#666", fontSize: "1rem", lineHeight: "1.7", marginBottom: "16px" }}>
          Nous préparons votre nouveau jouet avec le plus grand soin.<br />
          Vous recevrez un email de confirmation dans quelques instants.
        </p>

        <div style={{
          background: "#F2FAF6",
          border: "1px solid rgba(136,212,171,0.4)",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "32px",
          textAlign: "left",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Package size={18} color="#3a9e6f" />
            <span style={{ fontWeight: "700", color: "#2E1D21", fontSize: "0.95rem" }}>Ce qui se passe maintenant</span>
          </div>
          <ul style={{ paddingLeft: "28px", color: "#555", fontSize: "0.9rem", lineHeight: "1.8", margin: 0 }}>
            <li>Le jouet adopté est retiré de votre box</li>
            <li>L&apos;équipe prépare votre jouet de remplacement</li>
            <li>Vous le recevrez à votre adresse habituelle</li>
          </ul>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <Link
            href="/mon-compte/commandes"
            style={{
              background: "#88D4AB",
              color: "#2E1D21",
              padding: "14px 28px",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.95rem",
            }}
          >
            <Package size={18} /> Voir mes commandes
          </Link>
          <Link
            href="/"
            style={{
              color: "#a0888c",
              padding: "10px 20px",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.875rem",
              border: "1px solid rgba(46,29,33,0.12)",
            }}
          >
            <Home size={16} /> Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
