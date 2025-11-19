"use client";

//import components

import ButtonBlue from "@/components/ButtonBlue";

// import NewToys from "../components/NewToys";
import Banner from "@/components/Banner";
import CatalogOverview from "@/components/CatalogOverview";
import CommitmentCard from "@/components/CommitmentCard";
import CardsPlans from "@/components/CardsPlans";
import Protocol from "@/components/protocol";
import CardContentMission from "@/components/CardsContentMission";
import FAQ from "@/components/FAQ"
import Newsletter from "@/components/Newsletter";
import FunctionalityCard from "@/components/FunctionalityCard";
//import style
import '@/styles/homepage.css';
//import icon 
import { Redo } from 'lucide-react';

const WASHIMAGE = "assets/icons/wash.png";
const LEAFIMAGE = "assets/icons/leaf.png";
const ZENIMAGE = "assets/icons/zen.png";
const EUROIMAGE = "assets/icons/euro.png";
function Homepage() {

  const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization", 
        "name": "Bibli'O jouets",
        "url": "https://www.biblio-jouets.fr",
        "logo": "https://www.biblio-jouets.fr/public/assets/logoBiblioJouets.png", 
        "description": "Service de location de jouets éducatifs et jeux de société par abonnement.",
        "sameAs": [
            "https://www.facebook.com/people/Biblio-jouets/61581916582706/?locale=fr_FR", 
            "https://www.instagram.com/bibliojouets/",
            "https://www.linkedin.com/company/bibli-o-jouets/posts/?feedView=all",
            "https://www.tiktok.com/@bibliojouets"
        ]
    };
    return (
        <>
  <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* On garde une div ici pour le conteneur global, c'est OK */}
            <div className="Container">
                
                {/* Le H1 est à l'intérieur, c'est parfait */}
                <Banner />
           
                {/* NOTE SEO : Remplacement de div par section pour délimiter le sujet */}
                <section className="functionalityCardsSection" aria-labelledby="fonctionnement-title">
                    {/* NOTE A11Y : Ajout d'un ID pour lier le titre à la section */}
                    <h2 id="fonctionnement-title">Comment fonctionne Bibli'O Jouets ?</h2>
                    
                    <div className="functionalityCardsContainer">
                        <FunctionalityCard className="firstCard"
                            title="Choisissez votre Plan"
                            description="Sélectionnez votre abonnement avec le nombre de jouets qui vous convient, avec ou sans engagement."
                            number="1️⃣"
                        />
                        
                        {/* NOTE A11Y : aria-hidden="true" cache cette flèche décorative aux lecteurs d'écran */}
                        <Redo className="arrow arrow-top" aria-hidden="true" />

                        <FunctionalityCard className="secondCard"
                            title="Choisissez vos jouets"
                            description="Choisissez parmi notre large sélection de jouets éducatifs adaptés à l'âge et aux intérêts de vos enfants."
                            number="2️⃣"
                        />
                        
                        <Redo className="arrow arrow-bottom" aria-hidden="true" />
                        
                        <FunctionalityCard className="thirdCard"
                            title="Livré, Jouez, échangez"
                            description="Votre sélection de jouets est livrée propre et prête à jouer chez vous ou en point relais. Échangez si vous le souhaitez*."
                            number="3️⃣"
                        />
                    </div>
                    
                    <ButtonBlue  
                        text="Voir les abonnements"
                        href="/abonnements"
                    />
                </section>
                    
                {/* NOTE SEO : Nouvelle section sémantique */}
                <section className="commitmentsSection" aria-labelledby="engagements-title">
                    <h2 id="engagements-title">Pourquoi louer plutôt qu'acheter ?</h2>
                    <div className="commitmentCards">
                        <CommitmentCard
                            className="hygiene"
                            title="Hygiène"
                            description="Tous nos jouets sont soigneusement nettoyés et désinfectés avant et après chaque location."
                            icon={WASHIMAGE} 
                            iconClassName="icon-large"    
                        />
                        <CommitmentCard
                            title="Écologie"
                            description="En louant des jouets, vous contribuez à réduire les déchets et à promouvoir un mode de consommation plus durable."
                            icon={LEAFIMAGE} 
                        />
                        <CommitmentCard
                            title="Praticité"
                            description="Profitez de la commodité de notre service de location, avec une livraison rapide et un retour facile."
                            icon={ZENIMAGE}
                        />
                        <CommitmentCard
                            title="Économie"
                            description="Optez pour une solution économique en louant des jouets de qualité à moindre coût."
                            icon={EUROIMAGE}
                        />
                    </div>
                </section>

                {/* Section Mission */}
                <section>
                    <CardContentMission />
                </section>

                {/* Section Catalogue */}
                <section>
                     <CatalogOverview />
                </section>

                {/* Section Protocole */}
                <section>
                    <Protocol />
                </section>
                
                {/* Section Plans */}
                <section className="CardsPlansSections" aria-labelledby="plans-title">
                    <h2 id="plans-title">Nos Plans Mensuels</h2>
                    <CardsPlans />
                </section>
                        
                {/* Section FAQ et Newsletter */}
                <section>
                    <FAQ />
                </section>

                <section>
                    <Newsletter />
                </section>

            </div>
        </>
    );
}

export default Homepage;