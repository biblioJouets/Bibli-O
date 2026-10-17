//src/components/roulette.jsx
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
      // Soumission de l'email vers l'API (qui gère l'enregistrement dans la table newsletter)
      const response = await fetch('/api/roulette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      // Gestion de l'erreur (ex: email déjà existant dans la table newsletter)
      if (!response.ok || data.error) {
        setMessage({ text: data.error || 'Une erreur est survenue.', type: 'error' });
        setIsSpinning(false);
        return;
      }

      // Mapping des angles cibles pour 10 cases de 36° (pour arrêter la case sous la flèche du haut)
      let targetAngle = 0;
      
      if (data.resultIndex === 0) {
        // Oups ! Raté : Cases impaires (1, 3, 5, 7, 9)
        const anglesPerdu = [342, 270, 198, 126, 54];
        targetAngle = anglesPerdu[Math.floor(Math.random() * anglesPerdu.length)];
      } else {
        // Gain Bibli'o : Cases paires (2, 4, 6, 8, 10)
        const anglesBiblio = [306, 234, 162, 90, 18];
        targetAngle = anglesBiblio[Math.floor(Math.random() * anglesBiblio.length)];
      }
      
      // Animation : 5 tours complets (1800 degrés) + l'angle cible
      const newRotation = rotation + 1800 + (targetAngle - (rotation % 360));
      setRotation(newRotation);

      // On attend 5 secondes (durée de la transition CSS) avant d'afficher le résultat
      setTimeout(() => {
        setIsSpinning(false);
        if (data.resultIndex === 0) {
          setMessage({ 
            text: "Oups, c'est raté ! Mais plein de belles aventures t'attendent en boutique.", 
            type: 'error' 
          });
        } else {
          setMessage({ 
            text: "Génial ! Tu remportes un gain Bibli'o Jouets ! 🎉", 
            type: 'success' 
          });
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
            {/* Les 10 cases (5 "Oups ! Raté" et 5 "Gain Bibli'o") */}
            <div className="slice-text s-1">Oups !<br/>Raté</div>
            <div className="slice-text s-2">Gain<br/>Bibli'o</div>
            <div className="slice-text s-3">Oups !<br/>Raté</div>
            <div className="slice-text s-4">Gain<br/>Bibli'o</div>
            <div className="slice-text s-5">Oups !<br/>Raté</div>
            <div className="slice-text s-6">Gain<br/>Bibli'o</div>
            <div className="slice-text s-7">Oups !<br/>Raté</div>
            <div className="slice-text s-8">Gain<br/>Bibli'o</div>
            <div className="slice-text s-9">Oups !<br/>Raté</div>
            <div className="slice-text s-10">Gain<br/>Bibli'o</div>
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