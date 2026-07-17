

//import components
import CommitmentsCarousel from "@/components/CommitmentsCarousel";
import ButtonRed from "@/components/ButtonRed";
import PromotionBanner from '@/components/PromoBanner';

// import NewToys from "../components/NewToys";
import Banner from "@/components/Banner";
import CatalogOverview from "@/components/CatalogOverview";
import CommitmentCard from "@/components/CommitmentCard";
import Protocol from "@/components/protocol";
import CardContentMission from "@/components/CardsContentMission";
import FAQ from "@/components/FAQ"
import Newsletter from "@/components/Newsletter";
import FunctionalityCard from "@/components/FunctionalityCard";
import SubChoice from "@/components/SubChoice";
import GoogleReviews from '@/components/GoogleReviews';
import prisma from "@/lib/core/database";

import Feature from '@/components/FeaturesSection';

//import style
import '@/styles/homepage.css';
//import icon 
import { Redo } from 'lucide-react';

const CARIMAGE = "assets/icons/car.png";
const CLICKIMAGE = "assets/icons/click.png";
const DELIVERYIMAGE ="assets/icons/delivery.png";
const WASHIMAGE = "assets/icons/wash.png";


async function getGoogleReviews() {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) return [];

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=fr&key=${apiKey}`;

    try {
        const response = await fetch(url, { next: { revalidate: 86400 } });
        if (!response.ok) return [];
        
        const data = await response.json();
        if (!data.result || !data.result.reviews) return [];

        return data.result.reviews.map((review) => ({
            name: review.author_name,
            photo: review.profile_photo_url,
            rating: review.rating,
            text: review.text,
        }));
    } catch (error) {
        console.error('Erreur de récupération des avis Google:', error);
        return [];
    }
}
export default async function Homepage() {

    const [reviews, boxProduct] = await Promise.all([
        getGoogleReviews(),
        prisma.products.findUnique({ where: { reference: "BOX-MYSTERE" } }),
    ]);
  const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization", 
        "name": "Bibli'O jouets",
        "url": "https://www.biblio-jouets.fr",
        "logo": "https://www.biblio-jouets.fr/public/assets/logoBiblioJouets.png", 
        "description": "Service de location de jouets éducatifs et jeux de société par abonnement.",
        "sameAs": [
            "https://www.facebook.com/people/Biblio-jouets/61581916582706/?locale=fr_FR", 
            "https://www.instagram.com/location_jouets_biblio/",
            "https://www.linkedin.com/company/bibli-o-jouets/posts/?feedView=all",
            "https://www.tiktok.com/@location_jouets_biblio"
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
                < PromotionBanner />

                {/* NOTE SEO : Remplacement de div par section pour délimiter le sujet */}
                <section className="functionalityCardsSection" aria-labelledby="fonctionnement-title">
                    {/* NOTE A11Y : Ajout d'un ID pour lier le titre à la section */}

                <h2 className="bj-main-title" id="fonctionnement-title">
                      Comment fonctionne <span className="bj-main-title-highlight">Bibli'O Jouets ?</span>
                    </h2>                    

                    <div className="functionalityCardsContainer">
    <FunctionalityCard 
        className="firstCard"
        title="Composez votre box"
        description="Créez votre box sur-mesure parmi notre sélection de jeux."
        number="1"
    />
    
    <Redo className="arrow arrow-top" aria-hidden="true" />

    <FunctionalityCard 
        className="secondCard"
        title="Recevez et jouez"
        description="Recevez, profitez, puis gardez-les autant de temps qu'il vous plaira."
        number="2"
    />
    
    <Redo className="arrow arrow-bottom" aria-hidden="true" />
    
    <FunctionalityCard 
        className="thirdCard"
        title="Échangez ou Adoptez"
        description="Échangez votre sélection, gardez vos favoris, ou arrêtez quand vous voulez."
        number="3"
    />
</div>
                    
                    <ButtonRed  
                        text="Lancer l'aventure Bibli'o Jouets"
                        href="/bibliotheque"
                    />
                </section>
                {/* Section Engagements */}
        <CommitmentsCarousel />



                {/* Section Mission */}
                <section>
                    <CardContentMission />
                </section>

                {/* Section Catalogue */}
                <section>
                     <CatalogOverview />
                </section>

                 <section className="sub-choice-section" aria-labelledby="sub-choice-title">
                    <div className="sectionSub"> 
            <h2 className="bj-main-title " id="plans-title">Nos formules <span className="bj-main-title-highlight">d'abonnement</span></h2>
</div>

                    <div className="SubChoiceSection">
             
                <SubChoice />
 </div>
       
                </section>


                <Feature />

                 <section className="bg-green-homepage">
                  <Protocol />
                </section>
               
                
                {/* Section avis */}
                <section className="reviewsSection" aria-labelledby="reviews-title">
                    <GoogleReviews reviews={reviews} />
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

