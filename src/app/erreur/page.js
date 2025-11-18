import React from 'react';
import { Home } from 'lucide-react';
import "@/styles/Error404.css";

const Error404Pages = () => {
  return (
    <div className="error404-container">
      {/* Éléments de fond animés */}
      <div className="background-shapes">
        <div className="shape shape-circle-1"></div>
        <div className="shape shape-circle-2"></div>
        <div className="shape shape-square-1"></div>
        <div className="shape shape-circle-3"></div>
        <div className="shape shape-square-2"></div>
      </div>

      {/* Contenu principal */}
      <div className="content-wrapper">
        {/* Les chiffres 404 comme des blocs de jouets */}
        <div className="error-code">
          <span className="digit digit-1">4</span>
          <span className="digit digit-2">0</span>
          <span className="digit digit-3">4</span>
        </div>

        {/* Message d'erreur */}
        <div className="error-message">
          <h1 className="main-message">Oops ! Jouet perdu ?</h1>
          <p className="sub-message">
            Il semble que cette page se soit cachée dans le coffre à jouets. 
            Pas de panique, retrouvons notre chemin.
          </p>
        </div>

        {/* Bouton de retour */}
        <button className="home-button" onClick={() => window.location.href = '/'}>
          <Home className="home-icon" size={24} />
          <span>Retourner à l'accueil</span>
        </button>
      </div>
      </div>
  )
      }
      export default Error404Pages;