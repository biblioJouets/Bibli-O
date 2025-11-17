import React from "react";

//import components
import Header from "../components/Header";
import Banner from "../components/Banner";
import ButtonBlue from "../components/ButtonBlue";
                    {/* Ajouter le composant NewToys après ajout de nouveau jouet  */}

// import NewToys from "../components/NewToys";
import CatalogOverview from "../components/CatalogOverview";
import CommitmentCard from "../components/CommitmentCard";
import CardsPlans from "../components/CardsPlans";
import Protocol from "../components/protocol";
import CardContentMission from "../components/CardsContentMission";
import FAQ from "../components/FAQ"
import Newsletter from "../components/Newsletter";
import FunctionalityCard from "../components/FunctionalityCard";
import Footer from "../components/Footer"
//import style
import '../components/style/homepage.css';
//import icon 
import leaf from "../assets/icon/leaf.png";
import wash from "../assets/icon/wash.png";
import zen from "../assets/icon/zen.png";
import euro from "../assets/icon/euro.png";
import { Redo } from 'lucide-react';


function Homepage() {
    return (
        <>
        
            <div className="Container">
                <Header />
               <Banner />
           
                <div className="functionalityCardsSection">
                    <h2>Comment fonctionne Bibli'O Jouets ?</h2>
                    <div className="functionalityCardsContainer">
                    <FunctionalityCard className="firstCard"
                        title=" Choisissez votre Plan"
                        description=" Sélectionnez votre abonnement avec le nombre de jouets qui vous convient, avec ou sans engagement."
                        number="1️⃣"
                    />
<Redo className="arrow arrow-top" />

                    <FunctionalityCard className="secondCard"
                        title=" Choisissez vos jouets"
                        description="Choisissez parmi notre large sélection de jouets éducatifs adaptés à l'âge et aux intérêts de vos enfants."
                        number="2️⃣"
                    />
                    <Redo className="arrow arrow-bottom" />
                    <FunctionalityCard className="thirdCard"
                        title=" Livré, Jouez, échangez"
                        description="Votre sélection de jouets est livrée propre et prête à jouer chez vous ou en point relais. Échangez si vous le souhaitez*."
                        number="3️⃣"
                    />
                    </div>
                    <ButtonBlue  
                        text="Voir les abonnements"
                        href="/abonnements"
                    />
                    </div>
                    
                     <div className="commitmentsSection">
                    <h2>Pourquoi louer plutôt qu'acheter ?</h2>
                    <div className="commitmentCards">
                          <CommitmentCard className="hygiene"
                            title="Hygiène"
                            description="Tous nos jouets sont soigneusement nettoyés et désinfectés avant et après chaque location, garantissant un environnement de jeu sain pour vos enfants."
                            icon={wash}
                            iconClassName="icon-large"
                        />
                        <CommitmentCard
                            title="Écologie"
                            description="En louant des jouets, vous contribuez à réduire les déchets et à promouvoir un mode de consommation plus durable."
                            icon={leaf}
                        />
                       
                         <CommitmentCard
                            title="Practicité"
                            description="Profitez de la commodité de notre service de location, avec une livraison rapide et un retour facile des jouets à la fin de la période de location."
                            icon={zen}
                        />
                         <CommitmentCard
                            title="Économie"
                            description="Optez pour une solution économique en louant des jouets de qualité à moindre coût, tout en offrant à vos enfants une variété d'expériences ludiques."
                            icon={euro}
                        />
                        
                    </div>
                    </div>
                    {/* Ajouter le composant NewToys après ajout de nouveau jouet  */}
                {/* <div className="newToysContainer">
                    <NewToys />
                </div> */}
                <CardContentMission />
                    <CatalogOverview />
               <Protocol />
                        <div className="CardsPlansSections">
                            <h2> Nos Plans Mensuels </h2>
                        <CardsPlans />
                        
                        </div>
                        
                          <FAQ />

          <Newsletter />

                        </div>

    
 
 
    <Footer />
           
        </>
    );
}

export default Homepage;