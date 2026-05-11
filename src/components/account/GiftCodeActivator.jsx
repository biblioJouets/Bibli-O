"use client";

import { useState } from "react";
import { Gift, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function GiftCodeActivator() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: "success" | "error", message: string }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/user/gift-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ type: "success", message: data.message });
        setCode("");
      } else {
        setResult({ type: "error", message: data.message || "Une erreur est survenue." });
      }
    } catch {
      setResult({ type: "error", message: "Impossible de contacter le serveur. Réessayez." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="bg-white rounded-[25px] shadow-sm p-6 flex flex-col gap-4"
      style={{ border: "1px solid #eee" }}
    >
      <div className="flex items-center gap-2">
        <Gift size={20} style={{ color: "#b06b3a" }} aria-hidden="true" />
        <h3 className="font-bold text-lg" style={{ color: "#2E1D21" }}>
          Carte cadeau
        </h3>
      </div>

      <p className="text-sm text-gray-500">
        Saisis ton code pour créditer ton compte Bibli'O Jouets.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="EX : BJ-XXXX-XXXX"
          disabled={loading}
          maxLength={32}
          autoComplete="off"
          className="w-full rounded-xl border= py-2.5 text-sm font-mono tracking-widest outline-none transition"
          style={{
            borderColor: "#e5e7eb",
            color: "#2E1D21",
          }}
        />

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ background: "#2E1D21", color: "#fff" }}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Gift size={16} aria-hidden="true" />
          )}
          {loading ? "Activation…" : "Activer ma carte cadeau"}
        </button>
      </form>

      {result && (
        <div
          className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
          style={{
            background: result.type === "success" ? "#DAEEE6" : "#fee2e2",
            color: result.type === "success" ? "#3b8c6e" : "#991b1b",
          }}
        >
          {result.type === "success" ? (
            <CheckCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
