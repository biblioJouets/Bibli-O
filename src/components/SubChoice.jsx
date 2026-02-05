'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import '@/styles/subChoice.css';
function SubChoice(props) {
 

 
  const pricing = {
    1: 20, 2: 25, 3: 35, 4: 38, 5: 45, 
    6: 51, 7: 56, 8: 60, 9: 63
  };

  const [selectedToys, setSelectedToys] = useState(5);

  const handleSelect = (num) => {
    setSelectedToys(num);
  };

  return (
    <div className="sub-choice-container">
      
      {/* --- IMAGE DE BACKGROUND --- */}
      <div className="sub-bg">
        <Image
          src="/assets/subBg.png"
          alt="Décoration d'arrière-plan ludique"
          fill // Remplace width/height pour couvrir le conteneur
          priority
          className="subscribe_background-image"
        />
      </div>

      {/* --- CONTENU --- */}
      <div className="sub-choice-content">
        <h3>Votre box sur mesure : Choisissez le nombre de jouets parfaits !</h3>
        
        <div className="sub-choice-image-wrapper">
          <Image
            src="/assets/box_bj.png"
            alt="Box Bibli'O Jouets remplie"
            width={400}
            height={300}
            priority
            className="box-image"
          />
        </div>

        <div className="selection-card">
          <div className="price-info">
            <span className="current-price">{pricing[selectedToys]}€ / mois</span>
            <span className="toy-count">{selectedToys} jouets</span>
          </div>

          <div className="bubbles-container">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                className={`bubble-btn ${selectedToys === num ? 'active' : ''}`}
                onClick={() => handleSelect(num)}
                aria-label={`Choisir ${num} jouets`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="cta-wrapper">
           <button className="cta-custom-box" onClick={() => window.location.href = '/bibliotheque'}>
              Créer ma box personnalisée
           </button>
        </div>

      </div>

    </div>

          

  );
}

export default SubChoice;