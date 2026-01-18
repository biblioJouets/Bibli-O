"use client"; 

import Image from "next/image";
import ButtonDuo from "@/components/ButtonDuo";
import ButtonRed from "@/components/ButtonRed";
import "styles/Banner.css";

export default function Banner() {
  return (
    <div className="Banner">
      
      
      <div className="banner-bg mobile-only">
        <Image 
            src="/assets/responsiveBanner.png" 
            alt="Enfants jouant - version mobile"
            fill
            priority 
            quality={100}
            sizes="100vw" 
            style={{ objectFit: "cover" }}
        />
      </div>

      <div className="banner-bg desktop-only">
        <Image 
            src="/assets/imageEnfant.webp" 
            alt="Enfants jouant avec un jeu de construction en bois"
            fill
            priority
            quality={100}
            sizes="100vw"
            style={{ objectFit: "cover" }}
            unoptimized={true}

        />
      </div>

      <div className="shape top-left blue"></div>
      <div className="shape top-right yellow"></div>
      <div className="shape mid-left"></div>
      <div className="shape bottom-left yellow"></div>
      <div className="shape bottom-right blue"></div>

      <div className="banner-content">
        <h1 className="banner-title">
Des jouets adaptés à votre enfant, directement à portée de main.        </h1>
        <p className="banner-subtitle">
          Une bibliothèque de jouets sur abonnement pour permettre aux enfants de découvrir régulièrement de nouveaux jeux...
        </p>
        
        <div className="floating-icon" style={{ top: "10%", right: "15%" }}>
          ⭐
        </div>
        <div className="floating-icon" style={{ bottom: "25%", left: "20%" }}>
          🧩
        </div>
        
        <div className="button-group desktop">
          <ButtonDuo
            blueText="Découvrir nos jouets"
            redText="Voir les abonnements"
            blueHref="/bibliotheque"
            redHref="/abonnements"
          />
        </div>

        <div className="button-group mobile">
          <ButtonRed text="Découvrir nos jouets" href="/bibliotheque" />
        </div>
      </div>
    </div>
  );
}