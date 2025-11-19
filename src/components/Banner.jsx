"use client"; // obligatoire si tu as du state ou des effets

import Image from "next/image";
import ButtonDuo from "@/components/ButtonDuo";
import ButtonRed from "@/components/ButtonRed";
import "styles/Banner.css";

export default function Banner() {
  return (
    <div className="Banner">
      <picture>
        <source media="(max-width: 768px)" srcSet="/assets/responsiveBanner.png" />
        <img src="/assets/imageEnfant.png" alt="Enfants jouant avec un jeu de construction en bois" className="banner-image" fetchPriority="high"/>
                <div className="shape top-left blue"></div>
  <div className="shape top-right yellow"></div>
  <div className="shape mid-left"></div>
  <div className="shape bottom-left yellow"></div>
  <div className="shape bottom-right blue"></div>
      </picture>

      <div className="banner-content">
        <h1 className="banner-title">
          Louez des jouets adaptés à votre enfant, livrés à domicile
        </h1>
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
          <ButtonRed text="Découvrir nos jouets" href="/catalogue" />
        </div>
      </div>
    </div>
  );
}
