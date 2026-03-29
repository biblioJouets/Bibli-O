/* src/components/account/ReturnModal.jsx */
'use client';

import { useState } from 'react';

export default function ReturnModal({ orderId, productId, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [returnLabelUrl, setReturnLabelUrl] = useState(null);

  const handleConfirmReturn = () => {
    setStep(2);
  };

  const handleKeepToy = () => {
    onClose();
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders/return-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      setReturnLabelUrl(data.returnLabelUrl || null);
      setStep(3);
      onSuccess();
    } catch {
      setError("Problème de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E1D21]/40 backdrop-blur-sm px-4">
      <div className="bg-[#FAFAFA] p-6 sm:p-8 rounded-[25px] shadow-xl max-w-md w-full flex flex-col gap-4 animate-in fade-in zoom-in duration-200">

        {/* ── ÉTAPE 1 : Confirmation initiale ── */}
        {step === 1 && (
          <>
            <h3 className="text-xl font-bold text-[#2E1D21]">Rendre ce jouet ?</h3>
            <p className="text-[#2E1D21] opacity-90 text-sm leading-relaxed">
              Êtes-vous sûr de vouloir rendre ce jouet ? Cette action mettra fin à la location.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-[#2E1D21]/20 text-[#2E1D21] hover:bg-[#2E1D21]/5 transition-colors text-sm font-medium"
                type="button"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-6 py-2.5 rounded-full bg-[#FF8C94] hover:bg-[#e87a82] text-white text-sm font-medium shadow-sm transition-transform hover:scale-105 active:scale-95"
                type="button"
              >
                Oui, je veux rendre
              </button>
            </div>
          </>
        )}

        {/* ── ÉTAPE 2 : Rétention (offre code promo) ── */}
        {step === 2 && (
          <>
            <h3 className="text-xl font-bold text-[#2E1D21]">Avant de partir...</h3>
            <p className="text-[#2E1D21] opacity-90 text-sm leading-relaxed">
              Voici un code promo pour continuer l'aventure avec vos enfants !
            </p>
            <div className="bg-white border border-[#A8D5A2] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#2E1D21]/60 mb-1">Votre code exclusif</p>
              <p className="text-2xl font-bold tracking-widest text-[#2E1D21]">BIBLIO10</p>
              <p className="text-xs text-[#2E1D21]/60 mt-1">10% sur votre prochain mois</p>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={handleKeepToy}
                className="px-6 py-2.5 rounded-full bg-[#A8D5A2] hover:bg-[#8fc98a] text-white text-sm font-medium shadow-sm transition-transform hover:scale-105 active:scale-95"
                type="button"
              >
                Utiliser le code et continuer
              </button>
              <button
                onClick={handleFinalConfirm}
                disabled={loading}
                className="text-sm text-[#2E1D21]/50 hover:text-[#2E1D21]/80 underline underline-offset-2 transition-colors mx-auto disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? 'Traitement en cours...' : 'Non merci, je confirme la résiliation'}
              </button>
            </div>
          </>
        )}

        {/* ── ÉTAPE 3 : Confirmation finale + étiquette ── */}
        {step === 3 && (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-[#DAEEE6] flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="text-xl font-bold text-[#2E1D21]">Retour enregistré</h3>
              <p className="text-[#2E1D21] opacity-90 text-sm leading-relaxed">
                Votre retour a bien été enregistré. Votre abonnement sera résilié à la fin de la période en cours.
              </p>
              {returnLabelUrl ? (
                <a
                  href={returnLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 px-6 py-2.5 rounded-full bg-[#6EC1E4] hover:bg-[#5bb2d6] text-white text-sm font-medium shadow-sm transition-transform hover:scale-105 active:scale-95"
                >
                  Télécharger l'étiquette de retour
                </a>
              ) : (
                <p className="text-xs text-[#2E1D21]/50 mt-2">
                  Vous recevrez l'étiquette de retour par email.
                </p>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-[#2E1D21]/20 text-[#2E1D21] hover:bg-[#2E1D21]/5 transition-colors text-sm font-medium"
                type="button"
              >
                Fermer
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
