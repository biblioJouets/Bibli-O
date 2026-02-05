/* src/app/abonnements/page.js */
'use client';

import '@/styles/abonnements.css';
import Image from 'next/image'
import React, { useState, useRef } from 'react'; 
import { useRouter } from 'next/navigation';
import CommitmentCard from '@/components/CommitmentCard';

import SubChoice from '@/components/SubChoice';

const WASHIMAGE = "assets/icons/wash.png";
const CARIMAGE = "assets/icons/car.png";
const CLICKIMAGE = "assets/icons/click.png";
const DELIVERYIMAGE ="assets/icons/delivery.png";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

 return (
    <div className={`abo-faq-item ${isOpen ? 'active' : ''}`}>
      <button 
        className="abo-faq-question" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {question}
        <span className="abo-faq-toggle">{isOpen ? '−' : '+'}</span>
      </button>
      
      <div 
        className="abo-faq-answer-wrapper" 
        ref={contentRef}
        style={{
          // Calcul JS précis + Isolation CSS = Zéro bug
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
          opacity: isOpen ? 1 : 0
        }}
      >
        <div className="abo-faq-answer">
           <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};

const SubscriptionPage = () => {
  const router = useRouter()
  const faqs = [
    { q: "Et si un jouet est cassé...?", a: "Pas de panique ! L'usure normale est incluse. Pour la casse plus importante, l'assurance 'Petite Casse' couvre la plupart des petits accidents du quotidien." },
    { q: "Comment sont nettoyés les jouets ?", a: "Nous prenons l'hygiène très au sérieux. Chaque jouet est minutieusement nettoyé et désinfecté et contrôlé avec des produits baby self avant d'être remis en circulation." },
    { q: "Quand un jouet a fait son temps ?", a: "Quand votre enfant ne joue plus avec, dans votre espace client vous sélectionnez le jouet que vous souhaitez renvoyer et vous choississez votre futur jouet" },
    { q: "Comment sont sélectionnés les jouets ?", a: "Notre équipe d'experts sélectionne des jouets éducatifs, durables et amusants, souvent inspirés des méthodes Montessori." },
  ];


return (
  <div className="subscription-page">
      {/* --- SECTION PRICING (FORMULES) --- */}
      <section className="pricing-section">
        <div className="container">
          <h2>Nos formules flexibles, sans engagement</h2>
                    <SubChoice />


       </div>
       <div className="commitmentCards subpage">
         <CommitmentCard
                            icon={DELIVERYIMAGE}
                            title="Livraison et retour inclus"
                            description="Livraison et retour inclus dans toutes nos formules, pour une expérience sans souci."
                        />
                        <CommitmentCard
                            title="Assurance &quot;Casse&quot;"
                            icon={CARIMAGE}
                            description="L'assurance 'Petite Casse' couvre la plupart des petits accidents du quotidien."
                        />
                        <CommitmentCard
                            className="hygiene"
                            icon={WASHIMAGE}
                            title=" Nettoyage baby self"
                            description="Nettoyage baby self de tous nos jouets pour garantir sécurité et propreté à chaque échange."
                            // iconClassName="icon-large"    
                        />
                        <CommitmentCard
                            icon={CLICKIMAGE}
                            title="Annulable en 1 clic"
                            description="En louant des jouets, vous contribuez à réduire les déchets et à promouvoir un mode de consommation plus durable."
                        />
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
            
            <div className="abo-faq-list">
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