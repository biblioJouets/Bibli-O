'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdoptModal({ orderId, productId, productName, onClose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAdopt = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders/adopt-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      // Redirige vers Stripe Checkout
      router.push(data.url);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(46, 29, 33, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-8 flex flex-col gap-5"
        style={{ backgroundColor: '#FAFAFA', borderRadius: '25px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titre */}
        <h2 className="text-xl font-bold text-center" style={{ color: '#2E1D21' }}>
          Adopter <span className="text-[#FF8C94]">{productName}</span> ?
        </h2>

        {/* Message de réassurance */}
        <div
          className="rounded-[20px] p-4 text-sm leading-relaxed"
          style={{ backgroundColor: '#DAEEE6', color: '#2E1D21' }}
        >
          En adoptant ce jouet, votre abonnement mensuel continue normalement. Une place se libère
          instantanément : vous pourrez choisir un nouveau jouet en cliquant sur{' '}
          <strong>«&nbsp;Échanger&nbsp;»</strong> juste après !
        </div>

        {/* Erreur éventuelle */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-1">
          <button
            type="button"
            onClick={handleAdopt}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 font-semibold text-white rounded-full transition-opacity"
            style={{ backgroundColor: '#FF8C94' }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Redirection vers le paiement…
              </>
            ) : (
              'Confirmer l\'adoption'
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 px-6 font-semibold rounded-full border border-gray-300 text-gray-500 hover:border-gray-400 transition-colors text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
