import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../components/style/Cgv.css";

function Cgv() {
  return (
    <div className="cgv-page">
<Header />


    <div className="cgv-container">
      <h1>Conditions Générales de Vente et de Location</h1>
      <p className="preamble">Bibli’o Jouets – SASU</p>

      {/* Article 1: Mentions légales */}
      <section aria-labelledby="cgv-mentions">
        <h2 id="cgv-mentions">1. Mentions légales</h2>
        <dl className="info-list">
          <dt>Raison sociale</dt>
          <dd>Bibli’o Jouets</dd>
          <dt>Forme juridique</dt>
          <dd>SASU</dd>
          <dt>Représentant légal</dt>
          <dd>Laura Calvas</dd>
          <dt>Siège social</dt>
          <dd>1 avenue de l’Aurore, 34570 Saussan</dd>
          <dt>SIREN / SIRET</dt>
          <dd>en cours d’immatriculation</dd>
          <dt>Téléphone</dt>
          <dd><a href="tel:+33766070809">07 66 07 08 09</a></dd>
          <dt>E-mail</dt>
          <dd><a href="mailto:contact@bibliojouets.com">contact@bibliojouets.com</a></dd>
          <dt>Site internet</dt>
          <dd><a href="https://www.bibliojouets.com" target="_blank" rel="noopener noreferrer">www.bibliojouets.com</a></dd>
        </dl>
      </section>

      {/* Article 2: Objet */}
      <section aria-labelledby="cgv-objet">
        <h2 id="cgv-objet">2. Objet</h2>
        <p>Les présentes Conditions Générales de Vente et de Location (ci-après « CGV ») régissent les relations contractuelles entre la société Bibli’o Jouets et tout client particulier (ci-après « le Client ») souhaitant louer un ou plusieurs jouets ou articles de puériculture via le site internet ou tout autre canal de vente à distance géré par la société.</p>
        <p>Toute commande ou abonnement implique l’acceptation sans réserve des présentes CGV.</p>
      </section>

      {/* Article 3: Description du service */}
      <section aria-labelledby="cgv-service">
        <h2 id="cgv-service">3. Description du service</h2>
        {/* Une liste est plus sémantique ici que 3 paragraphes séparés */}
        <ul>
          <li>Bibli’o Jouets propose un service de location de jouets et d’articles de puériculture destiné aux familles ayant des enfants de 0 à 10 ans.</li>
          <li>Le service fonctionne sous forme d’abonnement mensuel sans engagement ou de locations ponctuelles, selon les formules présentées sur le site.</li>
          <li>Chaque jouet ou article loué reste la propriété exclusive de Bibli’o Jouets.</li>
        </ul>
      </section>

      {/* Article 4: Zone de service */}
      <section aria-labelledby="cgv-zone">
        <h2 id="cgv-zone">4. Zone de service</h2>
        <ul>
          <li><strong>Livraison locale :</strong> Saussan, Fabrègues, Pignan et communes voisines.</li>
          <li><strong>Livraison nationale :</strong> sur tout le territoire de la France métropolitaine via transporteur.</li>
          <li><strong>Points relais partenaires :</strong> selon disponibilité au moment de la commande.</li>
        </ul>
      </section>

      {/* Article 5: Formules et tarifs */}
      <section aria-labelledby="cgv-tarifs">
        <h2 id="cgv-tarifs">5. Formules et tarifs</h2>
        <p>Les formules d’abonnement sont détaillées sur le site et peuvent évoluer selon les besoins du service. Les tarifs indiqués sont en euros TTC et comprennent la location, le nettoyage, et le suivi qualité.</p>
        <p>Bibli’o Jouets se réserve le droit de modifier les tarifs à tout moment, mais les modifications ne s’appliqueront qu’aux abonnements futurs.</p>
      </section>

      {/* Article 6: Modalités de commande et d’abonnement */}
      <section aria-labelledby="cgv-commande">
        <h2 id="cgv-commande">6. Modalités de commande et d’abonnement</h2>
        <p>Le Client peut s’abonner directement en ligne sur le site. Toute souscription implique :</p>
        <ul>
          <li>l’acceptation des présentes CGV,</li>
          <li>la fourniture d’une empreinte bancaire (ou chèque non encaissé) à titre de caution,</li>
          <li>le paiement du premier mois d’abonnement.</li>
        </ul>
        <p>L’abonnement est mensuel, renouvelable automatiquement, sauf résiliation par le Client (voir article 11).</p>
      </section>

      {/* Article 7: Paiement */}
      <section aria-labelledby="cgv-paiement">
        <h2 id="cgv-paiement">7. Paiement</h2>
        <p>Les paiements sont effectués :</p>
        <ul>
          <li>par carte bancaire (via un prestataire sécurisé) ou</li>
          <li>via PayPal.</li>
        </ul>
        <p>Le montant de l’abonnement est prélevé à la date d’inscription, puis à chaque échéance mensuelle. En cas d’incident de paiement, Bibli’o Jouets se réserve le droit de suspendre le compte du Client jusqu’à régularisation.</p>
      </section>

      {/* Article 8: Caution */}
      <section aria-labelledby="cgv-caution">
        <h2 id="cgv-caution">8. Caution</h2>
        <p>Une empreinte de carte bancaire non débitée ou un chèque non encaissé est exigé avant toute location. Cette caution sert à couvrir d’éventuels dommages, pertes ou retards de restitution.</p>
        <p>En cas d’anomalie, une retenue pouvant aller jusqu’à 50 % de la valeur du jouet pourra être effectuée après évaluation par Bibli’o Jouets.</p>
      </section>

      {/* Article 9: Livraison, retrait et retours */}
      <section aria-labelledby="cgv-livraison">
        <h2 id="cgv-livraison">9. Livraison, retrait et retours</h2>
        <p>Les jouets sont livrés :</p>
        <ul>
          <li>en livraison locale (Saussan et environs),</li>
          <li>via transporteur national, ou</li>
          <li>retirés dans un point relais partenaire.</li>
        </ul>
        <p>Le délai de retour des jouets est fixé à 3 jours après la fin de la période de location. Les jouets doivent être restitués complets et en bon état.</p>
      </section>

      {/* Article 10: Hygiène et sécurité */}
      <section aria-labelledby="cgv-hygiene">
        <h2 id="cgv-hygiene">10. Hygiène et sécurité</h2>
        <p>Chaque jouet est nettoyé, désinfecté et vérifié avant d’être remis en circulation. Bibli’o Jouets s’engage à respecter un protocole rigoureux garantissant la sécurité et la propreté des produits loués.</p>
        <p>Tous les jouets proposés sont conformes aux normes européennes CE.</p>
      </section>

      {/* Article 11: Résiliation de l’abonnement */}
      <section aria-labelledby="cgv-resiliation">
        <h2 id="cgv-resiliation">11. Résiliation de l’abonnement</h2>
        <p>Le Client peut résilier à tout moment son abonnement depuis son espace client ou par e-mail à <a href="mailto:contact@bibliojouets.com">contact@bibliojouets.com</a>, avant la date de renouvellement mensuel.</p>
        <p>Toute période entamée reste due.</p>
        <p>Bibli’o Jouets se réserve le droit de résilier un abonnement en cas de non-respect des conditions de location ou de comportement frauduleux.</p>
      </section>

      {/* Article 12: Responsabilité du client */}
      <section aria-labelledby="cgv-responsabilite">
        <h2 id="cgv-responsabilite">12. Responsabilité du client</h2>
        <p>Le Client s’engage à :</p>
        <ul>
          <li>utiliser les jouets selon leur usage normal et sous surveillance d’un adulte,</li>
          <li>signaler toute casse, perte ou défaut constaté,</li>
          <li>restituer les jouets complets et propres.</li>
        </ul>
        <p>En cas de casse, perte ou détérioration anormale, Bibli’o Jouets se réserve le droit de retenir jusqu’à 50 % de la valeur estimée du jouet sur la caution.</p>
      </section>

      {/* Article 13: Droit de rétractation */}
      <section aria-labelledby="cgv-retractation">
        <h2 id="cgv-retractation">13. Droit de rétractation</h2>
        <p>Conformément à l’article L221-18 du Code de la consommation, le Client dispose d’un droit de rétractation de 14 jours à compter de la souscription en ligne, tant que la première livraison n’a pas eu lieu.</p>
        <p>Dès que les jouets ont été remis au Client, le contrat est réputé exécuté et le droit de rétractation ne s’applique plus.</p>
      </section>

      {/* Article 14: Données personnelles (RGPD) */}
      <section aria-labelledby="cgv-rgpd">
        <h2 id="cgv-rgpd">14. Données personnelles (RGPD)</h2>
        <p>Les informations collectées sont nécessaires à la gestion des abonnements et livraisons. Elles sont traitées par Bibli’o Jouets et ne sont jamais revendues.</p>
        <p>Le Client dispose d’un droit d’accès, de rectification et de suppression de ses données (article 15 à 22 du RGPD) en écrivant à : <a href="mailto:contact@bibliojouets.com">contact@bibliojouets.com</a>.</p>
      </section>

      {/* Article 15: Force majeure */}
      <section aria-labelledby="cgv-force-majeure">
        <h2 id="cgv-force-majeure">15. Force majeure</h2>
        <p>Bibli’o Jouets ne saurait être tenue responsable en cas de retard ou d’inexécution liés à un événement de force majeure (catastrophe naturelle, grève, panne logistique, etc.).</p>
      </section>

      {/* Article 16: Litiges et droit applicable */}
      <section aria-labelledby="cgv-litiges">
        <h2 id="cgv-litiges">16. Litiges et droit applicable</h2>
        <p>Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité.</p>
        <p>À défaut d’accord, le litige pourra être porté devant le tribunal compétent du ressort de Montpellier, ou tout autre tribunal désigné selon la législation en vigueur.</p>
      </section>

      {/* Article 17: Acceptation */}
      <section aria-labelledby="cgv-acceptation">
        <h2 id="cgv-acceptation">17. Acceptation</h2>
        <p>En validant son abonnement ou sa commande, le Client reconnaît avoir pris connaissance et accepté sans réserve les présentes Conditions Générales de Vente et de Location.</p>
      </section>

      {/* Pied de page du document */}
      <footer className="cgv-footer">
        <p>Ces CGV sont valables à compter du 7 octobre 2025. Bibli’o Jouets se réserve le droit de les modifier à tout moment ; la version applicable est celle en vigueur à la date de la commande.</p>
      </footer>
    </div>
<Footer />
        </div>
  );
}

export default Cgv;