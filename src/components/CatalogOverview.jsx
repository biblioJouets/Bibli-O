import React from 'react';
import "./style/catalogOverview.css";
import SliderLogoSection from './SliderLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,     // Jeux Éducatifs
  faCubes,              // Jeux de Construction
  faTree,               // Jeux en Bois
  faLightbulb,          // Jeux d'Éveil & Apprentissage
  faRobot,              // Interactifs & Électroniques
  faPuzzlePiece         // Jeux d'initiation
} from '@fortawesome/free-solid-svg-icons';

const bubulleTagsList = [
  { label: "Jeux Éducatifs", icon: faGraduationCap },
  { label: "Jeux de Construction", icon: faCubes },
  { label: "Jeux en Bois", icon: faTree },
  { label: "Jeux d'Éveil & Apprentissage", icon: faLightbulb },
  { label: "Interactifs & Électroniques", icon: faRobot },
  { label: "Jeux d'initiation", icon: faPuzzlePiece },
];

function CatalogOverview() {
  const tagClasses = ["tag-0", "tag-1", "tag-2", "tag-3", "tag-4", "tag-5"];

  return (
    <div className="catalogOverviewSection">
      <h2>Un aperçu de notre futur catalogue</h2>
      <h3>Dès le lancement, accédez à des centaines de références triées sur le volet.</h3>
      <div className='BubulleTags'>
        {bubulleTagsList.map((item, index) => (
          <div key={index} className={`BubulleTag ${tagClasses[index % tagClasses.length]}`}>
            <FontAwesomeIcon icon={item.icon} className="bubulleIcon" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <h2>Nos futures marques partenaires</h2>
      <SliderLogoSection />
    </div>
  );
}

export default CatalogOverview;
