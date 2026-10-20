import GiftCardForm from "../../../components/GiftCardForm";
import "@/styles/gift-card.css";

export const metadata = {
  title: "Carte Cadeau Location de Jouets Éco-responsable | Bibli'o Jouets",
  description:
    "Offrez le cadeau idéal pour les enfants de 0 à 10 ans : la carte cadeau Bibli'o Jouets. Montant libre dès 10 €, abonnement sans engagement, écologique et zéro encombrement. Louez, Jouez, Échangez !",
  keywords: [
    "carte cadeau jouets",
    "location de jouets par abonnement",
    "cadeau naissance éco-responsable",
    "cadeau anniversaire enfant écologique",
    "Bibli'o Jouets",
    "jouets sans engagement",
  ],
};

export default function CarteCadeauPage() {
  return (
    <main className="gift-page">
      <div className="gift-page__inner">
        
        {/* HERO SECTION */}
        <section className="gift-hero">
          <div className="gift-hero__blob gift-hero__blob--yellow" aria-hidden="true" />
          <div className="gift-hero__blob gift-hero__blob--pink" aria-hidden="true" />
          
          <div className="gift-hero__content">
            <span className="gift-badge">🎁 Le cadeau qui fait grandir sans encombrer</span>
            <h1>Offrez des heures d&apos;éveil et de jeu avec la Carte Cadeau Bibli&apos;o Jouets</h1>
            <p className="gift-hero__subtitle">
              Fini les jouets en plastique qui s&apos;accumulent au fond du placard ! Offrez aux
              parents et aux enfants de <strong>0 à 10 ans</strong> la liberté de choisir parmi des
              centaines de jeux adaptés à chaque étape de leur développement.{" "}
              <strong>Louez, Jouez, Échangez !</strong>
            </p>
            <div className="gift-hero__pills">
              <span className="gift-pill gift-pill--green">🌱 100% Éco-responsable</span>
              <span className="gift-pill gift-pill--blue">💶 Dès 10 € (Montant libre)</span>
              <span className="gift-pill gift-pill--yellow">✨ Hygiène certifiée</span>
            </div>
          </div>
        </section>

        {/* SECTION ACHAT (Formulaire + Réassurance visuelle) */}
        <section className="gift-buy-section" aria-labelledby="buy-section-title">
          <div className="gift-buy-grid">
            <div className="gift-buy-form-wrapper">
              <GiftCardForm />
            </div>

            <aside className="gift-buy-aside">
              <div className="gift-trust-card">
                <h2>Ce que vous offrez vraiment ✨</h2>
                <ul className="gift-trust-list">
                  <li>
                    <span className="gift-trust-icon" style={{ background: "#DFF1F9" }}>🔓</span>
                    <div>
                      <strong>Zéro engagement</strong>
                      <p>Les parents utilisent leur solde à leur rythme et gardent les jouets aussi longtemps qu&apos;ils le souhaitent.</p>
                    </div>
                  </li>
                  <li>
                    <span className="gift-trust-icon" style={{ background: "#DAEEE6" }}>🧼</span>
                    <div>
                      <strong>Propreté irréprochable</strong>
                      <p>Chaque jouet est minutieusement nettoyé, désinfecté et contrôlé selon notre protocole d&apos;hygiène strict.</p>
                    </div>
                  </li>
                  <li>
                    <span className="gift-trust-icon" style={{ background: "#FFF7D4" }}>⚡</span>
                    <div>
                      <strong>Envoi immédiat ou personnalisé</strong>
                      <p>Envoyez la carte directement par e-mail au bénéficiaire avec votre petit mot doux, ou recevez-la sur votre boîte mail.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="gift-occasion-card">
                <h3>Parfait pour toutes les occasions 🎈</h3>
                <p>
                  Liste de naissance, premier anniversaire, Noël, baptême ou cadeau groupé entre amis...
                  C&apos;est la surprise utile qui soulage le quotidien des jeunes parents !
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* SECTION : POURQUOI OFFRIR UNE CARTE CADEAU ? */}
        <section className="gift-benefits" aria-labelledby="benefits-title">
          <div className="gift-section-header">
            <span className="gift-section-tag">Pourquoi choisir Bibli&apos;o Jouets ?</span>
            <h2 id="benefits-title">Un cadeau plein de sens pour les enfants et la planète</h2>
            <p>
              Un enfant se lasse en moyenne d&apos;un jouet au bout de quelques semaines. Avec la
              location par abonnement, le plaisir se renouvelle sans cesse !
            </p>
          </div>

          <div className="gift-benefits-grid">
            <article className="gift-benefit-card gift-benefit-card--blue">
              <div className="gift-benefit-icon">💶</div>
              <h3>Montant 100% libre et flexible</h3>
              <p>
                À partir de 10 €, choisissez l&apos;un de nos paliers ou saisissez le montant exact
                qui correspond à votre budget. Le crédit s&apos;adapte à toutes nos formules.
              </p>
            </article>

            <article className="gift-benefit-card gift-benefit-card--green">
              <div className="gift-benefit-icon">🌍</div>
              <h3>Un geste fort pour l&apos;écologie</h3>
              <p>
                En privilégiant l&apos;économie circulaire et le partage, vous réduisez la
                surproduction de plastique et sensibilisez les plus petits au respect de l&apos;environnement.
              </p>
            </article>

            <article className="gift-benefit-card gift-benefit-card--yellow">
              <div className="gift-benefit-icon">🏠</div>
              <h3>Fini les jouets qui s&apos;entassent !</h3>
              <p>
                Le rêve de tous les parents : une chambre rangée et aérée ! Quand l&apos;enfant a
                grandi ou ne joue plus avec un article, il suffit de l&apos;échanger contre de nouvelles découvertes.
              </p>
            </article>

            <article className="gift-benefit-card gift-benefit-card--pink">
              <div className="gift-benefit-icon">🧸</div>
              <h3>Plaisir garanti de 0 à 10 ans</h3>
              <p>
                Jeux d&apos;éveil sensoriel, motricité, jeux de construction ou jeux de société :
                les parents sélectionnent eux-mêmes ce qui correspond exactement à l&apos;âge de leur enfant.
              </p>
            </article>
          </div>
        </section>

        {/* SECTION : COMMENT ÇA MARCHE ? */}
        <section className="gift-steps" aria-labelledby="steps-title">
          <div className="gift-section-header">
            <span className="gift-section-tag">Simple & Rapide</span>
            <h2 id="steps-title">Comment fonctionne la carte cadeau ?</h2>
            <p>Offrir de la magie n&apos;a jamais été aussi simple, en 3 petites étapes :</p>
          </div>

          <div className="gift-steps-grid">
            <div className="gift-step-card">
              <span className="gift-step-number">1</span>
              <h3>Personnalisez votre carte</h3>
              <p>
                Choisissez le montant de votre choix (dès 10 €), ajoutez un message personnalisé et
                indiquez si vous souhaitez l&apos;envoyer directement par e-mail aux heureux parents.
              </p>
            </div>

            <div className="gift-step-card">
              <span className="gift-step-number">2</span>
              <h3>Réception du code unique</h3>
              <p>
                Dès la validation de votre commande, le code cadeau est généré et envoyé avec votre
                petit mot doux, prêt à être utilisé sur toute notre boutique en ligne.
              </p>
            </div>

            <div className="gift-step-card">
              <span className="gift-step-number">3</span>
              <h3>Louez, Jouez, Échangez !</h3>
              <p>
                La famille active sa carte sur Bibli&apos;o Jouets, compose sa sélection de jouets
                et récupère son colis en Point Relais (partout en France) ou à domicile (Saussan et alentours).
              </p>
            </div>
          </div>
        </section>

        {/* SECTION : FAQ SEO */}
        <section className="gift-faq" aria-labelledby="faq-title">
          <h2 id="faq-title">Questions fréquentes sur la carte cadeau</h2>
          <div className="gift-faq-grid">
            <div className="gift-faq-item">
              <h3>Quel montant conseiller pour débuter ?</h3>
              <p>
                Dès 20 € ou 30 €, vous permettez aux parents de découvrir le service en toute liberté.
                Avec 50 € ou 100 €, vous leur offrez plusieurs mois d&apos;abonnement et de renouvellement de jouets !
              </p>
            </div>
            <div className="gift-faq-item">
              <h3>Les parents ont-ils un engagement de durée ?</h3>
              <p>
                Aucun ! Nos abonnements sont 100 % flexibles et sans engagement. Les familles gardent
                les jouets aussi longtemps qu&apos;elles le souhaitent.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}