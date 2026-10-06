'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import 'styles/Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareFacebook, faSquareInstagram, faLinkedin, faTiktok } from '@fortawesome/free-brands-svg-icons';

const logo = "/assets/logoBiblioJouets.png";
const FOOTER_ARTICLES_LIMIT = 5;

export default function Footer() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/blogs')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setArticles(data.slice(0, FOOTER_ARTICLES_LIMIT));
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-columns">
          <div className="footer-logo-section">
            <Image src={logo} alt="Logo Bibli'O Jouets" className="footer-logo" width={100} height={100} />
          </div>

          {/* Colonne Bibli'O */}
          <nav className="footer-column" aria-label="Bibli'O">
            <p className="footer-title">Bibli&apos;O</p>
            <ul>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/mariage">Mariage</Link></li>
              <li><Link href="/bibliotheque">Nos Jouets</Link></li>
              <li><Link href="/abonnements">Abonnements</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </nav>

          {/* Colonne Notre Univers — SEO / Le Mag' + articles dynamiques */}
          <nav className="footer-column" aria-label="Notre Univers">
            <p className="footer-title">Notre Univers</p>
            <ul>
              <li><Link href="/blogs">Le Mag&apos;</Link></li>
              {articles.map((article) => (
                <li key={article.id}>
                  <Link href={`/blogs/${article.slug}`}>
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Colonne Informations */}
          <nav className="footer-column" aria-label="Informations légales">
            <p className="footer-title">Informations</p>
            <ul>
              <li><Link href="/conditions-generales-utilisation">Conditions générales d&apos;utilisation</Link></li>
              <li><Link href="/conditions-generales-de-vente">Conditions générales de ventes</Link></li>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite">Politique de confidentialité</Link></li>
            </ul>
          </nav>

          {/* Colonne Réseaux sociaux */}
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
                  href="https://www.instagram.com/location_jouets_biblio/"
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
                  <FontAwesomeIcon className="social-icon" icon={faLinkedin} />
                </a>
              </li>
              <li>
                <a
                  className="social-link tiktok"
                  href="https://www.tiktok.com/@location_biblio_jouets?lang=fr"
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
        © 2026 Bibli&apos;o Jouets | Tous droits réservés
      </div>
    </footer>
  );
}
