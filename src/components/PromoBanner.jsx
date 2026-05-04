'use client';

import React from 'react';
import '@/styles/promoBanner.css';

const PromoBanner = () => {
  const baseMessages = [
    "🎁 Box Mystère : 4 jouets, 24.90€ au lieu de 38€",
    // "🐻 Code : BIBLIOMOISOFFERT",
    "🚚 Livraison dans toute la France", 
    "✨ Sans engagement : la liberté de jouer !",
  ];

  const contentBlock = [
    ...baseMessages,
    ...baseMessages,
    ...baseMessages,
    ...baseMessages
  ];

  return (
    <div className="promo-banner-container" role="marquee" aria-label="Annonces promotionnelles">
      <div className="promo-track">
        
        {contentBlock.map((text, index) => (
          <div key={`group-1-${index}`} className="promo-item">
            {text}
            <span className="promo-separator"></span>
          </div>
        ))}

        {contentBlock.map((text, index) => (
          <div key={`group-2-${index}`} className="promo-item">
            {text}
            <span className="promo-separator"></span>
          </div>
        ))}

      </div>
    </div>
  );
};

export default PromoBanner;