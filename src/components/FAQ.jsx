'use client';

import { useState } from 'react';
import Image from 'next/image';
import ButtonBlue from './ButtonBlue';

import {
  Heart,
  RefreshCw,
  XCircle,
  HelpCircle,
  ListChecks,
  Users,
  Truck,
  Blocks,
} from 'lucide-react';

import 'styles/FAQ.css';

const FAQIMAGE = "/assets/faq_image.webp", alt="image d'une famille jouant avec des jouets éducatifs";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      icon: <Heart size={20} />,
      question: "Comment fonctionne l'abonnement Bibli'O Jouets ?",
      answer: "C'est un jeu d'enfant ! Vous choisissez la formule d'abonnement qui convient à votre famille et sans engagement. vous sélectionnez les jouets que vous souhaitez emprunter pour le mois. Nous vous les préparons avec amour (nettoyés, désinfectés !). Les jouets sont expédiés à votre domicile où en point relais. Une fois le mois écoulé, vous nous retournez les jouets via le bordereau de retour qui vous sera envoyés, et vous en choisissez de nouveaux ! Simple, économique et écologique !"
    },
    {
      icon: <RefreshCw size={20} />,
      question: "Les jouets sont-ils vraiment propres et sûrs pour mes enfants ?",
      answer: "Absolument ! L'hygiène et la sécurité sont nos priorités absolues. Après chaque retour, chaque jouet passe par un protocole de nettoyage et de désinfection strict avec des produits écologiques. Ils sont ensuite minutieusement vérifiés pour s'assurer de leur conformité aux normes CE et de leur parfait état avant de repartir pour de nouvelles aventures. La sérénité des parents est notre engagement !"
    },
    {
      icon: <XCircle size={20} />,
      question: "Que se passe-t-il si un jouet est cassé ou perdu ?",
      answer: "Un accident est vite arrivé quand on joue ! Nous savons que cela fait partie de la vie des enfants. En cas de petite casse ou de perte d'une pièce mineure, pas de panique, c'est couvert par l'assurance qui est compris dans le tarif de la location! Pour des dommages importants ou la perte totale d'un jouet, une participation financière pourra être demandée, mais nous favorisons toujours la réparation. L'idée est de jouer sans stress !"
    },
    {
      icon: <ListChecks size={20} />,
      question: "Puis-je choisir les jouets pour mon enfant ?",
      answer: "Oui, bien sûr ! Vous avez la main sur le choix des jouets. Sur votre espace personnel, vous pourrez parcourir notre catalogue et sélectionner les jouets qui correspondent aux centres d'intérêt et à l'âge de votre enfant. Nous vous aiderons également avec des suggestions personnalisées pour des découvertes adaptées !"
    },
    {
      icon: <Users size={20} />,
      question: "À qui s'adresse le service Bibli'O Jouets ?",
      answer: "Bibli'O Jouets est conçu pour toutes les familles avec des enfants de 0 à 8 ans qui souhaitent offrir une multitude de découvertes ludiques à leurs petits explorateurs, tout en adoptant une consommation plus responsable. Parents, grands-parents, tontons, tantines... bienvenue à tous ceux qui aiment jouer et la planète !"
    },
    {
      icon: <HelpCircle size={20} />,
      question: "Pourquoi choisir la location plutôt que l'achat de jouets ?",
      answer: (
        <>
          Pour de multiples raisons géniales ! <br />
          <strong>Écologie :</strong> Vous participez activement à l'économie circulaire et réduisez le gaspillage. <br />
          <strong>Économie :</strong> Accédez à des jouets de qualité sans dépenser une fortune et sans vous encombrer. <br />
          <strong>Nouveauté :</strong> Votre enfant bénéficie d'une variété constante de jouets, toujours adaptés à son développement, sans que vous ayez à les stocker ou à les revendre. <br />
          <strong>Découverte :</strong> Permet à vos enfants d'expérimenter de nouveaux jeux et de développer de nouvelles compétences sans engagement à long terme.
        </>
      )
    },
    {
      icon: <XCircle size={20} />,
      question: "Comment résilier mon abonnement ?",
      answer: "Vous êtes libre de partir quand vous le souhaitez (même si on espère que vous resterez longtemps !). La résiliation de votre abonnement se fait très simplement depuis votre espace client, en quelques clics. Pensez simplement à le faire avant la date de renouvellement de votre abonnement mensuel."
    },
    {
      icon: <Truck size={20} />,
      question: "Est-ce que Bibli'O Jouets livre partout en France ?",
      answer: "Nous proposons plusieurs options de livraison et de retrait ! Selon votre zone, vous pourrez choisir entre le retrait gratuit en point relais. L'objectif est de vous faciliter la vie !"
    },
    {
      icon: <Blocks size={20} />,
      question: "Quel type de jouets proposez-vous ?",
      answer: "Notre catalogue est une véritable caverne d'Ali Baba de jouets éducatifs et ludiques ! Nous sélectionnons des puzzles, jeux de construction, jeux d'éveil sensoriel, jouets en bois, jeux de société adaptés à l'âge, et bien d'autres, tous conçus pour stimuler la créativité, la logique, la motricité et l'apprentissage de vos enfants, de 0 à 8 ans."
    },
    {
      icon: <RefreshCw size={20} />,
      question: "Comment gérer les retours de jouets ?",
      answer: "Le retour est aussi facile que le retrait ! Selon le mode choisi à la commande (point relais, livraison), vous pourrez nous restituer les jouets dans le créneau imparti. Nous vous fournirons toutes les instructions nécessaires pour un retour simple et rapide."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <div className="faq-content">
        <div className="faq-left">
          <h2 className="homePageSubTitle faq-support-label">FAQ</h2>
          <h1 className="faq-title">Les questions des (grands) curieux</h1>
          <p className="faq-subtitle">
            On vous dit tout sur le fonctionnement de Bibli'O Jouets. Une question en particulier ?{' '}
            <a href="/contact" className="faq-link">Contacter nous directement</a>.
          </p>

          <div className="faq-accordion">
            {faqData.map((item, index) => (
              <div key={index} className="faq-item">
                <button 
                  className="faq-question-btn"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={openIndex === index}
                >
                  <div className="faq-question-content">
                    <div className="faq-icon">{item.icon}</div>
                    <span className="faq-question-text">{item.question}</span>
                  </div>
                </button>
                <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="faq-right">
          <div className="faq-image-wrapper">
            <Image 
              src={FAQIMAGE} 
              alt="image d'une famille jouant avec des jouets éducatifs" 
              className="faq-image"
              width={400} 
              height={400} 
            />
          </div>
        </div>
      </div>
      <div className='faqButtonPosition'>
        <ButtonBlue 
          text="Je commence maintenant"
          href="/abonnements"
        />
      </div>
    </div>
  );
};

export default FAQ;
