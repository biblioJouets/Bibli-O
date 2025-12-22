'use client';

import React from "react";
// Assurez-vous que Form a un style qui utilise les couleurs du thème (par exemple, le bouton d'envoi et les champs)
import Form from "@/components/FormHomePage.jsx"; 
import "@/styles/contactPage.css";


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faSquareFacebook, faSquareInstagram, faLinkedin, faTiktok } from '@fortawesome/free-brands-svg-icons';


function ContactPage() {
  return (
    <div id="contact-page"  className="contactPage">
      {/* Conteneur pour les formes d'arrière-plan animées */}
      <div className="background-shapes">
        <div className="shape blue"></div>
        <div className="shape pink"></div>
        <div className="shape green"></div>
        <div className="shape yellow"></div>
        <div className="shape square"></div>
      </div>
      
      <div className="contactSection">
        <div className="contactLeft">
          {/* Texte ajusté pour correspondre à l'intention du style (plus centré sur le contenu) */}
          <h5 className="contact-subtitle">🧸 UN PROJET ? UN JEU ? ON ÉCOUTE !</h5> 
          <h2 className="contact-title">Envoyez-nous un message, lancez la partie !</h2>
          <p>
            Que vous ayez une question précise, besoin d'un devis sur mesure ou envie de partager une idée géniale, n'hésitez plus ! Laissez-nous un message, et notre équipe s'empressera de vous répondre plus vite qu'un jeu de construction.
          </p>
          
          {/* Liens Email - utilisation d'une balise <a> pour l'accessibilité */}
          <a href="mailto:contact@bibliojouets.com" className="contactItem">
            <div className="icons">
              <FontAwesomeIcon className="social-icon" icon={faEnvelope} />
            </div>
            <p>contact@bibliojouets.com</p>
          </a>
          
          {/* Icônes Sociales */}
          <div className="socialIcons">
            <a
              className="social-link facebook"
              href="https://www.facebook.com/people/Biblio-jouets/61581916582706/?locale=fr_FR"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bibli'O Jouets sur Facebook"
              title="Facebook"
            >
              <FontAwesomeIcon icon={faSquareFacebook} />
            </a>
            
            <a
              className="social-link instagram"
              href="https://www.instagram.com/bibliojouets/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bibli'O Jouets sur Instagram"
              title="Instagram"
            >
              <FontAwesomeIcon icon={faSquareInstagram} />
            </a>
            
            <a
              className="social-link linkedin"
              href="https://www.linkedin.com/company/bibli-o-jouets/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bibli'O Jouets sur LinkedIn"
              title="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            
            <a
              className="social-link tiktok"
              href="https://www.tiktok.com/@bibliojouets"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bibli'O Jouets sur TikTok"
              title="TikTok"
            >
              <FontAwesomeIcon icon={faTiktok} />
            </a>
          </div>
        </div>
        
        {/* Formulaire */}
        <div className="contactRight">
          <Form />
        </div>
      </div>
    </div>
  );
}

export default ContactPage;