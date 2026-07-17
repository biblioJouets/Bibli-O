import React from 'react';
import 'styles/features.css';

const DELIVERYIMAGE = "/assets/icons/delivery.png";
const CARIMAGE = "/assets/icons/car.png"; 
const WASHIMAGE = "/assets/icons/wash.png";
const CLICKIMAGE = "/assets/icons/click.png";

export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">
        
        <h2 className="bj-main-title">
          Tout est prévu pour vous <span className="bj-main-title-highlight">faciliter la vie</span>
        </h2>
        
        <div className="features-grid">
          
          {/* Carte 1 : Livraison */}
          <div className="organic-card card-vert">
            <div className="organic-blob blob-vert">
              <img src={DELIVERYIMAGE} alt="Livraison" className="feature-icon icon-white" />
            </div>
            <h3 className="feature-card-title">Livraison & retours</h3>
            <p className="feature-card-desc">
              Inclus dans toutes nos formules, pour une expérience 100% sans souci.
            </p>
          </div>
          
          {/* Carte 2 : Assurance Casse (Passée en Rose, icône brute blanche) */}
          <div className="organic-card card-rose">
            <div className="organic-blob blob-rose">
              <img src={CARIMAGE} alt="Assurance Casse" className="feature-icon" />
            </div>
            <h3 className="feature-card-title">Assurance 'Petite Casse'</h3>
            <p className="feature-card-desc">
              L'assurance couvre la plupart des petits accidents du quotidien. Zéro stress.
            </p>
          </div>
          
          {/* Carte 3 : Hygiène */}
          <div className="organic-card card-blue">
            <div className="organic-blob blob-blue">
              <img src={WASHIMAGE} alt="Hygiène" className="feature-icon icon-white" />
            </div>
            <h3 className="feature-card-title">Nettoyage baby self</h3>
            <p className="feature-card-desc">
              Protocole de nettoyage strict pour garantir sécurité et propreté à chaque échange.
            </p>
          </div>
          
          {/* Carte 4 : Engagement */}
          <div className="organic-card card-jaune">
            <div className="organic-blob blob-jaune">
              <img src={CLICKIMAGE} alt="Sans engagement" className="feature-icon icon-white" />
            </div>
            <h3 className="feature-card-title">Sans engagement</h3>
            <p className="feature-card-desc">
              Gérez votre abonnement librement. Annulable en un seul clic depuis votre espace.
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}