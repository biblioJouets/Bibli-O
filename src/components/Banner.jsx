import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../styles/Banner.css'; 

const Banner = () => {
  return (
    <section className="bj-banner-container">
      {/* Zone Image */}
      <div className="bj-banner-image-wrapper">
        <Image 
          src="/assets/image_desktop.webp" 
          alt="Enfants s'amusant avec les jouets écologiques Bibli'o Jouets" 
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="bj-banner-image"
        />
      </div>

      {/* Zone Texte */}
      <div className="bj-banner-content">
        <div className="bj-banner-badge">
          Sans engagement
        </div>
        
        <h1 className="bj-banner-title">
          Choississez, Jouez, <span className="bj-banner-highlight">Échangez !</span>
        </h1>
        
        <p className="bj-banner-description">
          L'abonnement qui libère votre salon et l'imaginaire de vos enfants. 
          Économisez, préservez la planète et offrez-leur des nouveautés à volonté.
        </p>
        
        <div className="bj-banner-actions">
          <Link href="/bibliotheque" className="bj-banner-btn-primary">
            Découvrir les jouets
          </Link>
          <Link href="/fonctionnement" className="bj-banner-btn-secondary">
            Comment ça marche ?
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Banner;