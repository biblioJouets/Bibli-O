/* src/components/account/ProlongButton.jsx */
'use client';

import { useState } from 'react';

export default function ProlongButton({ orderId, productId, currentIntention }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(currentIntention === 'PROLONGATION' || currentIntention === 'PROLONGATION_TACITE');
  const [isFailed, setIsFailed] = useState(currentIntention === 'PAIEMENT_ECHOUE');
  
  const [showProlongModal, setShowProlongModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleProlongation = async () => {
    setIsLoading(true);
    setShowProlongModal(false);
    try {
      const response = await fetch(`/api/orders/prolong-item`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, productId })
      });
      if (response.ok) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Erreur réseau", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = () => {
    // Redirection vers notre future API qui génère le lien du Portail Stripe
    window.location.href = `/api/stripe/create-portal-session?orderId=${orderId}`;
  };

  // --- ÉTAT 1 : SUCCÈS ---
  if (isSuccess && !isFailed) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#DAEEE6] text-[#2E1D21] text-xs sm:text-sm font-semibold shadow-sm w-full sm:w-auto text-center cursor-default">
        <span className="w-2 h-2 rounded-full bg-[#88D4AB]"></span>
        Prolongé
      </div>
    );
  }

  // --- ÉTAT 2 : ÉCHEC DE PAIEMENT ---
  if (isFailed) {
    return (
      <>
        <button
          onClick={() => setShowErrorModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#FFD9DC] text-[#2E1D21] border border-[#FF8C94] text-xs sm:text-sm font-semibold shadow-sm w-full sm:w-auto hover:bg-[#FF8C94] hover:text-white transition-colors"
          type="button"
        >
          ⚠️ Action requise
        </button>

        {/* MODALE DE RÉASSURANCE & RÉSOLUTION */}
        {showErrorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E1D21]/40 backdrop-blur-sm px-4">
            <div className="bg-[#FFFAF4] p-6 sm:p-8 rounded-[25px] shadow-xl max-w-md w-full flex flex-col gap-4 transform transition-all animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-[#2E1D21]">Oups, petit couac de paiement !</h3>
              <p className="text-[#2E1D21] opacity-90 text-sm leading-relaxed">
                Pas de panique, ça arrive souvent (carte expirée, plafond de sécurité atteint...). Votre banque n'a pas autorisé le dernier prélèvement pour prolonger ce jouet.
              </p>
              <p className="text-[#2E1D21] font-medium text-sm">
                Pour que votre enfant puisse continuer à en profiter, veuillez mettre à jour votre moyen de paiement.
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
                <button 
                  onClick={() => setShowErrorModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#2E1D21]/20 text-[#2E1D21] hover:bg-[#2E1D21]/5 transition-colors text-sm font-medium"
                >
                  Plus tard
                </button>
                <button 
                  onClick={handleUpdatePayment}
                  className="px-6 py-2.5 rounded-full text-white text-sm font-medium shadow-sm transition-transform hover:scale-105 active:scale-95 bg-[#FF8C94] hover:bg-[#e87a82]"
                >
                  Mettre à jour ma carte
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // --- ÉTAT 3 : BOUTON PAR DÉFAUT (PROLONGER) ---
  return (
    <>
      <button
        onClick={() => setShowProlongModal(true)}
        disabled={isLoading}
        className="btn-pill btn-extend"
        type="button"
      >
        {isLoading ? '...' : 'Prolonger'}
      </button>

      {/* MODALE DE PROLONGATION CLASSIQUE */}
      {showProlongModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E1D21]/40 backdrop-blur-sm px-4">
          <div className="bg-[#FFFAF4] p-6 sm:p-8 rounded-[25px] shadow-xl max-w-md w-full flex flex-col gap-4 transform transition-all animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-[#2E1D21]">Prolonger le jouet ?</h3>
            <p className="text-[#2E1D21] opacity-90 text-sm leading-relaxed">
              Êtes-vous sûr de vouloir garder ce jouet un mois de plus ? 
              Votre location sera prolongée de 30 jours, et le paiement s'effectuera automatiquement à votre date anniversaire.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
              <button 
                onClick={() => setShowProlongModal(false)}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-full border border-[#2E1D21]/20 text-[#2E1D21] hover:bg-[#2E1D21]/5 transition-colors text-sm font-medium"
              >
                Non, annuler
              </button>
              <button 
                onClick={handleProlongation}
                disabled={isLoading}
                className={`px-6 py-2.5 rounded-full text-white text-sm font-medium shadow-sm transition-transform hover:scale-105 active:scale-95
                  ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#6EC1E4] hover:bg-[#5bb2d6]'}`}
              >
                {isLoading ? 'Validation...' : 'Oui, prolonger'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}