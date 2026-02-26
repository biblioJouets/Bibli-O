'use client';

import { useState } from 'react';

export default function ProlongButton({ orderId, currentIntention }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(currentIntention === 'PROLONGATION');

  const handleProlongation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/prolong`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsSuccess(true);
      } else {
        console.error("Erreur lors de la requête");
      }
    } catch (error) {
      console.error("Erreur réseau", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 rounded-[25px] bg-[#DAEEE6] text-[#2E1D21] text-sm font-semibold shadow-sm transition-all w-fit">
        <span className="w-2 h-2 rounded-full bg-[#88D4AB]"></span>
        Prolongation programmée
      </div>
    );
  }

  return (
    <button
      onClick={handleProlongation}
      disabled={isLoading}
      className={`flex items-center justify-center px-6 py-3 rounded-[25px] text-white font-medium text-sm transition-transform hover:scale-105 active:scale-95 shadow-sm w-fit
        ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#6EC1E4] hover:bg-[#5bb2d6]'}`}
    >
      {isLoading ? 'Enregistrement...' : 'Prolonger d\'un mois'}
    </button>
  );
}