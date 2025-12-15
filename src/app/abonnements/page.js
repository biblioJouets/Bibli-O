/* src/app/abonnements/page.js */


'use client';


import InBuilding from "../en-construction/page";

export default function SubscriptionsPage(){
    return <InBuilding />
}

// 'use client';

// import React from 'react';
// import Image from 'next/image';

// // Composants UI
// import CardsPlan from '@/components/CardsPlan';
// import ButtonRed from '@/components/ButtonRed';
// import ButtonGreen from '@/components/ButtonGreen';
// import ButtonYellow from '@/components/ButtonYellow';
// import FAQ from '@/components/FAQ';

// // Styles
// import '@/styles/abonnements.css';
// import '@/styles/CardsPlan.css';

// // Assets : Icônes
// import iconEuro from '../../../public/assets/icons/euro.png';
// import iconLeaf from '../../../public/assets/icons/leaf.png';
// import iconWash from '../../../public/assets/icons/wash.png';
// import iconZen from '../../../public/assets/icons/zen.png';

// // Assets : Marques (Preuve de qualité)
// import logoHape from '../../../public/assets/logo/Hape.webp';
// import logoJanod from '../../../public/assets/logo/janod.webp';
// import logoVtech from '../../../public/assets/logo/vtech.webp';
// import logoLilliputiens from '../../../public/assets/logo/lilliputiens.webp';
// import logoDjeco from '../../../public/assets/logo/smallfoot.webp'; // Remplacement si Djeco absent, ou autre

// export default function SubscriptionsPage() {

//   // Listes enrichies avec arguments "Massue" (Valeur réelle)
//   const listDecouverte = [
//     "2 jouets / mois",
//     "Valeur boutique : ~60€",
//     "Soit 35€ d'économie/mois",
//     "Échange illimité",
//     "Assurance Casse incluse ✅"
//   ];

//   const listStandard = [
//     "4 jouets / mois",
//     "Valeur boutique : ~120€",
//     "Soit 80€ d'économie/mois",
//     "Échange illimité",
//     "Assurance Casse incluse ✅"
//   ];

//   const listPremium = [
//     "6 jouets / mois",
//     "Valeur boutique : ~180€",
//     "Soit 125€ d'économie/mois",
//     "Échange illimité",
//     "Assurance Casse incluse ✅"
//   ];

//   return (
//     <main className="abonnements-page">
      
//       {/* 1. HERO : Promesse de valeur immédiate */}
//       <section className="abo-hero">
//         <div className="hero-content">
//           <h1>
//             Jouez <span className="highlight-blue">plus</span>, 
//             dépensez <span className="highlight-pink">moins</span>.
//           </h1>
//           <p>
//             Accédez à +500 jouets de grandes marques (Janod, Hape, VTech...) pour le prix d'un seul.
//             <br/>L'abonnement sans engagement qui grandit avec votre enfant.
//           </p>
//           <div className="hero-badges">
//             <span className="badge">📦 Livraison offerte</span>
//             <span className="badge">✨ Sans engagement</span>
//             <span className="badge">🛡️ Assurance casse incluse</span>
//           </div>
//         </div>
//       </section>

//       {/* 2. MARQUES : La réassurance par la qualité (NOUVEAU) */}
//       <section className="abo-brands">
//         <p>Ils font confiance à Bibli'O Jouets pour l'éveil de vos enfants</p>
//         <div className="brands-scroller">
//           <Image src={logoJanod} alt="Janod" className="brand-logo" />
//           <Image src={logoHape} alt="Hape" className="brand-logo" />
//           <Image src={logoVtech} alt="Vtech" className="brand-logo" />
//           <Image src={logoLilliputiens} alt="Lilliputiens" className="brand-logo" />
//           <Image src={logoDjeco} alt="Smallfoot" className="brand-logo" />
//         </div>
//       </section>

