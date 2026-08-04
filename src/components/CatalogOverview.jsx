'use client';
import React from 'react';
import Link from 'next/link';
import "styles/catalogOverview.css";
import SliderLogoSection from './SliderLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,  // Éducatif
  faCubes,           // Construction
  faStore,           // Imitation (marchande, dinette, etc.)
  faShapes,          // Motricité / Formes
  faRobot,           // Robots
  faPuzzlePiece      // Puzzles
} from '@fortawesome/free-solid-svg-icons';

// Utilisation EXACTE des libellés de ta base de données
const bubulleTagsList = [
  { label: "Jeux Éducatifs & Créatifs", icon: faGraduationCap },
  { label: "Jeux de Construction et Briques", icon: faCubes },
  { label: "Jeux d'Imitation & Rôles", icon: faStore },
  { label: "Motricité Fine & Dextérité", icon: faShapes },
  { label: "Robots et Jeux Interactifs", icon: faRobot },
  { label: "Puzzles", icon: faPuzzlePiece },
];

function CatalogOverview() {
  const tagClasses = ["tag-0", "tag-1", "tag-2", "tag-3", "tag-4", "tag-5"];

  return (
    <div className="catalogOverviewSection">
      
      {/* En-tête avec Badge de réassurance */}
      <div className="catalogHeader">
        <h2 className="bj-main-title">
          Un aperçu de notre <span className="bj-main-title-highlight">catalogue</span>
        </h2>
        <h3 className="catalogSubtitle">Accédez à des centaines de références triées sur le volet.</h3>
        
        <div className="reassuranceBadge">
          <span>🔋 Piles toujours incluses</span>
          <span className="badgeSeparator">|</span>
          <span>✨ Nettoyage certifié</span>
        </div>
      </div>

      {/* Grille de catégories organiques (Blobs) cliquables */}
      <div className='blobTagsContainer'>
        {bubulleTagsList.map((item, index) => {
          // L'encodage gère automatiquement les espaces, les "&" et les accents pour l'URL
          const categoryUrl = `/bibliotheque?categorie=${encodeURIComponent(item.label)}`;
          
          return (
            <Link key={index} href={categoryUrl} className="blobItem">
              <div className={`blobIcon ${tagClasses[index % tagClasses.length]}`}>
                <FontAwesomeIcon icon={item.icon} className="blobFaIcon" />
              </div>
              <span className="blobLabel">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <h2 className="bj-main-title marquesTitle">Nos marques partenaires</h2>
      <SliderLogoSection />
      
    </div>
  );
}

export default CatalogOverview;