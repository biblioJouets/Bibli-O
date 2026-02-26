/* src/components/account/ProlongButton.jsx */
'use client';

import { useState } from 'react';

export default function ProlongButton({ orderId, currentIntention }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(currentIntention === 'PROLONGATION' || currentIntention === 'PROLONGATION_TACITE');
  const [showModal, setShowModal] = useState(false); // État de la modale

  const handleProlongation = async () => {
    setIsLoading(true);
    setShowModal(false); // On ferme la modale au lancement
    try {
      const response = await fetch(`/api/orders/${orderId}/prolong`, { method: 'POST' });
      if (response.ok) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Erreur réseau", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#DAEEE6] text-[#2E1D21] text-xs sm:text-sm font-semibold shadow-sm w-full sm:w-auto text-center cursor-default">
        <span className="w-2 h-2 rounded-full bg-[#88D4AB]"></span>
        Prolongé
      </div>
    );
  }

  return (
    <>
      {/* On utilise ta classe native btn-extend pour qu'il s'intègre parfaitement */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isLoading}
        className="btn-pill btn-extend"
        type="button"
      >
        {isLoading ? '...' : 'Prolonger'}
      </button>

      {/* MODALE D'ALERTE */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E1D21]/40 backdrop-blur-sm px-4">
          <div className="bg-[#FFFAF4] p-6 sm:p-8 rounded-[25px] shadow-xl max-w-md w-full flex flex-col gap-4 transform transition-all animate-in fade-in zoom-in duration-200">
            
            <h3 className="text-xl font-bold text-[#2E1D21]">Prolonger le jouet ?</h3>
            
            <p className="text-[#2E1D21] opacity-90 text-sm leading-relaxed">
              Êtes-vous sûr de vouloir garder ce jouet un mois de plus ? 
              Votre location sera prolongée de 30 jours, et le paiement s'effectuera automatiquement à votre date anniversaire.
            </p>
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
              <button 
                onClick={() => setShowModal(false)}
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