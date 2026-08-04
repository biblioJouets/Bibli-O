'use client';
import React, { useState } from 'react';
import 'styles/cardsContentMission.css';

const MissionSection = () => {     
    const cardContentMission = [
        {
            name: "L'Éveil par le Jeu",
            title: "Une Sélection Experte",
            colorClass: "redCardContent",
            points: [
                "Sélection soignée par des experts de la petite enfance.",
                "Jeux stimulant la curiosité et l'autonomie.",
                "Privilégie la qualité à la quantité."
            ],
        },
        {
            name: "L'Écologie par l'Action",
            title: "Notre Pacte Circulaire",
            colorClass: "greenCardContent",
            points: [
                "Réduction active du gaspillage.",
                "Prolongation de la vie de chaque jouet.",
                "Un jouet loué = un jouet de moins à la décharge."
            ],
        },
        {
            name: "La Communauté avant tout",
            title: "Créé pour les Parents",
            colorClass: "blueCardContent", 
            points: [
                "Simplifie le quotidien et la gestion de l'espace.",
                "Service fiable, bienveillant et à votre écoute.",
                "Un accompagnement pensé par des parents."
            ],
        }
    ];   

    return (
        <section className='cardContentMissionSection'>
            <h2 className="bj-main-title" style={{ color: '#2E1D21' }}>
                Notre <span style={{ color: '#6EC1E4' }}>Mission</span>
            </h2>

            <div className='cardsContentMission'>
                {cardContentMission.map((card, index) => (
                    <div key={index} className={`cardContentMission ${card.colorClass}`}>
                        <p className='CardContentName'>{card.name}</p>
                        <h3 className='CardContentTitle'>{card.title}</h3>
                        
                        {/* Remplacement du <p> par une liste <ul> pour faciliter la lecture */}
                        <ul className='CardContentList'>
                            {card.points.map((point, idx) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* CTA pour diriger le flux utilisateur */}
            <a href="/fonctionnement" className="missionCTA">
                Découvrir le concept
            </a>
        </section>
    );
};

export default MissionSection;