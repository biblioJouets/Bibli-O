'use client';

import '@/styles/abonnements.css';
import Image from 'next/image'
import React, { useState } from 'react';

export default function FunctioningPage() {
  return (
    <div className="subscription-page">
      {/* --- SECTION HERO --- */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="shape shape-blue"></div>
        <div className="shape shape-blue2"></div>

          <div className="shape shape-pink"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <h1><span className='shape-white'> Des jouets illimités,</span><br/> zéro encombrement. <br />Le bonheur livré chez vous.</h1>
            <p className="subtitle">Rejoignez la ludothèque nouvelle génération. Économique, écologique et magique pour vos enfants.</p>
            <a href="/abonnements" className="btn btn-primary" >Je découvre les formules ↗</a>
            <div className="hero-benefits-list">
              <span>✓ Sans engagement</span>
              <span>✓ Jouets désinfectés</span>
              <span>✓ Livraison incluse</span>
            </div>
          </div>
          <div className="hero-image">
         <Image
    src="/assets/baby_abonnement.webp"
    alt="Enfant joyeux découvrant ses jouets Bibli'O"
    width={1000}  
    height={800}
    priority
/>
          </div>
        </div>
        <div className="wave-container">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
          preserveAspectRatio="none" 
        >
          <path 
            fill="#FFF7EB" 
            fillOpacity="1" 
            d="M0,224L60,208C120,192,240,160,360,133.3C480,107,600,85,720,101.3C840,117,960,171,1080,181.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
      </section>

      {/* --- SECTION COMMENT ÇA MARCHE --- */}
      <section className="how-it-works-section">
        <div className="container">
          <h2>C'est un jeu d'enfant !</h2>
          <div className="steps-container">
            {/* Ligne pointillée décorative (visible sur desktop) */}
            <div className="steps-connector desktop-only"></div>
            
            <div className="step-item">
              <div className="step-number-shape shape-blue">1. Je choisis mes jouets</div>
              <h3>Je crée ma box</h3>
              <p>Parcourez notre catalogue en ligne et remplissez votre box avec vos coups de cœur.</p>
            </div>
            <div className="step-item">
              <div className="step-number-shape shape-yellow">2. Je m'abonne</div>
              <h3>Je choisis ma formule</h3>
              <p>Sélectionnez l'abonnement qui correspond à votre rythme et votre budget, sans engagement.</p>
            </div>
            <div className="step-item">
              <div className="step-number-shape shape-green">3. On reçoit et on joue !</div>
              <h3>Livraison rapide</h3>
              <p>Recevez votre box en point relais. Place à la découverte et au jeu !</p>
            </div>
            <div className="step-item">
              <div className="step-number-shape shape-pink">4. On échange</div>
              <h3>Lassé ? On change !</h3>
              <p>Renvoyez gratuitement les jouets et recommencez le cycle pour de nouvelles aventures.</p>
            </div>
          </div>
        </div>
      </section>

           {/* --- SECTION FOOTER CTA --- */}
      <section className="footer-cta-section">
        <div className="container">
          <h2>Prêts à transformer leur salle de jeu (et votre quotidien) ?</h2>
          <a href="/abonnements" className="btn btn-pink btn-large">Je commence l'aventure maintenant</a>
        </div>
      </section>
    </div>
  );
}