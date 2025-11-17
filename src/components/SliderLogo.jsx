import React from "react";
import "./style/sliderLogo.css";

import beaba from "../assets/logo/beaba.webp";
import carrera from "../assets/logo/carrera.webp";
import chefclub from "../assets/logo/chefclub.webp";
import clementoni from "../assets/logo/clementoni.webp";
import fisherprice from "../assets/logo/fisherprice.webp";
import hape from "../assets/logo/Hape.webp";
import janod from "../assets/logo/janod.webp";
import lexibook from "../assets/logo/lexibook.webp";
import lilliputiens from "../assets/logo/lilliputiens.webp";
import littledutch from "../assets/logo/littledutch.webp";
import smallfoot from "../assets/logo/smallfoot.webp";
import tinylove from "../assets/logo/tinylove.webp";
import vertbaudet from "../assets/logo/vertbaudet.webp";
import vtech from "../assets/logo/vtech.webp";
import winfun from "../assets/logo/winfun.webp";

const sliderLogos = [
  { src: beaba, alt: "Logo Béaba" },
  { src: carrera, alt: "Logo Carrera" },
  { src: chefclub, alt: "Logo ChefClub" },
  { src: clementoni, alt: "Logo Clementoni" },
  { src: fisherprice, alt: "Logo Fisher-Price" },
  { src: hape, alt: "Logo Hape" },
  { src: janod, alt: "Logo Janod" },
  { src: lexibook, alt: "Logo Lexibook" },
  { src: lilliputiens, alt: "Logo Lilliputiens" },
  { src: littledutch, alt: "Logo Little Dutch" },
  { src: smallfoot, alt: "Logo Small Foot" },
  { src: tinylove, alt: "Logo Tiny Love" },
  { src: vertbaudet, alt: "Logo Vertbaudet" },
  { src: vtech, alt: "Logo VTech" },
  { src: winfun, alt: "Logo Winfun" },
];

function SliderLogo() {
    const duplicatedLogos = [...sliderLogos, ...sliderLogos];
  return (
    <div className="sliderLogoWrapper">
    <div className="sliderLogoContainer">
      {duplicatedLogos.map((logo, i) => (
        <img key={i} src={logo.src} alt={logo.alt} className="sliderLogoImage" />
      ))}
      </div>
    </div>
  );
}

export default SliderLogo;
