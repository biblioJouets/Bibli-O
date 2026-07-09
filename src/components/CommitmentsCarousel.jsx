'use client';

import React, { useRef, useState } from 'react';
import CommitmentCard from './CommitmentCard';
import '../styles/CommitmentCard.css';

// N'oublie pas d'importer ta 6ème icône ici (j'ai mis zen.png en exemple pour la dernière)
const WASHIMAGE = "/assets/icons/wash.png";
const LEAFIMAGE = "/assets/icons/leaf.png";
const ZENIMAGE = "/assets/icons/zen.png";
const EUROIMAGE = "/assets/icons/euro.png";
const APPROBATIONIMAGE = "/assets/icons/approbation.png";

export default function CommitmentsCarousel() {
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const totalCards = 6; // On a bien 6 cartes maintenant

    // Fonction qui calcule quelle carte est actuellement visible au centre
    const handleScroll = () => {
        if (carouselRef.current) {
            const scrollLeft = carouselRef.current.scrollLeft;
            const cardWidth = carouselRef.current.children[0].offsetWidth;
            // On divise le scroll par la largeur d'une carte pour trouver l'index
            const newIndex = Math.round(scrollLeft / cardWidth);
            setActiveIndex(newIndex);
        }
    };

    return (
        <section className="bj-commitments-section" aria-labelledby="engagements-title">
            <h2 className="bj-main-title" id="engagements-title">
                Pourquoi louer plutôt <span className="bj-main-title-highlight">qu'acheter</span> ?
            </h2>
            
            <div 
                className="bj-commitments-grid" 
                ref={carouselRef}
                onScroll={handleScroll}
            >
                <CommitmentCard iconWrapperClass="bj-bg-blue" title="Hygiène" description="Tous nos jouets sont soigneusement nettoyés et désinfectés avant et après chaque location." icon={WASHIMAGE} />
                <CommitmentCard iconWrapperClass="bj-bg-green" title="Écologie" description="En louant des jouets, vous contribuez à réduire les déchets et à promouvoir un mode de consommation plus durable." icon={LEAFIMAGE} />
                <CommitmentCard iconWrapperClass="bj-bg-rose" title="Praticité" description="Profitez de la commodité de notre service de location, avec une livraison rapide et un retour facile." icon={ZENIMAGE} />
                <CommitmentCard iconWrapperClass="bj-bg-yellow" title="Économie" description="Optez pour une solution économique en louant des jouets de qualité à moindre coût." icon={EUROIMAGE} />
                <CommitmentCard iconWrapperClass="bj-bg-blue-pastel" title="Casse et usure" description="Casse et usure, tout est compris dans la formule d'abonnement, pas de stress ni de surprise." icon={APPROBATIONIMAGE} />
                <CommitmentCard iconWrapperClass="bj-bg-rose" title="Sélection experte" description="Nos jouets sont choisis par des pros de l'enfance pour garantir un éveil optimal à chaque étape." icon={ZENIMAGE} />
            </div>

            {/* Affichage des points (Dots) gérés par React */}
            <div className="bj-carousel-dots">
                {[...Array(totalCards)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`bj-dot ${i === activeIndex ? 'active' : ''}`} 
                    />
                ))}
            </div>
        </section>
    );
}