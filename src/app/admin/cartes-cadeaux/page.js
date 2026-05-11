"use client";

import { useEffect, useState } from "react";
import { Gift, Plus, Copy, Check, Loader2 } from "lucide-react";

const STATUS = {
  idle: null,
  loading: "loading",
  success: "success",
  error: "error",
};

function Badge({ used }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={
        used
          ? { background: "#fee2e2", color: "#991b1b" }
          : { background: "#DAEEE6", color: "#3b8c6e" }
      }
    >
      {used ? "Utilisé" : "Disponible"}
    </span>
  );
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
    <button
      onClick={handleCopy}
      title="Copier le code"
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono font-semibold transition"
      style={{ background: "#f3f4f6", color: "#2E1D21" }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {text}
    </button>
  );
}

export default function CartCadeauxPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState(30);
  const [count, setCount] = useState(1);
  const [genStatus, setGenStatus] = useState(STATUS.idle);
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
    setGenStatus(STATUS.loading);
    setNewCodes([]);
    setGenMessage("");

    const res = await fetch("/api/admin/gift-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount), count: parseInt(count) }),
    });
    const data = await res.json();

    if (res.ok) {
      setGenStatus(STATUS.success);
      setGenMessage(`${data.codes.length} code(s) généré(s) avec succès.`);
      setNewCodes(data.codes);
      fetchCodes();
    } else {
      setGenStatus(STATUS.error);
      setGenMessage(data.error || "Erreur lors de la génération.");
    }
  }

  const total = codes.length;
  const used = codes.filter((c) => c.isUsed).length;
  const available = total - used;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: 48, height: 48, background: "#ffe264" }}
        >
          <Gift size={24} style={{ color: "#2E1D21" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2E1D21" }}>
            Cartes Cadeaux
          </h1>
          <p className="text-sm text-gray-500">
            Génère et gère les codes cadeaux tombola
          </p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total générés", value: total, color: "#6EC1E4" },
          { label: "Disponibles", value: available, color: "#3b8c6e" },
          { label: "Utilisés", value: used, color: "#a0888c" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[25px] bg-white p-5 flex flex-col gap-1 shadow-sm"
            style={{ border: "1px solid #eee" }}
          >
            <span className="text-3xl font-bold" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-xs text-gray-500 font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Formulaire génération */}
      <div
        className="rounded-[25px] bg-white p-6 shadow-sm flex flex-col gap-5"
        style={{ border: "1px solid #eee" }}
      >
        <h2 className="font-bold text-lg" style={{ color: "#2E1D21" }}>
          Générer de nouveaux codes
        </h2>

        <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Montant (€)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl border px-4 py-2.5 text-sm w-32 outline-none"
              style={{ borderColor: "#e5e7eb", color: "#2E1D21" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Quantité
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="rounded-xl border px-4 py-2.5 text-sm w-24 outline-none"
              style={{ borderColor: "#e5e7eb", color: "#2E1D21" }}
            />
          </div>

          <button
            type="submit"
            disabled={genStatus === STATUS.loading}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition disabled:opacity-60"
            style={{ background: "#2E1D21", color: "#fff" }}
          >
            {genStatus === STATUS.loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Générer
          </button>
        </form>

        {/* Feedback génération */}
        {genStatus === STATUS.success && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{ background: "#DAEEE6", color: "#3b8c6e" }}
          >
            <p className="font-semibold mb-2">{genMessage}</p>
            <div className="flex flex-wrap gap-2">
              {newCodes.map((c) => (
                <CopyButton key={c.id} text={c.code} />
              ))}
            </div>
          </div>
        )}
        {genStatus === STATUS.error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{ background: "#fee2e2", color: "#991b1b" }}
          >
            {genMessage}
          </div>
        )}
      </div>

      {/* Table des codes */}
      <div
        className="rounded-[25px] bg-white shadow-sm overflow-hidden"
        style={{ border: "1px solid #eee" }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: "#f3f4f6" }}>
          <h2 className="font-bold text-lg" style={{ color: "#2E1D21" }}>
            Tous les codes ({total})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : codes.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">
            Aucun code généré pour l'instant.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#FFFAF4" }}>
                  {["Code", "Montant", "Statut", "Utilisé par", "Date activation", "Créé le"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#a0888c" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {codes.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderTop: i > 0 ? "1px solid #f3f4f6" : undefined,
                    }}
                  >
                    <td className="px-5 py-3">
                      <CopyButton text={c.code} />
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: "#2E1D21" }}>
                      {c.amount.toFixed(2)} €
                    </td>
                    <td className="px-5 py-3">
                      <Badge used={c.isUsed} />
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {c.user
                        ? `${c.user.firstName ?? ""} ${c.user.lastName ?? ""}`.trim() ||
                          c.user.email
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {c.usedAt
                        ? new Date(c.usedAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
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
