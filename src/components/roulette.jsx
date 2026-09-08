'use client';
import { useState } from 'react';
import '../styles/roulette.css'; 

export default function BiblioRoulette() {
  const [email, setEmail] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSpin = async (e) => {
    e.preventDefault();
    if (isSpinning || !email) return;

    setIsSpinning(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/roulette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      // Gestion de l'erreur (ex: email déjà existant)
      if (!response.ok || data.error) {
        setMessage({ text: data.error || 'Une erreur est survenue.', type: 'error' });
        setIsSpinning(false);
        return;
      }

      // Mapping des angles cibles pour chaque index de l'API (pour arrêter la case sous la flèche du haut)
      let targetAngle = 0;
      
      if (data.resultIndex === 0) {
        // Perdu : Cases 1, 3, 5, 7
        const anglesPerdu = [337.5, 247.5, 157.5, 67.5];
        targetAngle = anglesPerdu[Math.floor(Math.random() * anglesPerdu.length)];
      } else if (data.resultIndex === 1) {
        // Gain Bibli'o : Cases 2, 6, 8
        const anglesBiblio = [292.5, 112.5, 22.5];
        targetAngle = anglesBiblio[Math.floor(Math.random() * anglesBiblio.length)];
      } else {
        // Gain Baby Café : Case 4
        targetAngle = 202.5; 
      }
      
      // Animation : 5 tours complets (1800 degrés) + l'angle cible
      const newRotation = rotation + 1800 + (targetAngle - (rotation % 360));
      setRotation(newRotation);

      // On attend 5 secondes (durée de la transition CSS) avant d'afficher le résultat
      setTimeout(() => {
        setIsSpinning(false);
        if (data.resultIndex === 0) {
          setMessage({ text: "Oups, c'est raté ! Mais plein de belles aventures t'attendent en boutique.", type: 'error' });
        } else if (data.resultIndex === 1) {
          setMessage({ text: "Génial ! Tu remportes un gain Bibli'o Jouets ! 🎉", type: 'success' });
        } else {
          setMessage({ text: "Félicitations ! Tu remportes un avantage Bibli'o Baby Café ! ☕🍼", type: 'success' });
        }
      }, 5000);

    } catch (error) {
      setMessage({ text: "Erreur de connexion, vérifie ton réseau.", type: 'error' });
      setIsSpinning(false);
    }
  };

  return (
    <div className="roulette-wrapper">
      <div className="roulette-blob-bg"></div>
      
      <h2 className="roulette-title">La Roue Bibli'o</h2>
      <p className="roulette-subtitle">Un email = Une chance de gagner !</p>

      <div className="wheel-box">
        <div className="wheel-pointer"></div>
        <div className="wheel-border">
          <div 
            className="wheel-spin-area"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Les 8 cases avec leurs textes */}
            <div className="slice-text s-1">Oups !<br/>Raté</div>
            <div className="slice-text s-2">Gain<br/>Bibli'o</div>
            <div className="slice-text s-3">Retente<br/>ta chance</div>
            <div className="slice-text s-4">Baby<br/>Café</div>
            <div className="slice-text s-5">Oups !<br/>Raté</div>
            <div className="slice-text s-6">Gain<br/>Bibli'o</div>
            <div className="slice-text s-7">Retente<br/>ta chance</div>
            <div className="slice-text s-8">Gain<br/>Bibli'o</div>
          </div>
        </div>
        <div className="wheel-pivot"></div>
      </div>

      <form onSubmit={handleSpin} className="roulette-form-group">
        <input 
          type="email" 
          required
          placeholder="Ton adresse email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSpinning}
          className="roulette-input-mail"
        />
        <button 
          type="submit" 
          disabled={isSpinning}
          className="roulette-btn-spin"
        >
          {isSpinning ? 'EN COURS...' : 'TOURNER !'}
        </button>
      </form>

      {message.text && (
        <div className={`roulette-alert ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}