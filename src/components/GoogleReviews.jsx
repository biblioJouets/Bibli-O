"use client";

import React, { useState } from 'react';
import 'styles/GoogleReviews.css';

const mesAvisEnDur = [
  {
    name: "Queulot",
    photo: "/assets/reviews/queulot.png",
    rating: 5,
    text: "Mon épouse est assistante maternelle à domicile. Elle a opté pour le forfait standard. Ce dernier lui semble pour l’instant idéal pour renouveler les jouets. Qu’ils soient « high-tech », comme le baby ordi ou en bois, comme le jeu de construction, ils régalent les enfants. La qualité et surtout la propreté de ces derniers sont irréprochables. Bravo pour la livraison rapide. Chères collègues, je vous recommande le site Bibli’o jouet."
  },
  {
    name: "Clairemqs" ,
    photo: "/assets/reviews/claire.png",
    rating: 5,
    text:"Super concept, innovant et engagé. La démarche éco-responsable est sincère et ça se ressent. Les jouets du catalogue sont de qualité et parfaitement entretenus. Une très bonne adresse pour les parents !"
  },
{
  name: "eloise ghedico",
  photo: "/assets/reviews/eloise.png",
  rating: 5,
  text:"Très sérieux et réactif. Les enfants adorent découvrir de nouveaux jeux régulièrement. C'est Noël toute l'année ! Je recommande fortement !",

},
{
  name: "Christelle Di Costanzo",
  photo: "/assets/reviews/christelle.png",
  rating: 5,
  text:"Super idée! lorsqu'on hésite a faire le bon choix pour l'éveil de ses chérubins plus peur du mauvais choix étant donné le caractère évolutif et interchangeables des jouets :) Seul bémol, vos enfants vont vous surpasser😅",
},
{
  name: "Lascal Faz",
  photo: "/assets/reviews/lascal.png",
  rating: 5,
  text:"Fonctionne vraiment bien, concept intéressant et bonne démarche !!",

}
];

// Sous-composant pour gérer l'état "Voir plus" de chaque carte
const ReviewCard = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 110; // Un peu plus long pour remplir la nouvelle carte
  const isLong = review.text && review.text.length > maxLength;
  
  const displayText = isExpanded 
    ? review.text 
    : review.text?.substring(0, maxLength) + (isLong ? '...' : '');

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="review-card">
      {/* Guillemet décoratif en CSS via ::before (voir le CSS) */}
      <div className="review-header">
        <img 
          src={review.photo} 
          alt={`Avis de ${review.name}`} 
          className="review-avatar" 
          loading="lazy"
        />
        <div className="review-info">
          <h3 className="review-name">{review.name}</h3>
          <div className="review-stars">
            {renderStars(review.rating)}
          </div>
        </div>
      </div>
      
      <p className="review-text">
        {displayText}
        {isLong && (
          <button 
            className="review-toggle" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? ' Réduire' : ' Lire la suite'}
          </button>
        )}
      </p>
    </div>
  );
};

export default function GoogleReviews({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  // ASTUCE : On peut ajouter ici des avis en dur si tu veux dépasser les 5 de Google

  const allReviews = [...reviews, ...mesAvisEnDur];

  // On duplique le tableau pour créer l'illusion d'une boucle infinie parfaite en CSS
  const duplicatedReviews = [...allReviews, ...allReviews];

  return (
    <div className="reviews-wrapper">
      <h2 className="reviews-title">Ce que pensent nos abonnés</h2>
      
      <div className="reviews-slider-container">
        {/* La piste qui va défiler infiniment */}
        <div className="reviews-track">
          {duplicatedReviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}