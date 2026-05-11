"use client";

import { useEffect, useState } from "react";
import { Wallet, Loader2 } from "lucide-react";

export default function WidgetStripeBalance() {
  const [balance, setBalance] = useState(null); // null = chargement
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/user/stripe-balance")
      .then((r) => r.json())
      .then((data) => setBalance(data.balance ?? 0))
      .catch(() => setError(true));
  }, []);

  // Pas de solde = rien à afficher
  if (balance === 0) return null;

  return (
    <div
      className="bg-white rounded-[25px] shadow-sm p-6 flex flex-col gap-4"
      style={{ border: "1px solid #eee" }}
    >
      <div className="flex items-center gap-2">
        <Wallet size={20} style={{ color: "#6EC1E4" }} aria-hidden="true" />
        <h3 className="font-bold text-lg" style={{ color: "#2E1D21" }}>
          Mon crédit
        </h3>
      </div>

      {error ? (
        <p className="text-sm text-gray-400">Impossible de récupérer le solde.</p>
      ) : balance === null ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Chargement…
        </div>
      ) : (
        <>
          <div
            className="flex items-baseline gap-1 rounded-2xl px-5 py-4"
            style={{ background: "#ffe264" }}
          >
            <span className="text-3xl font-bold" style={{ color: "#2E1D21" }}>
              {(balance / 100).toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-lg font-semibold" style={{ color: "#2E1D21" }}>
              €
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Ce crédit sera automatiquement déduit de ta prochaine facture.
          </p>
        </>
      )}
    </div>
  );
}
