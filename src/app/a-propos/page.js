import CommitmentCard from '@/components/CommitmentCard';
import CardsContentMission from '@/components/CardsContentMission';
import MotDeLaDirigeante from '@/components/MotDeLaDirigeante';
import Newsletter from '@/components/Newsletter';
import ButtonBlue from '@/components/ButtonBlue';
import ButtonRed from '@/components/ButtonRed';
import ButtonYellow from '@/components/ButtonYellow';
import Image from 'next/image';

import '@/styles/homepage.css';
import '@/styles/abonnements.css';
import '@/styles/aPropos.css';

const LEAFIMAGE = 'assets/icons/leaf.png';
const APPROBATIONIMAGE = 'assets/icons/approbation.png';
const ZENIMAGE = 'assets/icons/zen.png';
const EUROIMAGE = 'assets/icons/euro.png';

export const metadata = {
  title: 'À propos',
  description:
    "Découvrez l'histoire, les valeurs et la mission de Bibli'O Jouets — la ludothèque en ligne par abonnement pour les familles éco-responsables.",
  alternates: { canonical: '/a-propos' },
};

export default function AboutPage() {
  return (
    <div className="about-page">

      {/* ============================================================
          SECTION 1 — HERO
      ============================================================ */}
      <section className="about-hero hero-section">
        <div className="hero-bg-shapes" aria-hidden="true">
          <div className="shape shape-blue"></div>
          <div className="shape shape-blue2"></div>
          <div className="shape shape-pink"></div>
        </div>

        <div className="hero-content container">
          <span className="hero-tag">Notre Histoire 🎠</span>
          <h1>Nés d&apos;une idée simple : que chaque enfant mérite de jouer.</h1>
          <p className="subtitle">
            Bibli&apos;O Jouets, c&apos;est la rencontre entre l&apos;amour du jeu, le respect
            de la planète et l&apos;envie de simplifier la vie des familles.
            Bienvenue dans notre univers&nbsp;!
          </p>
          <ButtonBlue text="Découvrir nos jouets" href="/bibliotheque" />
        </div>

        <div className="wave-container" aria-hidden="true">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
            <path d="M0,0 C300,60 900,60 1200,0 L1200,60 L0,60 Z" fill="#FFF7EB" />
          </svg>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — NOTRE HISTOIRE
      ============================================================ */}
      <section className="histoire-section" aria-labelledby="histoire-title">
        <div className="histoire-grid">
          <div className="histoire-text">
            <h2 id="histoire-title" className="homePageSubTitle">Notre Histoire</h2>
            <p>
              Tout a commencé dans un appartement trop petit et un coin de salon
              envahi de jouets oubliés. En 2025, Laura et Lucas, parents de deux
              enfants en bas âge, ont eu une idée&nbsp;: et si on créait une
              bibliothèque de jouets comme il en existe pour les livres&nbsp;?
            </p>
            <p>
              De cette conviction est née Bibli&apos;O Jouets — une ludothèque en ligne
              par abonnement, pensée pour les familles modernes qui veulent le
              meilleur pour leurs enfants sans se noyer dans le plastique et les
              factures.
            </p>
            <p>
              Aujourd&apos;hui, notre collection compte plus de 400 jouets soigneusement
              sélectionnés, et nous accompagnons des centaines de familles partout
              en France. 🧸
            </p>
          </div>
          <div className="histoire-image-wrapper">
            <Image
              src="/assets/box_bj.png"
              alt="Boîte Bibli'O Jouets prête à être livrée"
              width={480}
              height={480}
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — MOT DE LA DIRIGEANTE
      ============================================================ */}
      <MotDeLaDirigeante />

      {/* ============================================================
          SECTION 4 — CHIFFRES CLÉS
      ============================================================ */}
      {/* <section className="stats-section" aria-label="Chiffres clés Bibli'O Jouets">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="icon-circle icon-yellow" aria-hidden="true">🧸</div>
            <p className="stat-number">400+</p>
            <p className="stat-label">jouets en catalogue</p>
          </div>
          <div className="stat-card">
            <div className="icon-circle icon-pink" aria-hidden="true">👨‍👩‍👧‍👦</div>
            <p className="stat-number">500+</p>
            <p className="stat-label">familles abonnées</p>
          </div>
          <div className="stat-card">
            <div className="icon-circle icon-green" aria-hidden="true">🌱</div>
            <p className="stat-number">3T</p>
            <p className="stat-label">de déchets évités</p>
          </div>
          <div className="stat-card">
            <div className="icon-circle icon-blue" aria-hidden="true">⭐</div>
            <p className="stat-number">4.9/5</p>
            <p className="stat-label">note moyenne</p>
          </div>
        </div>
      </section> */}

      {/* ============================================================
          SECTION 5 — NOS VALEURS
      ============================================================ */}
      <section className="commitmentsSection" aria-labelledby="valeurs-title">
        <h2 className="homePageSubTitle" id="valeurs-title">Nos Valeurs</h2>
        <div className="commitmentCards">
          <CommitmentCard
            icon={LEAFIMAGE}
            title="Écologie"
            description="Chaque jouet loué est un jouet de moins fabriqué. Nous croyons en une consommation raisonnée, au service de la planète que vos enfants hériteront."
          />
          <CommitmentCard
            icon={APPROBATIONIMAGE}
            title="Qualité & Sécurité"
            description="Uniquement des jouets conformes aux normes CE, fabriqués dans des matériaux sûrs et durables — bois, textiles certifiés, zéro BPA."
          />
          <CommitmentCard
            icon={ZENIMAGE}
            title="Bienveillance"
            description="Chaque famille est unique. Nous adaptons nos recommandations à l'âge de votre enfant, avec toujours un service humain et à l'écoute."
          />
          <CommitmentCard
            icon={EUROIMAGE}
            title="Accessibilité"
            description="Le jeu de qualité ne devrait pas être un luxe. Notre abonnement permet à toutes les familles d'accéder à des jouets premium à prix raisonnable."
          />
        </div>
      </section>

      {/* ============================================================
          SECTION 5 — NOTRE MISSION
      ============================================================ */}
      <CardsContentMission />

      {/* ============================================================
          SECTION 6 — CTA
      ============================================================ */}
      <section className="footer-cta-section" aria-label="Rejoindre Bibli'O Jouets">
        <div className="container">
          <h2>Prêts à rejoindre l&apos;aventure Bibli&apos;O&nbsp;? 🎉</h2>
          <p>
            Rejoignez des centaines de familles qui ont choisi de jouer mieux,
            dépenser moins et consommer responsable.
          </p>
          <div className="about-cta-buttons">
            <ButtonRed text="Voir nos abonnements" href="/abonnements" />
            <ButtonYellow text="Découvrir le catalogue" href="/bibliotheque" />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7 — NEWSLETTER
      ============================================================ */}
      <Newsletter />

    </div>
  );
}
