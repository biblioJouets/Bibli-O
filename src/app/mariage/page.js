import '@/styles/mariage.css';

import DevisForm from '@/components/DevisForm.jsx';

const  IMAGE_MARIAGE1  = 'assets/mariage/image_mariage1.webp';
const  IMAGE_MARIAGE2  = 'assets/mariage/image_mariage2.webp';
const  IMAGE_MARIAGE3  = 'assets/mariage/image_mariage3.webp';


// export const metadata = {
//   title: "Location Jouets Mariage & Événements | Bibli'o Jouets",
//   description: "Offrez à vos mariés  le jour J. Des packs de location de jouets avec livraison et installation sur Montpellier et alentours.",
//   openGraph: {
//     title: "Location d'Espace Enfant pour Mariages | Bibli'o Jouets",
//     description: "Des prestations irréprochables pour occuper les enfants. Découvrez nos formules à partir de 50€ avec livraison incluse.",
//     url: 'https://www.bibliojouets.fr/mariage',
//     siteName: "Bibli'o Jouets",
//     locale: 'fr_FR',
//     type: 'website',
//   },
// };

export default function MariageEventPage() {
  return (
    <main className="bj-mar-main">
      
      {/* SECTION 1 : HERO */}
      <section className="bj-mar-section bj-mar-hero bg-warm-2">
        <div className="bj-mar-container bj-mar-hero-grid">
          <div className="bj-mar-hero-content">
            <h1 className="bj-mar-h1">Et si vous offriez à vos mariés <span className="bj-main-title-highlight">la tranquillité d'esprit absolue le jour J ?</span></h1>
            <p className="bj-mar-subtitle">
              Parce que vous exigez le meilleur pour vos mariés, Bibli'o Jouets s'associe aux professionnels de l'événementiel pour co-créer des souvenirs parfaits.
            </p>
            <div className="bj-mar-hero-actions">
              <a href="#devis" className="bj-mar-btn-primary">Demander un devis sur mesure ↗</a>
              <a href="#packs" className="bj-mar-btn-secondary">Découvrir les formules ↗</a>
            </div>
          </div>
          <div className="bj-mar-hero-image-wrapper">
            <div className="bj-mar-blob bj-mar-blob-blue"></div>
            <img src={IMAGE_MARIAGE1} alt="Enfants jouant sous un tipi décoré" className="bj-mar-img" />
          </div>
        </div>
      </section>

      {/* SECTION 2 : ABOUT / LE CONCEPT */}
      <section className="bj-mar-section bj-mar-concept bg-warm-3">
        <div className="bj-mar-container bj-mar-concept-grid">
          <div className="bj-mar-concept-image-wrapper">
            <img src={IMAGE_MARIAGE2} alt="Espace de jeu aménagé" className="bj-mar-img" />
            <div className="bj-mar-floating-stat bg-pink">
              <div>
                <span className="bj-mar-stat-title">Option</span>
                <span className="bj-mar-stat-desc">"Sérénité Hygiène" incluse</span>
              </div>
            </div>
          </div>
          <div className="bj-mar-concept-content">
            <span className="bj-mar-overline">Notre <span className="bj-main-title-highlight">engagement</span></span>
            <h2 className="bj-mar-h2">Une expérience <span className="bj-main-title-highlight">client unique</span>
</h2>
            <p className="bj-mar-text">
              Un service haut de gamme qui surprend et fidélise les familles. Nous prenons en charge l'espace enfant de A à Z.
            </p>
            <p className="bj-mar-text">
              La livraison et l'installation sont incluses sur Montpellier et ses alentours, garantissant une mise en place sans accroc.
            </p>
            <a href="#packs" className="bj-mar-btn bj-mar-btn-secondary">Voir nos offres ↗</a>
          </div>
        </div>
      </section>

      {/* SECTION 3 : WHY CHOOSE US / 3 PILIERS */}
      <section className="bj-mar-section bj-mar-reasons bg-warm-2">
        <div className="bj-mar-container">
          <div className="bj-mar-section-header">
            <span className="bj-mar-overline">Vos <span className="bj-main-title-highlight">avantages</span></span>
            <h2 className="bj-mar-h2">Vos défis événementiels relevés avec <span className="bj-main-title-highlight">excellence</span> :</h2>
          </div>
          <div className="bj-mar-reasons-grid">
            <div className="bj-mar-card bg-warm-pastel-blue ">
              <div className="bj-mar-icon-box bg-blue text-blue">🛡️</div>
              <h3 className="bj-mar-h3">Sécurité & Confiance</h3>
              <p className="bj-mar-text-small">Des prestations irréprochables pour protéger votre réputation auprès des mariés.</p>
            </div>
            <div className="bj-mar-card bg-warm-pastel-red">
              <div className="bj-mar-icon-box bg-pink">🧘</div>
              <h3 className="bj-mar-h3">Zéro Charge Mentale</h3>
              <p className="bj-mar-text-small">Une collaboration fluide, autonome pour vous épauler dans l'organisation.</p>
            </div>
            <div className="bj-mar-card bg-warm-pastel-green">
              <div className="bj-mar-icon-box bg-green text-green">⭐</div>
              <h3 className="bj-mar-h3">Expérience Client Unique</h3>
              <p className="bj-mar-text-small">Un service haut de gamme qui surprend et fidélise les familles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 : NOS FORMULES MARIAGE */}
      <section id="packs" className="bj-mar-section bj-mar-packs bg-warm-3">
        <div className="bj-mar-container bj-mar-packs-grid">
          <div className="bj-mar-packs-image-wrapper">
             <div className="bj-mar-blob bj-mar-blob-yellow"></div>
            <img src={IMAGE_MARIAGE3} alt="Exemple de jeux en bois et loisirs créatifs" className="bj-mar-img" />
          </div>
          <div className="bj-mar-packs-content">
            <span className="bj-mar-overline">Formules <span className="bj-main-title-highlight">Mariage</span></span>
            <h2 className="bj-mar-h2">Des solutions complètes, livraison & <span className="bj-main-title-highlight">installation incluses</span></h2>
            
            <div className="bj-mar-services-list">
              <div className="bj-mar-service-item">
                <div className="bj-mar-icon-small bg-blue">50€</div>
                <div>
                  <h3 className="bj-mar-h3">Pack 6 jouets</h3>
                  <p className="bj-mar-text-small">Ex: tapis d'éveil, balles sonores, jeux de sociétés. Option "Sérénité Hygiène", livraison & installation incluses.</p>
                </div>
              </div>
              <div className="bj-mar-service-item">
                <div className="bj-mar-icon-small bg-pink">60€</div>
                <div>
                  <h3 className="bj-mar-h3">Pack jouets + jeux créatifs</h3>
                  <p className="bj-mar-text-small">Pack 6 jouets + ex: coloriages, perles, tatoo. Option "Sérénité Hygiène", livraison & installation incluses.</p>
                </div>
              </div>
              <div className="bj-mar-service-item">
                <div className="bj-mar-icon-small bg-green">70€</div>
                <div>
                  <h3 className="bj-mar-h3">Pack jouets + jeux créatifs + décoration</h3>
                  <p className="bj-mar-text-small">Pack 6 jouets + jeux créatifs + décorations de l'espace enfant. Option "Sérénité Hygiène", livraison & installation incluses.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 : NOTRE PROCESSUS */}
      <section className="bj-mar-section bj-mar-process bg-warm-2">
        <div className="bj-mar-container">
          <div className="bj-mar-section-header text-center">
            <span className="bj-mar-overline">Notre <span className="bj-main-title-highlight">méthode</span></span>
            <h2 className="bj-mar-h2">Une organisation 100% <span className="bj-main-title-highlight">autonome et fluide</span></h2>
          </div>
          <div className="bj-mar-process-grid">
            <div className="bj-mar-step-card bg-warm-pastel-blue">
              <span className="bj-mar-step-num bg-blue">01</span>
              <h3 className="bj-mar-h3">Expression du besoin</h3>
              <p className="bj-mar-text-small">Contactez-nous pour un devis sur mesure ou choisissez une de nos formules.</p>
            </div>
            <div className="bj-mar-step-card bg-warm-pastel-red bj-mar-stagger-down">
              <span className="bj-mar-step-num bg-pink">02</span>
              <h3 className="bj-mar-h3">Sécurité & Préparation</h3>
              <p className="bj-mar-text-small">Chaque jeu bénéficie de l'option "Sérénité Hygiène" avant l'événement.</p>
            </div>
            <div className="bj-mar-step-card bg-warm-pastel-green">
              <span className="bj-mar-step-num bg-green">03</span>
              <h3 className="bj-mar-h3">Logistique incluse</h3>
              <p className="bj-mar-text-small">Livraison & installation incluses sur Montpellier et alentours.</p>
            </div>
            <div className="bj-mar-step-card bg-warm-pastel-yellow bj-mar-stagger-down">
              <span className="bj-mar-step-num bg-yellow">04</span>
              <h3 className="bj-mar-h3">Le grand jour</h3>
              <p className="bj-mar-text-small">Des enfants ravis, des parents rassurés, et une prestation irréprochable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 : FORMULAIRE / CONTACT FINAL */}
     <DevisForm />

    </main>
  );
}