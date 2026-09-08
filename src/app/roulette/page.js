import { NextResponse } from 'next/server';
import Roulette from '@/components/roulette';

export default function RoulettePage() {
  return (
    <div className="roulette-page">
      <h1 className="roulette-title">La Roue de la Chance</h1>
      <h2 className="roulette-subtitle">Tourne la roue et découvre ce que le destin t'offre !</h2>
      <p className="roulette-description">
      1 inscription à la newsletter = 1 lancer</p>
      <Roulette />
      <p className="roulette-disclaimer">
        Les informations recueillies sont enregistrées par Bibli'o Jouets pour l'envoi de sa newsletter. Elles sont conservées jusqu'à votre désinscription. Conformément au RGPD, vous pouvez exercer votre droit d'accès, de rectification ou de suppression en écrivant à contact@bibliojouets.fr.
      </p>
    </div>
  );
}

