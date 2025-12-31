/* src/app/abonnements/page.js */
'use client';

import '@/styles/abonnements.css';
import Image from 'next/image'
import React, { useState } from 'react';
// Composant pour un élément de la FAQ (Accordéon)
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button className={`faq-question ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {question}
        <span className="faq-toggle">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="faq-answer"><p>{answer}</p></div>}
    </div>
  );
};

const SubscriptionPage = () => {
  // Données factices pour les témoignages et la FAQ (à remplacer par les vraies données)
  const faqs = [
    { q: "Et si un jouet est cassé...?", a: "Pas de panique ! L'usure normale est incluse. Pour la casse plus importante, l'assurance 'Petite Casse' couvre la plupart des petits accidents du quotidien." },
    { q: "Comment sont nettoyés les jouets ?", a: "Nous prenons l'hygiène très au sérieux. Chaque jouet est minutieusement nettoyé et désinfecté avec des produits écologiques avant d'être remis en circulation." },
    { q: "Quand un jouet a fait son temps ?", a: "Quand votre enfant ne joue plus avec, vous le remettez dans sa boîte et vous nous le renvoyez pour en choisir un nouveau !" },
    { q: "Comment sont sélectionnés les jouets ?", a: "Notre équipe d'experts sélectionne des jouets éducatifs, durables et amusants, souvent inspirés des méthodes Montessori." },
  ];

  return (
    <div className="subscription-page">
      {/* --- SECTION PRICING (FORMULES) --- */}
      <section className="pricing-section">
        <div className="container">
          <h2>Nos formules flexibles, sans engagement test push main</h2>
          <div className="pricing-grid">
            {/* CARTE 1 : Découverte */}
            <div className="pricing-card">
              <div className="pricing-header header-blue">
                <h3>Découverte</h3>
              </div>
              <div className="pricing-body">
                <div className="price">25.99€ <span className="per-month">/ mois</span></div>
                <ul className="features-list">
                  <li>2 Jouets</li>
                  <li>Soit 12.99€ par jouets </li>
                  <li>Livraison et retour inclus</li>
                  <li>Assurance "Casse"</li>
                  <li>Nettoyage baby self</li>
                  <li>Annulable en 1 clic</li>

                </ul>
                <button className="btn btn-outline-blue">Choisir L'offre Découverte</button>
              </div>
            </div>

            {/* CARTE 2 : Standard (Mise en avant) */}
            <div className="pricing-card highlighted">
           <div className="preferred-banner">LE PRÉFÉRÉ DES PARENTS</div>
              <div className="pricing-header header-pink">
                <h3>Standard</h3>
              </div>
              <div className="pricing-body">
                <div className="price price-large">39.99€ <span className="per-month">/ mois</span></div>
                <ul className="features-list checkout-list">
                  <li>✅ 4 Jouets</li>
                  <li>✅Soit 9.99€ par jouets </li>
                  <li>✅ Livraison et retour inclus</li>
                  <li>✅ Assurance "Casse"</li>
                  <li>✅ Nettoyage baby self</li>
                  <li>✅ Annulable en 1 clic</li>

                </ul>
                <button className="btn btn-pink">Je veux l'Offre Standard</button>
              </div>
            </div>

            {/* CARTE 3 : L'Aventurier */}
            <div className="pricing-card">
              <div className="pricing-header header-green">
                <h3>Premium</h3>
              </div>
              <div className="pricing-body">
                <div className="price">55.99€ <span className="per-month">/ mois</span></div>
                <ul className="features-list">
                  <li>6 Jouets</li>
                  <li>Soit 9.33€ par jouets</li>
                  <li>Accès prioritaire aux nouveautés</li>
                  <li>Livraison  Prioritaire</li>
                  <li>Livraison et retour inclus</li>
                  <li>Assurance "Casse"</li>
                  <li>Nettoyage baby self</li>
                  <li>Annulable en 1 clic</li>


                </ul>
                <button className="btn btn-outline-green">Choisir l'offre Premium</button>
              </div>
            </div>
          </div>
          {/* --- NOUVELLE SECTION : OFFRE SUR MESURE --- */}
          <div className="custom-offer-card">
            <div className="custom-offer-content">
              <div className="custom-badge">FAMILLES NOMBREUSES & PROS</div>
              <h3>Envie de plus de folie ?</h3>
              <p>
                L'offre Premium ne suffit pas ? Ajoutez jusqu'à <strong>3 jouets supplémentaires</strong> à votre box pour seulement <strong>9€ / jouet</strong>.
              </p>
              <ul className="custom-offer-details">
                <li> Base Premium (6 jouets)</li>
                <li> Jusqu'à 9 jouets au total</li>
                <li> Idéal fratries & Ass. Mat.</li>
              </ul>
            </div>
            
            <div className="custom-offer-action">
              <div className="custom-price-box">
                <span className="label">Option "Maxi Box"</span>
                <span className="price">+9€ <small>/ jouet sup.</small></span>
              </div>
              <button className="btn btn-yellow btn-large">Demander mon offre sur mesure</button>
            </div>
          </div>
        </div>
      </section>
      
      {/* --- SECTION POURQUOI CHOISIR --- */}
      <section className="why-section">
        <div className="container">
          <h2>Pourquoi choisir Bibli'O Jouets ?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="icon-circle icon-yellow">🧩</div>
              <h3>L'éveil permanent</h3>
              <p>Des jouets adaptés à chaque étape de développement pour stimuler leur curiosité sans cesse.</p>
            </div>
            <div className="benefit-card">
              <div className="icon-circle icon-blue">💰</div>
              <h3>Budget maîtrisé</h3>
              <p>Profitez de jouets de haute qualité (bois, éducatifs...) pour une fraction du prix d'achat.</p>
            </div>
            <div className="benefit-card">
              <div className="icon-circle icon-green">🌍</div>
              <h3>La planète dit merci</h3>
              <p>Consommer mieux en partageant. Moins de production de plastique, plus de bon sens.</p>
            </div>
            <div className="benefit-card">
              <div className="icon-circle icon-pink">📦</div>
              <h3>Adieu le bazar !</h3>
              <p>Votre salon respire enfin. Quand ils ne jouent plus, hop, retour à l'envoyeur !</p>
            </div>
          </div>
        </div>
      </section>



    

      {/* --- SECTION SOCIAL PROOF & FAQ --- */}
      <section className="social-faq-section">
        <div className="container social-faq-grid">
          {/* Colonne gauche : Témoignages */}
          <div className="testimonials-col">
             {/* Formes décoratives d'arrière-plan */}
             <div className="blob blob-1"></div>
             <div className="blob blob-2"></div>

            <h2>Ils adorent Bibli'O Jouets</h2>
            <div className="testimonial-item">
              <div className="testimonial-bubble bubble-green">
                "C'est génial, mon fils a toujours des nouveautés et mon salon n'est plus envahi ! Le service client est au top."
              </div>
              <div className="testimonial-user">
                {/* REMPLACER IMAGE */}
                  <Image
                    src="/assets/enfant2_abo.webp"
                    alt="Enfant joyeux découvrant ses jouets Bibli'O"
                    className="user-avatar"
                    width={800}  
                    height={200}
                    priority
                    
                />
                <span>Sophie, maman de Léo (3 ans)</span>
              </div>
            </div>
            <div className="testimonial-item testimonial-right">
               <div className="testimonial-bubble bubble-yellow">
                "Les jouets sont de super qualité, propres, et le concept de rotation est parfait pour l'éveil. Je recommande !"
              </div>
               <div className="testimonial-user">
                 {/* REMPLACER IMAGE */}
                <Image
                    src="/assets/enfant1_abo.webp"
                    alt="Enfant joyeux découvrant ses jouets Bibli'O"
                    className="user-avatar"
                    width={800}  
                    height={200}
                    priority
                    
                />             
                <span>Marc, papa de Zoé (18 mois)</span>
              </div>
            </div>
          </div>

          {/* Colonne droite : FAQ */}
          <div className="faq-col">
            <h2>Vos questions fréquentes</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

   
    </div>
  );
};

export default SubscriptionPage;