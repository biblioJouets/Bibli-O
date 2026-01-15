import "@/styles/Cgv.css";

function Cgv() {
  return (
    <div className="cgv-container">
      <h1>CONDITIONS GÉNÉRALES DE VENTE ET DE LOCATION</h1>
      <p className="preamble">Bibli’o Jouets – SASU</p>

      {/* Article 1: Mentions légales */}
      <section aria-labelledby="cgv-mentions">
        <h2 id="cgv-mentions">Article 1 - Mentions légales</h2>
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
          <dd>992 548 891 00017</dd>
          <dt>Téléphone</dt>
          <dd><a href="tel:+33636258718">06 36 25 87 18</a></dd>
          <dt>E-mail</dt>
          <dd><a href="mailto:contact@bibliojouets.com">contact@bibliojouets.com</a></dd>
          <dt>Site internet</dt>
          <dd><a href="https://www.bibliojouets.fr" target="_blank" rel="noopener noreferrer">www.bibliojouets.fr</a></dd>
        </dl>
        <p>Les présentes Conditions Générales de Vente et de Location (ci-après « CGV ») régissent les relations contractuelles entre la société Bibli’o Jouets et tout client particulier (ci-après « le Client ») souhaitant louer un ou plusieurs jouets ou articles de puériculture via le site internet ou tout autre canal de vente à distance géré par la société.</p>
        <p>Toute commande ou abonnement implique l’acceptation sans réserve des présentes CGV.</p>
      </section>

      {/* Article 2: Définition et durée de l'abonnement */}
      <section aria-labelledby="cgv-definition">
        <h2 id="cgv-definition">Article 2 - Définition et durée de l'abonnement</h2>
        <ul>
          <li>Bibli’o Jouets propose un service de location de jouets et d'articles de puériculture destiné aux familles ayant des enfants de 0 à 10 ans.</li>
          <li>Le service fonctionne sous forme d'abonnement mensuel sans engagement ou de locations ponctuelles, selon les formules présentées sur le site.</li>
          <li>La formule débute à la date de paiement et reste active jusqu'à son échéance. Le client peut conserver les jeux tant que l'abonnement reste actif.</li>
          <li>Le changement de formule peut être effectué à tout moment depuis l'espace client.</li>
          <li>La résiliation s'effectue depuis l'espace client et prend effet à la réception des jouets, retour dans un délai de maximum <strong>7 jours</strong> suivant la fin de l'abonnement. Toute période entamée reste due.</li>
          <li>Bibli’o Jouets se réserve le droit de résilier un abonnement en cas de non-respect des conditions de location ou de comportement frauduleux.</li>
          <li>Chaque jouet ou article loué reste la propriété exclusive de Bibli’o Jouets.</li>
        </ul>
      </section>

      {/* Article 3: Zone de service */}
      <section aria-labelledby="cgv-zone">
        <h2 id="cgv-zone">Article 3 - Zone de service</h2>
        <ul>
          <li><strong>Livraison locale en main propre :</strong> Saussan, Fabrègues, Pignan.</li>
          <li><strong>Livraison nationale :</strong> sur tout le territoire de la France métropolitaine via transporteur.</li>
          <li><strong>Points relais partenaires :</strong> selon disponibilité au moment de la commande.</li>
        </ul>
      </section>

      {/* Article 4: Formules d'abonnement et tarifs */}
      <section aria-labelledby="cgv-tarifs">
        <h2 id="cgv-tarifs">Articles 4 - Formules d'abonnement et tarifs</h2>
        <p>Les formules d'abonnement sont détaillées sur le site et peuvent évoluer selon les besoins du service. Les tarifs indiqués sont en euros TTC et comprennent la location, le nettoyage, et le suivi qualité.</p>
        <p>Bibli’o Jouets se réserve le droit de modifier les tarifs à tout moment, mais les modifications ne s'appliqueront qu'aux abonnements futurs.</p>
        <p><strong>Frais de port :</strong> Les tarifs d'abonnement incluent les frais de port uniquement pour une livraison en Locker ou Point Relais. Toute demande de livraison à domicile fera l'objet d'une facturation supplémentaire selon les tarifs en vigueur sur le site.</p>
        <p><strong>Limites :</strong> Les abonnements donnent droit à l'expédition d'un colis de format standard. Bibli’o Jouets se réserve le droit de limiter le choix des jouets ou de demander un supplément si la combinaison d'articles choisie par le client excède les gabarits logistiques standards (poids {'>'} 10kg ou dimensions hors normes).</p>
      </section>

      {/* Article 5: Modalités de commande et d'abonnement */}
      <section aria-labelledby="cgv-commande">
        <h2 id="cgv-commande">Articles 5 - Modalités de commande et d'abonnement</h2>
        <p>Le Client peut s'abonner directement en ligne sur le site. Toute souscription implique :</p>
        <ul>
          <li>l'acceptation des présentes CGV,</li>
          <li>la fourniture d'une empreinte bancaire (ou chèque non encaissé) à titre de caution,</li>
          <li>le paiement du premier mois d'abonnement.</li>
        </ul>
        <p>Les commandes sont passées depuis l'espace client. Les expéditions sont effectuées sous 24 à 48 heures ouvrées.</p>
        <p>Un bon de retour prépayé est inclus dans le colis ou à retrouver par mail sous demande.</p>
        <p>L'abonnement est mensuel, renouvelable automatiquement, sauf résiliation par le Client (voir article 11).</p>
      </section>

      {/* Article 6: Paiement */}
      <section aria-labelledby="cgv-paiement">
        <h2 id="cgv-paiement">Article 6 - Paiement</h2>
        <p>Les paiements sont effectués par <strong>Stripe</strong> via connexion sécurisée (3D Secure, SSL/TLS, norme PCI-DSS).</p>
        <p>En cas d'échec de prélèvement, Bibli’o Jouets se réserve le droit de suspendre ou résilier l'abonnement.</p>
        <p>Les jeux ni retournés, ni achetés seront facturés au prix d'achat déterminé selon leur état.</p>
        <p>Le montant de l'abonnement est prélevé à la date d'inscription, puis à chaque échéance mensuelle.</p>
      </section>

      {/* Article 7: Responsabilité et garantie */}
      <section aria-labelledby="cgv-garantie">
        <h2 id="cgv-garantie">Article 7 - Responsabilité et garantie</h2>
        <p>Les articles bénéficient des garanties légales de conformité. L'usure normale est couverte, seuls les dommages résultant d'une utilisation anormale peuvent donner suite à la facturation, pouvant aller jusqu'à 100% de la valeur du jouet.</p>
        <p><strong>Intelligence Artificielle :</strong> Certains visuels illustrant les jouets sur le site peuvent être générés ou retouchés par Intelligence Artificielle. Ces images sont fournies à titre indicatif et ne sont pas contractuelles ; seul le descriptif textuel du jouet fait foi.</p>
      </section>

      {/* Article 8: Livraison et retours */}
      <section aria-labelledby="cgv-livraison">
        <h2 id="cgv-livraison">Article 8 - Livraison et retours</h2>
        <p>Les jouets sont livrés :</p>
        <ul>
          <li>en livraison locale (Saussan et environs),</li>
          <li>via transporteur national, ou</li>
          <li>retirés dans un point relais partenaire.</li>
        </ul>
        <p>Le délai de retour des jouets est fixé à <strong>7 jours</strong> après la fin de la période de location.</p>
        <p>Les jouets doivent être restitués complets et en bon état.</p>
        <p><strong>Retard :</strong> Tout retard de restitution au-delà de 7 jours entraînera automatiquement le prélèvement d'une mensualité d'abonnement supplémentaire, sans pour autant prolonger le contrat de location.</p>
      </section>

      {/* Article 9: Hygiène et sécurité */}
      <section aria-labelledby="cgv-hygiene">
        <h2 id="cgv-hygiene">Article 9 - Hygiène et sécurité</h2>
        <p>Chaque jouet est nettoyé, désinfecté et vérifié avant d'être remis en circulation. Bibli’o Jouets s'engage à respecter un protocole rigoureux garantissant la sécurité et la propreté des produits loués.</p>
        <p>Tous les jouets proposés sont conformes aux normes européennes CE.</p>
      </section>

      {/* Article 10: Responsabilité du client */}
      <section aria-labelledby="cgv-responsabilite">
        <h2 id="cgv-responsabilite">Article 10 - Responsabilité du client</h2>
        <p>Le Client s'engage à :</p>
        <ul>
          <li>utiliser les jouets selon leur usage normal et sous surveillance d'un adulte,</li>
          <li>signaler toute casse, perte ou défaut constaté,</li>
          <li>restituer les jouets complets et propres.</li>
        </ul>
        <p><strong>Nettoyage :</strong> Le nettoyage standard (désinfection) est inclus. Cependant, si un jouet est restitué dans un état de saleté excessif nécessitant un nettoyage approfondi, Bibli’o Jouets se réserve le droit de facturer un forfait de remise en état de <strong>5 € à 10 €</strong> prélevé directement sur la caution ou via le moyen de paiement enregistré.</p>
      </section>

      {/* Article 11: Droit de rétractation */}
      <section aria-labelledby="cgv-retractation">
        <h2 id="cgv-retractation">Article 11 - Droit de rétractation</h2>
        <p>Conformément à l'article L221-18 du Code de la consommation, le Client dispose d'un droit de rétractation de 14 jours à compter de la souscription en ligne, tant que la première livraison n'a pas eu lieu.</p>
        <p>Dès que les jouets ont été remis au Client, le contrat est réputé exécuté et le droit de rétractation ne s'applique plus.</p>
      </section>

      {/* Article 12: Données personnelles (RGPD) */}
      <section aria-labelledby="cgv-rgpd">
        <h2 id="cgv-rgpd">Article 12 - Données personnelles (RGPD)</h2>
        <p>Les informations collectées sont nécessaires à la gestion des abonnements et livraisons. Elles sont traitées par Bibli’o Jouets et ne sont jamais revendues.</p>
        <p>Le Client dispose d'un droit d'accès, de rectification et de suppression de ses données (article 15 à 22 du RGPD) en écrivant à : <a href="mailto:contact@bibliojouets.com">contact@bibliojouets.com</a>.</p>
        <p>Les données sont conservées pendant toute la durée de l'abonnement, puis pendant 3 ans à des fins de prospection, et 10 ans pour les pièces comptables (factures).</p>
      </section>

      {/* Article 13: Force majeure */}
      <section aria-labelledby="cgv-force-majeure">
        <h2 id="cgv-force-majeure">Article 13 - Force majeure</h2>
        <p>Bibli’o Jouets ne saurait être tenue responsable en cas de retard ou d'inexécution liés à un événement de force majeure (catastrophe naturelle, grève, panne logistique, etc.).</p>
      </section>

      {/* Article 14: Litiges et droit applicable */}
      <section aria-labelledby="cgv-litiges">
        <h2 id="cgv-litiges">Article 14 - Litiges et droit applicable</h2>
        <p>Les présentes CGV sont soumises au droit français. En cas de litige, le client doit contacter le service client et une solution amiable sera recherchée en priorité.</p>
        <p>À défaut d'accord, le litige pourra être porté devant le tribunal compétent du ressort de Montpellier, ou tout autre tribunal désigné selon la législation en vigueur.</p>
        <p>Conformément aux articles L.612-1 et suivants du Code de la consommation, le Client a le droit de recourir gratuitement à un médiateur de la consommation. <strong>CM2C</strong> peut être saisi via <a href="https://www.cm2c.net/" target="_blank" rel="noopener noreferrer">https://www.cm2c.net/</a>.</p>
      </section>

      {/* Article 15: Acceptation */}
      <section aria-labelledby="cgv-acceptation">
        <h2 id="cgv-acceptation">Article 15 - Acceptation</h2>
        <p>En validant son abonnement ou sa commande, le Client reconnaît avoir pris connaissance et accepté sans réserve les présentes Conditions Générales de Vente et de Location.</p>
      </section>

      {/* Article 16: Offres Commerciales */}
      <section aria-labelledby="cgv-offres" className="offer-section">
        <h2 id="cgv-offres">Article 16 - Offres Commerciales</h2>
        <p>Dans le cadre de son lancement, Bibli’o Jouets propose une offre promotionnelle soumise aux conditions suivantes :</p>
        <ul>
          <li><strong>Détail de l’Offre :</strong> Pour toute nouvelle souscription à un abonnement (formules Découverte, Standard ou Premium), le Client bénéficie d'un mois d'abonnement offert pour un engagement minimal de deux mois.</li>
          <li><strong>Modalités de Paiement :</strong> Le Client règle le premier mois d'abonnement au tarif de la formule choisie lors de la commande. Le second mois est offert par Bibli’o Jouets.</li>
          <li><strong>Utilisation et Échange des Jouets :</strong> Dans le cadre de cette offre de lancement, le Client conserve les jouets reçus dans son premier colis pendant une durée continue de deux mois. Le premier échange de jouets pourra être effectué à l'issue de ces deux mois. Par la suite, les échanges pourront s'effectuer mensuellement selon les modalités classiques de l'abonnement.</li>
          <li><strong>Flexibilité et Résiliation :</strong> L'abonnement est flexible. Le Client a la possibilité d'ajuster sa formule ou de résilier son abonnement à l'issue du premier mois payé, moyennant le respect des conditions de retour des jouets définies à l'Article 10.</li>
          <li><strong>Hygiène et Service :</strong> Cette offre inclut l'intégralité des services de qualité Bibli’o Jouets, notamment la désinfection rigoureuse des jouets et la fourniture des piles.</li>
          <li><strong>Validité :</strong> Offre valable du 01/01/2026 au 31/01/2026.</li>
        </ul>
      </section>

      {/* Pied de page du document */}
      <footer className="cgv-footer">
        <p>Ces CGV sont valables à compter du 19 décembre 2025. Bibli’o Jouets se réserve le droit de les modifier à tout moment ; la version applicable est celle en vigueur à la date de la commande.</p>
        <p><em>Mis à jour le 04/01/2026</em></p>
      </footer>
    </div>
  );
}

export default Cgv;