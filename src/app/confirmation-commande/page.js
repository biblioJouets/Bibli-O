import Link from "next/link";
import { CheckCircle, Home } from "lucide-react";

export default function ConfirmationPage() {
  return (
    <div style={{ 
      minHeight: "80vh", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      textAlign: "center",
      padding: "20px",
      background: "#FFF7EB" ,
      backgroundImage: "radial-gradient(#FF8C94 2px, transparent 2px), radial-gradient(#88D4AB 2px, transparent 2px)",
backgroundSize: "30px 30px",
backgroundPosition: "0 0, 15px 15px"
  }}>
      <div style={{ 
        background: "white", 
        padding: "50px", 
        borderRadius: "30px", 
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        maxWidth: "600px"
      }}>
        <div style={{ display: "inline-flex", padding: "20px", borderRadius: "50%", background: "#dcfce7", marginBottom: "30px" }}>
          <CheckCircle size={64} color="#16a34a" />
        </div>
        
        <h1 style={{ fontSize: "2.5rem", color: "#2E1D21", marginBottom: "20px", fontWeight: "800" }}>Merci !</h1>
        <h2 style={{ fontSize: "1.5rem", color: "#16a34a", marginBottom: "20px" }}>Commande validée avec succès.</h2>
        
        <p style={{ color: "#666", fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "40px" }}>
          Nous préparons votre box de jouets avec le plus grand soin. <br/>
          Vous recevrez un email de confirmation dans quelques instants.
        </p>

        <Link href="/" style={{ 
          background: "#2E1D21", 
          color: "white", 
          padding: "15px 30px", 
          borderRadius: "50px", 
          textDecoration: "none", 
          fontWeight: "bold",
          display: "inline-flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <Home size={20} /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}