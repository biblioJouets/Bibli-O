'use client';

import Image from 'next/image';
import Link from 'next/link';
import 'styles/Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareFacebook, faSquareInstagram, faLinkedin, faTiktok } from '@fortawesome/free-brands-svg-icons';

const logo = "/assets/logoBiblioJouets.png"
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Bloc logo */}
        <div className="footer-columns">
          <div className="footer-logo-section">
            <Image src={logo} alt="Logo Bibli'O Jouets" className="footer-logo" width={100} height={100} />
          </div>

          {/* Colonnes principales */}
          {/* Colonne Bibli'O */}
          <div className="footer-column">
            <p className="footer-title">Bibli'O</p>
            <ul>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/bibliotheque">Bibliothèque de jouets</Link></li>
              <li><Link href="/abonnements">Abonnements</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Colonne Informations */}
          <div className="footer-column">
            <p className="footer-title">Informations</p>
            <ul>
              <li><Link href="/conditions-generales-utilisation">Conditions générales d'utilisation</Link></li>
              <li><Link href="/conditions-generales-de-vente">Conditions générales de ventes</Link></li>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite">Politique de confidentialité</Link></li>
            </ul>
          </div>

          {/* Colonne Coordonnées */}
          <div className="footer-column">
            <p className="footer-title">Nos réseaux sociaux</p>
            <ul className="footer-coordonnees">
              <li>
                <a
                  className="social-link facebook"
                  href="https://www.facebook.com/people/Biblio-jouets/61581916582706/?locale=fr_FR"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bibli'O Jouets sur Facebook"
                  title="Facebook"
                >
                  <FontAwesomeIcon className="social-icon" icon={faSquareFacebook} />
                </a>
              </li>
              <li>
                <a
                  className="social-link instagram"
                  href="https://www.instagram.com/bibliojouets/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bibli'O Jouets sur Instagram"
                  title="Instagram"
                >
                  <FontAwesomeIcon className="social-icon" icon={faSquareInstagram} />
                </a>
              </li>
              <li>
                <a
                  className="social-link linkedin"
                  href="https://www.linkedin.com/company/bibli-o-jouets/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bibli'O Jouets sur LinkedIn"
                  title="LinkedIn"
                >
              <FontAwesomeIcon className="social-icon" icon={faLinkedin} />                </a>
              </li>
              <li>
                <a
                  className="social-link tiktok"
                  href="https://www.tiktok.com/@bibliojouets"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bibli'O Jouets sur TikTok"
                  title="TikTok"
                >
                  <FontAwesomeIcon className="social-icon" icon={faTiktok} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 Bibli'O Jouets | Tous droits réservés
      </div>
    </footer>
  );
}
