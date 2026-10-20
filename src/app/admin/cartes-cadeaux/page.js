"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Plus, Copy, Check, Loader2 } from "lucide-react";
import "@/styles/admin-gift-cards.css";

function personName(user) {
  if (!user) return "—";
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name || user.email || "—";
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button type="button" className="admin-gifts__code" onClick={handleCopy} title="Copier le code">
      {copied ? <Check size={12} /> : <Copy size={12} />} {text}
    </button>
  );
}

export default function CartCadeauxPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(30);
  const [count, setCount] = useState(1);
  const [genStatus, setGenStatus] = useState("idle");
  const [genMessage, setGenMessage] = useState("");
  const [newCodes, setNewCodes] = useState([]);

  async function fetchCodes() {
    setLoading(true);
    const res = await fetch("/api/admin/gift-codes");
    const data = await res.json();
    setCodes(data.codes ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchCodes(); }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setGenStatus("loading");
    setNewCodes([]);
    setGenMessage("");

    const res = await fetch("/api/admin/gift-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount), count: parseInt(count, 10) }),
    });
    const data = await res.json();

    if (res.ok) {
      setGenStatus("success");
      setGenMessage(`${data.codes.length} code(s) généré(s) avec succès.`);
      setNewCodes(data.codes);
      fetchCodes();
    } else {
      setGenStatus("error");
      setGenMessage(data.error || "Erreur lors de la génération.");
    }
  }

  const total = codes.length;
  const used = codes.filter((c) => c.isUsed).length;
  const available = total - used;

  return (
    <div className="admin-gifts">
      <div className="admin-gifts__header">
        <div className="admin-gifts__icon"><Gift size={24} color="#2E1D21" /></div>
        <div>
          <h1>Cartes Cadeaux</h1>
          <p>Codes générés à la main et codes issus des commandes clients.</p>
        </div>
      </div>

      <div className="admin-gifts__stats">
        {[
          { label: "Total générés", value: total, color: "#6EC1E4" },
          { label: "Disponibles", value: available, color: "#3b8c6e" },
          { label: "Utilisés", value: used, color: "#a0888c" },
        ].map((stat) => (
          <div key={stat.label} className="admin-gifts__stat">
            <strong style={{ color: stat.color }}>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="admin-gifts__panel">
        <h2>Générer de nouveaux codes</h2>
        <form onSubmit={handleGenerate} className="admin-gifts__form">
          <label className="admin-gifts__field">
            Montant (€)
            <input type="number" min="1" max="500" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="admin-gifts__field">
            Quantité
            <input type="number" min="1" max="50" value={count} onChange={(e) => setCount(e.target.value)} />
          </label>
          <button type="submit" className="admin-gifts__submit" disabled={genStatus === "loading"}>
            {genStatus === "loading" ? <Loader2 size={16} /> : <Plus size={16} />} Générer
          </button>
        </form>
        {genStatus === "success" && (
          <div className="admin-gifts__feedback">
            <p>{genMessage}</p>
            <div>{newCodes.map((c) => <CopyButton key={c.id} text={c.code} />)}</div>
          </div>
        )}
        {genStatus === "error" && <div className="admin-gifts__feedback admin-gifts__feedback--error">{genMessage}</div>}
      </div>

      <div className="admin-gifts__table-wrap">
        <h2>Tous les codes ({total})</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : codes.length === 0 ? (
          <p>Aucun code généré pour l&apos;instant.</p>
        ) : (
          <div className="admin-gifts__scroll">
            <table>
              <thead>
                <tr>
                  {["Code", "Montant", "Statut", "Commande", "Acheteur", "Bénéficiaire", "Réception", "Utilisé par", "Créé le"].map((heading) => (
                    <th key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.id}>
                    <td><CopyButton text={code.code} /></td>
                    <td>{Number(code.amount).toFixed(2)} €</td>
                    <td>
                      <span className={`admin-gifts__badge ${code.isUsed ? "admin-gifts__badge--used" : "admin-gifts__badge--ok"}`}>
                        {code.isUsed ? "Utilisé" : "Disponible"}
                      </span>
                    </td>
                    <td>
                      {code.order?.id ? (
                        <Link className="admin-gifts__order-link" href="/admin/orders?type=GIFT_CARD">
                          #{code.order.id}
                        </Link>
                      ) : "—"}
                    </td>
                    <td>{personName(code.purchaser)}</td>
                    <td>
                      {code.recipientName || "—"}
                      {code.recipientEmail ? <><br />{code.recipientEmail}</> : null}
                    </td>
                    <td>
                      {!code.order
                        ? "Manuel"
                        : code.order.giftDeliveryMethod === "POSTAL"
                          ? "Voie postale +2 €"
                          : "E-mail"}
                    </td>
                    <td>{personName(code.user)}</td>
                    <td>{new Date(code.createdAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
