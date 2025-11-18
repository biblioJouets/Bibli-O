'use client';

import Image from 'next/image';
import 'styles/sliderLogo.css';

const sliderLogos = [
  { src: "/assets/logo/beaba.webp", alt: "Logo Béaba" },
  { src: "/assets/logo/carrera.webp", alt: "Logo Carrera" },
  { src: "/assets/logo/chefclub.webp", alt: "Logo ChefClub" },
  { src: "/assets/logo/clementoni.webp", alt: "Logo Clementoni" },
  { src: "/assets/logo/fisherprice.webp", alt: "Logo Fisher-Price" },
  { src: "/assets/logo/Hape.webp", alt: "Logo Hape" },
  { src: "/assets/logo/janod.webp", alt: "Logo Janod" },
  { src: "/assets/logo/lexibook.webp", alt: "Logo Lexibook" },
  { src: "/assets/logo/lilliputiens.webp", alt: "Logo Lilliputiens" },
  { src: "/assets/logo/littledutch.webp", alt: "Logo Little Dutch" },
  { src: "/assets/logo/smallfoot.webp", alt: "Logo Small Foot" },
  { src: "/assets/logo/tinylove.webp", alt: "Logo Tiny Love" },
  { src: "/assets/logo/vertbaudet.webp", alt: "Logo Vertbaudet" },
  { src: "/assets/logo/vtech.webp", alt: "Logo VTech" },
  { src: "/assets/logo/winfun.webp", alt: "Logo Winfun" },
];

export default function SliderLogo() {
  const duplicatedLogos = [...sliderLogos, ...sliderLogos];

  return (
    <div className="sliderLogoWrapper">
      <div className="sliderLogoContainer">
        {duplicatedLogos.map((logo, i) => (
          <Image 
            key={i} 
            src={logo.src} 
            alt={logo.alt} 
            className="sliderLogoImage"
            width={120}
            height={80}
            quality={80}
          />
        ))}
      </div>
    </div>
  );
}