//       {/* 3. COMMENT CA MARCHE : Visuel et simple */}
//       <section className="abo-how">
//         <h2>L'expérience Bibli'O en 4 étapes</h2>
//         <div className="steps-grid">
//           <div className="step-card">
//             <div className="step-number num-1">1</div>
//             <h3>Créez votre Box</h3>
//             <p>Sélectionnez vos jouets favoris parmi notre catalogue éducatif (Montessori, éveil, construction...).</p>
//           </div>
//           <div className="step-card">
//             <div className="step-number num-2">2</div>
//             <h3>Recevez & Jouez</h3>
//             <p>Livraison rapide en point relais. Profitez des jouets aussi longtemps que vous le souhaitez.</p>
//           </div>
//           <div className="step-card">
//             <div className="step-number num-3">3</div>
//             <h3>Échangez</h3>
//             <p>Envie de nouveauté ? Renvoyez gratuitement la box et choisissez-en une nouvelle.</p>
//           </div>
//           <div className="step-card">
//             <div className="step-number num-4">4</div>
//             <h3>Un coup de ❤️ ?</h3>
//             <p>Vos enfants ne veulent plus lâcher un jouet ? Achetez-le à tarif préférentiel (-30% min).</p>
//           </div>
//         </div>
//       </section>

//       {/* 4. LES OFFRES : Focus sur la rentabilité */}
//       <section className="abo-plans-section" id="offres">
//         <div className="plans-header">
//           <h2>Choisissez votre rythme</h2>
//           <p>Tout est inclus : Livraison, Retours, Nettoyage, Assurance casse.</p>
//         </div>
        
//         <div className="plans-container-wrapper">
//           {/* Offre Découverte */}
//           <CardsPlan
//             title="Découverte"
//             price="25.99€"
//             theme="theme-red" 
//             button={<ButtonRed text="Je commence l'aventure" href="/inscription?plan=decouverte" />}
//             list={listDecouverte}
//           />

//           {/* Offre Standard (Mise en avant) */}
//           <div className="plan-wrapper-featured">
//             <div className="best-seller-badge">Le Préféré des Parents ❤️</div>
//             <CardsPlan
//               title="Standard"
//               price="39.99€"
//               theme="theme-green"
//               button={<ButtonGreen text="Je choisis Standard" href="/inscription?plan=standard" />}
//               list={listStandard}
//             />
//           </div>

//           {/* Offre Premium */}
//           <CardsPlan
//             title="Premium"
//             price="55.99€"
//             theme="theme-yellow"
//             button={<ButtonYellow text="Je choisis Premium" href="/inscription?plan=premium" />}
//             list={listPremium}
//           />
//         </div>
//       </section>

//       {/* 5. POURQUOI S'ABONNER (Bénéfices détaillés) */}
//       <section className="abo-benefits-detailed">
//         <div className="benefit-row">
//           <div className="benefit-text">
//             <h3>💰 Dites stop au gaspillage financier</h3>
//             <p>
//               Un enfant se lasse d'un jouet en moyenne après 3 semaines. 
//               Au lieu d'acheter 120€ de jouets chaque mois, louez-les pour 39€.
//               <strong> C'est mathématique : vous économisez plus de 800€ par an.</strong>
//             </p>
//           </div>
//           <div className="benefit-visual">
//              <Image src={iconEuro} alt="Economie" />
//           </div>
//         </div>

//         <div className="benefit-row reverse">
//           <div className="benefit-text">
//             <h3>🛡️ Zen, la casse est incluse !</h3>
//             <p>
//               Parce que ce sont des enfants, et que la vie est faite d'accidents.
//               Une pièce cassée ? Un jouet abîmé ? 
//               <strong> Pas de stress, ni de frais supplémentaires.</strong> 
//               L'usure normale et la casse accidentelle sont couvertes par votre abonnement.
//             </p>
//           </div>
//           <div className="benefit-visual">
//              <Image src={iconZen} alt="Zen" />
//           </div>
//         </div>

//         <div className="benefit-row">
//           <div className="benefit-text">
//             <h3>✨ Hygiène irréprochable</h3>
//             <p>
//               Nous ne plaisantons pas avec la propreté. Chaque jouet retourné passe par notre "Station de Lavage" :
//               contrôle de sécurité, nettoyage vapeur haute pression et désinfection écologique.
//             </p>
//           </div>
//           <div className="benefit-visual">
//              <Image src={iconWash} alt="Propreté" />
//           </div>
//         </div>
//       </section>

//       {/* 6. FAQ */}
//       <section className="abo-faq">
//         <h2>Questions Fréquentes</h2>
//         <FAQ />
//       </section>

//     </main>
//   );
// }