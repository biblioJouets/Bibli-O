'use client';

import React from 'react';
import '@/styles/promoBanner.css';

const PromoBanner = () => {
  const baseMessages = [
    "10€ offert sur toutes les formules avec le code: BLACKFRIDAY10",
    // "🐻 Code : BIBLIOMOISOFFERT",
    "🚚 Livraison dans toute la France", 
    "✨ Sans engagement et sans caution !",
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