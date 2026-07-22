import React from 'react';
import "styles/catalogOverview.css";
import SliderLogoSection from './SliderLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,
  faCubes,
  faTree,
  faLightbulb,
  faRobot,
  faPuzzlePiece
} from '@fortawesome/free-solid-svg-icons';

const bubulleTagsList = [
  { label: "Jeux Éducatifs", icon: faGraduationCap, link: "/catalogue?categorie=educatifs" },
  { label: "Jeux de Construction", icon: faCubes, link: "/catalogue?categorie=construction" },
  { label: "Jeux en Bois", icon: faTree, link: "/catalogue?categorie=bois" },
  { label: "Éveil & Apprentissage", icon: faLightbulb, link: "/catalogue?categorie=eveil" },
  { label: "Interactifs & Électroniques", icon: faRobot, link: "/catalogue?categorie=interactifs" },
  { label: "Jeux d'initiation", icon: faPuzzlePiece, link: "/catalogue?categorie=initiation" },
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

      {/* Grille de catégories organiques (Blobs) */}
      <div className='blobTagsContainer'>
        {bubulleTagsList.map((item, index) => (
          <a key={index} href={item.link} className="blobItem">
            <div className={`blobIcon ${tagClasses[index % tagClasses.length]}`}>
              <FontAwesomeIcon icon={item.icon} className="blobFaIcon" />
            </div>
            <span className="blobLabel">{item.label}</span>
          </a>
        ))}
      </div>

      <h2 className="bj-main-title marquesTitle">Nos marques <span className="bj-main-title-highlight">partenaires</span></h2>
      <SliderLogoSection />
      
    </div>
  );
}

export default CatalogOverview;