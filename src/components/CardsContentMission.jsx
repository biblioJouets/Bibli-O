'use client';
import React, { useState } from 'react';
import 'styles/cardsContentMission.css';
const TestimonialSlider = () => {     
    const cardContentMission = [
        {
            name: "L'Éveil par le Jeu",
            title: "💡 Une Sélection Experte",
            content: "Notre mission n'est pas de vous noyer sous les jouets, mais de les sélectionner avec soin. Nous collaborons avec des experts de la petite enfance pour choisir des jeux qui stimulent la curiosité, l'autonomie et la créativité.",
        },
        {
            name: "L'Écologie par l'Action",
            title: "🌍 Notre Pacte Circulaire",
            content: "Plus que de simples paroles, nous agissons. Notre mission est de réduire le gaspillage en prolongeant la vie de chaque jouet et de privilégier l'économie circulaire. Un jouet loué, c'est un jouet de moins à la décharge.",
        },
        {
            name: "La Communauté avant tout",
            title: "❤️ Créé pour les Parents",
            content: "Nous sommes passés par là. Bibli'O Jouets est né d'une volonté de simplifier la vie des familles. Notre mission est d'être un service fiable et bienveillant, qui vous écoute et vous accompagne.",
        }
    
    ];   
    return (
<div className='cardContentMissionSection'>
<h2 className="homePageSubTitle">Notre Mission</h2>
<div className='cardsContentMission'>
    <div className='cardContentMission redCardContent'>
        <p className='CardContentName'>{cardContentMission[0].name}</p>
        <p className='CardContentTitle'>{cardContentMission[0].title}</p>
        <p className='CardContentContent'>{cardContentMission[0].content}</p>
        
</div>
<div className='cardContentMission greenCardContent'>
    <p className='CardContentName'>{cardContentMission[1].name}</p>
        <p className='CardContentTitle'>{cardContentMission[1].title}</p>
        <p className='CardContentContent'>{cardContentMission[1].content}</p>
        
        
</div>
<div className='cardContentMission yellowCardContent'>
    <p className='CardContentName'>{cardContentMission[2].name}</p>
        <p className='CardContentTitle'>{cardContentMission[2].title}</p>
        <p className='CardContentContent'>{cardContentMission[2].content}</p>
        
        
</div>

</div>

</div>
    )
}
export default TestimonialSlider;