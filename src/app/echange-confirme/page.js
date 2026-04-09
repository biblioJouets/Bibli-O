import Link from "next/link";
import { CheckCircle, Package, Home } from "lucide-react";

export default function EchangeConfirmePage() {
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
      backgroundImage: "radial-gradient(#6EC1E4 2px, transparent 2px), radial-gradient(#A8D5A2 2px, transparent 2px)",
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
        <div style={{ display: "inline-flex", padding: "20px", borderRadius: "50%", background: "#EBF7FD", marginBottom: "24px" }}>
          <CheckCircle size={64} color="#6EC1E4" />
        </div>

        <h1 style={{ fontSize: "2.2rem", color: "#2E1D21", marginBottom: "12px", fontWeight: "800" }}>
          Échange confirmé ! 🔄
        </h1>
        <h2 style={{ fontSize: "1.2rem", color: "#6EC1E4", marginBottom: "20px", fontWeight: "600" }}>
          Votre boîte navette est en préparation.
        </h2>

        <p style={{ color: "#666", fontSize: "1rem", lineHeight: "1.7", marginBottom: "16px" }}>
          Nous préparons vos nouveaux jouets avec soin.<br />
          Vous recevrez un email de confirmation dans quelques instants.
        </p>

        <div style={{
          background: "#F5F9FF",
          border: "1px solid rgba(110,193,228,0.3)",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "32px",
          textAlign: "left",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Package size={18} color="#6EC1E4" />
            <span style={{ fontWeight: "700", color: "#2E1D21", fontSize: "0.95rem" }}>Ce qui se passe maintenant</span>
          </div>
          <ul style={{ paddingLeft: "28px", color: "#555", fontSize: "0.9rem", lineHeight: "1.8", margin: 0 }}>
            <li>L&apos;équipe prépare votre nouvelle sélection</li>
            <li>Vous recevrez votre boîte navette par courrier</li>
            <li>Renvoyez vos anciens jouets dans la même boîte</li>
          </ul>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <Link
            href="/mon-compte/commandes"
            style={{
              background: "#6EC1E4",
              color: "white",
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
