import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "./style/newsletter.css";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email || !email.includes("@")) {
    setShowError(true);
    setTimeout(() => setShowError(false), 6000);
    return;
  }

  setIsSending(true);

  try {
    const response = await fetch("http://localhost:5000/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      setSent(true);
      setEmail("");
      setTimeout(() => setSent(false), 8000);
    } else {
      const data = await response.json();
      console.error("Erreur backend:", data.error);
      setShowError(true);
      setTimeout(() => setShowError(false), 6000);
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    setShowError(true);
    setTimeout(() => setShowError(false), 6000);
  } finally {
    setIsSending(false);
  }
};

  return (
    <div className="newsletter-container">
      {/* Bulles décoratives */}
      <div className="newsletter-bubble blue"></div>
      <div className="newsletter-bubble pink"></div>
      <div className="newsletter-bubble green"></div>
      <div className="newsletter-bubble yellow"></div>

      <div className="newsletter-content">
        <h2 className="newsletter-title">✨ Restons connectés ! ✨</h2>
        
        <p className="text-content">
          Pour être au courant des derniers trésors ajoutés à notre collection, des ateliers créatifs pour vos enfants ou de nos soirées jeux, laissez-nous simplement votre email. L'aventure bibli'O Jouets continue dans votre boîte mail !! ✨
        </p>

        <div className="form-newsletter">
          <div className="input-wrapper">
            <input
              type="email"
              placeholder="Ton adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
            />
            <button 
              type="button"
              onClick={handleSubmit}
              className={`send-button ${isSending ? 'sending' : ''}`}
            >
              <FontAwesomeIcon 
                icon={faPaperPlane} 
                className={`plane-icon ${isSending ? 'flying' : ''}`}
              />
            </button>
          </div>

          {/* Message d'erreur */}
          {showError && (
            <div className="error-message">
              ⚠️ Oups ! Vérifie ton adresse e-mail 📧
            </div>
          )}

          {/* Message de succès */}
          {sent && (
            <div className="success-animation">
              <div className="success-text">
                🎉 Youhouuu ! Bienvenue dans la Bibliothèque ! 🎈
              </div>
              <div className="success-subtext">
                Prépare-toi à recevoir plein de surprises ! 🧸✨
              </div>
            </div>
          )}

          {/* Explosion de confettis */}
          {sent && (
            <div className="confetti">
              {[...Array(50)].map((_, i) => {
                const angle = (Math.PI * 2 * i) / 50;
                const velocity = 150 + Math.random() * 100;
                const duration = 1.2 + Math.random() * 0.8;
                const delay = Math.random() * 0.2;
                
                return (
                  <span
                    key={i}
                    className="confetti-piece"
                    style={{
                      backgroundColor: ['#6ec1e4', '#ffd9dc', '#88d4ab', '#ffe264', '#ffb6c1', '#b8e6f5'][i % 6],
                      animationDuration: `${duration}s`,
                      animationDelay: `${delay}s`,
                      '--angle': `${angle}rad`,
                      '--velocity': `${velocity}px`,
                      '--rotation': `${Math.random() * 720 - 360}deg`,
                    }}
                  ></span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Avion qui s'envole hors du bouton */}
      {isSending && (
        <div className="flying-plane-container">
          <FontAwesomeIcon 
            icon={faPaperPlane} 
            className="flying-plane-absolute"
          />
        </div>
      )}
    </div>
  );
};

export default Newsletter;