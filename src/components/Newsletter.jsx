'use client';
import HCaptcha from "@hcaptcha/react-hcaptcha";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import 'styles/newsletter.css';
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email().max(254),
});

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showError, setShowError] = useState(false);

  // 🔥 Nouveau : token hCaptcha
  const [token, setToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification du captcha avant tout
    if (!token) {
      alert("Veuillez prouver que vous n’êtes pas un robot 😅");
      return;
    }

    try {
      newsletterSchema.parse({ email });
    } catch (err) {
      setShowError(true);
      setTimeout(() => setShowError(false), 6000);
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hcaptchaToken: token }),
      });

      if (response.ok) {
        setSent(true);
        setEmail("");
        setToken(null); // Réinitialise le captcha
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
      <div className="newsletter-bubble blue"></div>
      <div className="newsletter-bubble pink"></div>
      <div className="newsletter-bubble green"></div>
      <div className="newsletter-bubble yellow"></div>

      <div className="newsletter-content">
        <h2 className="newsletter-title">✨ Restons connectés ! ✨</h2>
        
        <p className="text-content">
Prêt à découvrir les derniers trésors qui rejoignent notre collection ? Laissez-nous votre email pour embarquer : l'aventure Bibli'O Jouets continue directement dans votre boîte de réception ! 🎁"        </p>

        <div className="form-newsletter">
          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
              />

              <button
                type="submit"
                className={`send-button ${isSending ? 'sending' : ''}`}
              >
                <FontAwesomeIcon 
                  icon={faPaperPlane}
                  className={`plane-icon ${isSending ? 'flying' : ''}`}
                />
              </button>
            </div>

            {/* 🔥 hCaptcha intégré proprement */}
            <div style={{ marginTop: "12px", marginBottom: "-5px" }}>
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                onVerify={setToken}
              />
            </div>
          </form>

          {showError && (
            <div className="error-message">
              ⚠️ Oups ! Vérifiez votre adresse email 📧
            </div>
          )}

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
}
