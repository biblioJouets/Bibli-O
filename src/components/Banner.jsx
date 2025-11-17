import imageEnfant from "../assets/imageEnfant.png";
import BannerResponsive from "../assets/responsiveBanner.png";
import ButtonDuo from "./ButtonDuo";
import ButtonRed from "./ButtonRed";
import "./style/Banner.css";

function Banner() {
  return (
    <div className="Banner">
      <picture>
        <source media="(max-width: 768px)" srcSet={BannerResponsive} />
        <img src={imageEnfant} alt="Enfants jouant" className="banner-image" />
        <div class="shape top-left blue"></div>
  <div class="shape top-right yellow"></div>
  <div class="shape mid-left"></div>
  <div class="shape bottom-left yellow"></div>
  <div class="shape bottom-right blue"></div>
      </picture>

      <div className="banner-content">
        <h1 className="banner-title">
          Louez des jouets adaptés à votre enfant, livrés à domicile
        </h1>
        <p className="banner-subtitle">
          Une bibliothèque de jouets sur abonnement pour permettre aux enfants
          de découvrir régulièrement de nouveaux jeux, tout en allégeant le
          budget des parents et en réduisant le gaspillage. Un service malin,
          écolo et adapté à leurs rythme de curiosité.
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
            blueHref="/catalogue"
            redHref="/abonnements"
            target="_self"
          />
        </div>

        <div className="button-group mobile">
          <ButtonRed text="Découvrir nos jouets" href="/catalogue" />
        </div>
      </div>
    </div>
  );
}

export default Banner;
