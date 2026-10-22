/* src/components/gift-card-promotion.jsx */
import React from "react";
import Link from "next/link";
import "@/styles/gift-card-promotion.css";

export default function GiftCardPromotion() {
  return (
    <section className="gcp-section" aria-labelledby="gcp-title">
      <div className="gcp-container">
        <div className="gcp-card">
          {/* Formes organiques décoratives (blobs) */}
          <div className="gcp-blob gcp-blob--pink" aria-hidden="true"></div>
          <div className="gcp-blob gcp-blob--blue" aria-hidden="true"></div>
          <div className="gcp-blob gcp-blob--green" aria-hidden="true"></div>

          {/* Colonne Gauche : Contenu Marketing */}
          <div className="gcp-content">
            <span className="gcp-badge">🎁 Idée cadeau éco-responsable</span>

            <h2 id="gcp-title" className="gcp-title">
              Offrez des heures de jeu,{" "}
              <span className="gcp-title-highlight">zéro encombrement !</span>
            </h2>

            <p className="gcp-description">
              Anniversaire, naissance ou Noël… Vous ne savez pas quel jouet
              choisir ? Avec la <strong>Carte Cadeau Bibli&apos;o Jouets</strong>,
              les parents choisissent librement parmi des centaines de jouets et
              articles de puériculture adaptés à l&apos;âge de leur enfant.
            </p>

            <ul className="gcp-perks">
              <li className="gcp-perk-item">
                <span className="gcp-perk-icon gcp-perk-icon--yellow">💶</span>
                <span>
                  <strong>Montant 100 % libre</strong> dès 10 €
                </span>
              </li>
              <li className="gcp-perk-item">
                <span className="gcp-perk-icon gcp-perk-icon--blue">📧</span>
                <span>
                  <strong>Envoi immédiat par e-mail</strong> ou jolie carte par{" "}
                  <strong>voie postale</strong>
                </span>
              </li>
              <li className="gcp-perk-item">
                <span className="gcp-perk-icon gcp-perk-icon--green">♻️</span>
                <span>
                  Valable sur <strong>tous les abonnements et jouets</strong>
                </span>
              </li>
            </ul>

            <div className="gcp-actions">
              <Link href="/nos-offres/carte-cadeau" className="gcp-cta">
                Offrir une carte cadeau
                <span className="gcp-cta-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <span className="gcp-subtext">
                Prête en 2 minutes • Sans engagement
              </span>
            </div>
          </div>

          {/* Colonne Droite : Visuel Carte Cadeau animé */}
          <div className="gcp-visual-wrapper">
            <div className="gcp-mockup-card">
              <div className="gcp-mockup-top">
                <span className="gcp-mockup-brand">Bibli&apos;o Jouets</span>
                <span className="gcp-mockup-tag">Carte Cadeau</span>
              </div>

              <div className="gcp-mockup-center">
                <span className="gcp-mockup-label">Montant au choix</span>
                <div className="gcp-mockup-amounts">
                  <span className="gcp-pill">20 €</span>
                  <span className="gcp-pill gcp-pill--active">50 €</span>
                  <span className="gcp-pill">100 €</span>
                  <span className="gcp-pill">Libre ✨</span>
                </div>
              </div>

              <div className="gcp-mockup-bottom">
                <div className="gcp-mockup-code">CODE : BJ-CADEAU</div>
                <div className="gcp-mockup-slogan">Louez, Jouez, Échangez !</div>
              </div>
            </div>

            {/* Petits badges flottants autour de la carte */}
            <div className="gcp-floating-badge gcp-floating-badge--top">
              💌 Par mail (0 €)
            </div>
            <div className="gcp-floating-badge gcp-floating-badge--bottom">
              📮 Par courrier (+2 €)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}