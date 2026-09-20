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
        <p>Les présentes Conditions Générales de Vente et de Location (ci-après « CGV ») régissent les relations contractuelles entre la société Bibli'o Jouets et tout client particulier ou professionnel (ci-après « le Client ») souhaitant louer des articles, que ce soit via le site internet, par bon de commande papier signé sur le terrain, ou tout autre canal de vente. Les dispositions relatives au droit de la consommation (notamment le droit de rétractation) s'appliquent exclusivement aux clients particuliers (consommateurs). 
        </p>
        <p>Toute commande ou abonnement implique l’acceptation sans réserve des présentes CGV.</p>
      </section>

      {/* Article 2: Définition et durée de l'abonnement */}
      <section aria-labelledby="cgv-definition">
        <h2 id="cgv-definition">Article 2 - Définition et durée de l'abonnement</h2>
        <ul>
          <li>Bibli’o Jouets propose un service de location de jouets et d’articles de puériculture destiné aux familles âgées de 0 à plus de 99 ans.</li>
          <li>Le service fonctionne sous forme d’abonnement mensuel sans engagement ou box, selon les formules présentées sur le site. </li>
          <li>La formule débute à la date de paiement et reste active jusqu'à son échéance. </li>
          <li>Le client peut conserver les jeux tant que l’abonnement reste actif. Le changement de formule peut être effectué à tout moment depuis l’espace client.</li>
          <li>La résiliation s’effectue depuis l’espace client et prend effet à la réception des jouets, retour dans un délai de maximum 7 jours suivant la fin de l’abonnement. </li>
          <li>Toute période entamée reste due.</li>
          <li>Bibli’o Jouets se réserve le droit de résilier un abonnement en cas de non-respect des conditions de location ou de comportement frauduleux.</li>
          <li>Chaque jouet ou article loué reste la propriété exclusive de Bibli’o Jouets.</li>

        </ul>
      </section>

      {/* Article 3: Zone de service */}
      <section aria-labelledby="cgv-zone">
        <h2 id="cgv-zone">Article 3 - Zone de service</h2>
        <ul>
          <li><strong>Livraison locale en main propre :</strong> Saussan, Fabrègues, Pignan.</li>
          <li><strong>Livraison nationale :</strong> Uniquement via le réseau de points relais <strong>Mondial Relay</strong> sur tout le territoire de la France métropolitaine.</li>
        </ul>
      </section>

      {/* Article 4: Formules d'abonnement et tarifs */}
      <section aria-labelledby="cgv-tarifs">
        <h2 id="cgv-tarifs">Articles 4 - Formules d'abonnement et tarifs</h2>
        <p>Les formules d'abonnement sont détaillées sur le site et peuvent évoluer selon les besoins du service. Les tarifs indiqués sont en euros TTC et comprennent la location, le nettoyage, et le suivi qualité. Bibli'o Jouets se réserve le droit de modifier les tarifs à tout moment, mais les modifications ne s'appliqueront qu'aux abonnements futurs. Les tarifs d'abonnement incluent les frais de port. Toute demande de livraison à domicile (hors zone locale en main propre) fera l'objet d'une facturation supplémentaire selon les tarifs en vigueur sur le site. Les abonnements donnent droit à l'expédition d'un colis de format standard. Bibli'o Jouets se réserve le droit de limiter le choix des jouets ou de demander un supplément si la combinaison d'articles choisie par le client excède les gabarits logistiques standards (poids {'>'} 5kg ou dimensions hors normes).</p>
      </section>

      {/* Article 5: Modalités de commande et d'abonnement */}
      <section aria-labelledby="cgv-commande">
        <h2 id="cgv-commande">Articles 5 - Modalités de commande et d'abonnement</h2>
        <p>Pour les clients professionnels démarchés par un commercial, la commande est matérialisée par la signature d'un bon de commande papier ou digital couplé à la signature d'un mandat de prélèvement SEPA et la transmission d'un RIB.</p>
        <p>Le Client peut s'abonner directement en ligne sur le site. Toute souscription implique : </p>
        <ul>
          <li> L'acceptation des présentes CGV. </li>
          <li>L'enregistrement d'une carte bancaire valide, avec autorisation de prélèvement direct accordée à Bibli'o Jouets en cas de dégradation matérielle ou de non-restitution.</li>
          <li>Le paiement du premier mois d'abonnement.</li>
        </ul>
        <p>Les commandes sont passées depuis l'espace client. Les expéditions sont effectuées sous 24 à 48 heures ouvrées. Un bon de retour prépayé Mondial Relay est inclus dans le colis ou à retrouver sur son espace client. L'abonnement est mensuel, renouvelable automatiquement, sauf résiliation par le Client (voir article 11).</p>
      </section>

      {/* Article 6: Paiement */}
      <section aria-labelledby="cgv-paiement">
        <h2 id="cgv-paiement">Article 6 - Paiement</h2>
        <p>Les paiements sont effectués par <strong>Stripe</strong> via connexion sécurisée (3D Secure, SSL/TLS, norme PCI-DSS).</p>
        <p>En cas d’échec de prélèvement, Bibli’o Jouets se réserve le droit de suspendre ou résilier l’abonnement.</p>
        <p>Les jeux ni retournés, ni achetés seront facturés au prix d’achat déterminé selon leur état.</p>
        <p>Le montant de l'abonnement est prélevé à la date d'inscription, puis à chaque échéance mensuelle.</p>
        <p>Paiement par prélèvement SEPA (Clients Professionnels) : Le paiement des mensualités s'effectue par prélèvement automatique SEPA conformément au mandat signé par le Client. Tout incident de paiement ou rejet de prélèvement entraînera l'exigibilité immédiate des sommes dues, ainsi que l'application de pénalités de retard calculées au taux d'intérêt appliqué par la Banque Centrale Européenne (BCE) à son opération la plus récente majoré de 10 points de pourcentage. En application de l'article D441-5 du Code de commerce, tout retard de paiement entraînera également l'application d'une indemnité forfaitaire pour frais de recouvrement d'un montant de 40 €. En cas d'échec répété de prélèvement, Bibli'o Jouets se réserve le droit de suspendre ou résilier l'abonnement et de réclamer la restitution immédiate du matériel.</p>
      </section>
      {/* Article 6.1: Annulation et Frais de gestion  */}
      <section aria-labelledby="cgv-annulation">
        <h2 id="cgv-annulation">Article 6.1 - Annulation et Frais de gestion</h2>
        <p>En cas de demande de remboursement à titre commercial ou d'annulation par convenance personnelle du Client (hors exercice légitime du droit de rétractation), notamment suite à un oubli de résiliation ou à un défaut de retour des jouets dans les délais, un forfait de frais de dossier et de transaction de 5 € TTC sera déduit du montant remboursé. Ce forfait couvre les frais non restitués par la plateforme de paiement ainsi que la gestion administrative du dossier. </p>
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
        <p>Les jouets sont livrés en livraison locale (Saussan et environs) ou acheminés via le réseau national de points relais Mondial Relay. Le délai de retour des jouets est fixé à 7 jours après la fin de la période de location. Tout retard de restitution au-delà du délai de 7 jours entraînera automatiquement le renouvellement tacite de l'abonnement pour une durée d'un mois supplémentaire au tarif en vigueur, le Client conservant alors la jouissance des articles pour ladite période. </p>
      </section>

      {/* Article  8.1 Conditions de retour en cas d'achat  */}
      <section aria-labelledby="cgv-retour-achat">
        <h2 id="cgv-retour-achat">Article 8.1 - Conditions de retour en cas d'achat</h2>
      <p>Dans le cadre d’un achat définitif de jouet (hors location), les conditions de retour sont les suivantes :</p>
      <ul>
        <li><strong>Droit de rétractation :</strong> Conformément à la législation, le Client dispose d'un droit de rétractation de 14 jours à compter de la réception du produit pour retourner son achat sans justification.</li>
        <li><strong>État du produit :</strong> Le jouet doit être retourné complet, dans son emballage d'origine et dans un état permettant sa remise en vente.</li>
        <li><strong>Frais de retour :</strong>Les frais d'expédition pour le retour du produit sont à la charge exclusive du Client.</li>
        <li><strong>Remboursement :</strong>Après vérification de l'état du jouet par nos services, le remboursement sera effectué via le moyen de paiement utilisé lors de la commande initiale, déduction faite des frais de ports. </li>
        <li><strong>Exclusions : </strong>Tout article retourné incomplet, endommagé ou présentant des traces d'usure anormale ne pourra faire l'objet d'un remboursement.</li>
      </ul>
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
        <p>Le nettoyage standard (désinfection) est inclus. Cependant, si un jouet est restitué dans un état de saleté excessif nécessitant un nettoyage approfondi, Bibli'o Jouets se réserve le droit de facturer un forfait de remise en état de 5 € à 10 €, <strong>qui sera prélevé directement via le moyen de paiement enregistré par le Client.</strong></p>
      </section>

      {/* Article 11: Droit de rétractation */}
      <section aria-labelledby="cgv-retractation">
        <h2 id="cgv-retractation">Article 11 - Droit de rétractation</h2>
        <p>Le droit de rétractation de 14 jours (article L221-18 du Code de la consommation) est strictement réservé aux Clients particuliers (consommateurs). Il ne s'applique en aucun cas aux clients professionnels. Toute commande ou abonnement signé par un professionnel (sur le terrain ou en ligne) est ferme et définitif dès la signature du bon de commande.</p>
        <p>Conformément à l'article L. 221-18 du Code de la consommation, le Client particulier dispose d'un droit de rétractation de 14 jours à compter de la souscription. Si le Client demande l'exécution immédiate du service et la livraison des jouets avant la fin de ce délai, il conserve son droit de rétractation. Néanmoins, en application de l'article L. 221-25 du Code de la consommation, s'il exerce ce droit après avoir reçu les jouets, il devra :</p>
        <ul> 
        <li>1. Restituer les jouets à ses frais dans leur état d'origine sous 14 jours.</li>
        <li>S'acquitter auprès de Bibli'o Jouets d'un montant proportionnel au service fourni jusqu'à la notification de sa rétractation (calculé au prorata des jours d'utilisation).</li>  
        </ul>
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
        <p>En cas de litige avec un client professionnel, compétence exclusive est attribuée au Tribunal de Commerce de Montpellier, nonobstant pluralité de défendeurs ou appel en garantie.</p>    
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
          <li><strong>Détail de l’Offre :</strong> Pour toute nouvelle souscription à un abonnement (Toute formule), le Client bénéficie d’un mois d’abonnement offert pour un engagement minimal de deux mois.</li>
          <li><strong>Modalités de Paiement :</strong> Le Client règle le premier mois d’abonnement au tarif de la formule choisie lors de la commande. Le second mois est offert par Bibli’o Jouets.</li>
          <li><strong>Utilisation et Échange des Jouets :</strong> Dans le cadre de cette offre de lancement, le Client conserve les jouets reçus dans son premier colis pendant une durée continue de un mois. Le premier échange de jouets pourra être effectué à l'issue de ce mois. Par la suite, les échanges pourront s'effectuer mensuellement selon les modalités classiques de l'abonnement.</li>
          <li><strong>Flexibilité et Résiliation :</strong> L’abonnement est flexible. Le Client a la possibilité d’ajuster sa formule ou de résilier son abonnement à l'issue du premier mois payé, moyennant le respect des conditions de retour des jouets définies à l'Article 10.</li>
          <li><strong>Hygiène et Service :</strong> Cette offre inclut l'intégralité des services de qualité Bibli’o Jouets, notamment la désinfection rigoureuse des jouets et la fourniture des piles.</li>
          <li><strong>Validité :</strong> Offre valable du 01/01/2026 au 31/12/2026.</li>
        </ul>
      </section>

      {/* Article 17: Offres Commerciales 2 */}
      <section aria-labelledby="cgv-offres" className="offer-section">
        <h2 id="cgv-offres">Article 17 - Cartes Cadeaux et Codes Promos</h2>
        <p>Bibli'o Jouets propose à la vente des cartes cadeaux utilisables exclusivement sur le site www.bibliojouets.com pour la souscription d'abonnements ou de locations ponctuelles.</p>
        <ul>
          <li><strong>Validité:</strong>Les cartes cadeaux sont valables pour une durée de 12 mois à compter de leur date d'achat.</li>
          <li><strong>Conditions d'utilisation :</strong>Elles ne sont ni remboursables, même partiellement, ni échangeables contre des espèces</li>
          <li><strong>Perte ou vol :</strong>Bibli'o Jouets décline toute responsabilité en cas de perte, de vol ou de détérioration de la carte cadeau et ne procédera à aucun remplacement. *</li>
        </ul>
      <p><strong> *Rétractation :</strong> Conformément à la loi, le droit de rétractation de 14 jours s'applique uniquement à l'acheteur initial de la carte, à condition que celle-ci n'ait pas été utilisée avant la fin de ce délai. 
Bibli'o Jouets peut émettre des codes promotionnels ponctuellement. Sauf mention contraire, ces codes sont personnels, non cumulables avec d'autres offres en cours (notamment l'offre de lancement 1+1), valables une seule fois par foyer et limités à la durée et au périmètre (nombre de jouets) indiqués lors de l'émission du code.
 </p>
      </section>

            {/* Article 18: Organisation de Jeux-Concours*/}
      <section aria-labelledby="cgv-jeux-concours" className="concours-section">
                <h2 id="cgv-jeux-concours">Article 18 - Organisation de Jeux-Concours</h2>

      <p><strong>18.1. Objet :</strong>La société Bibli'o Jouets peut être amenée à organiser des jeux-concours sur ses réseaux sociaux (Instagram, Facebook, TikTok). Ces jeux sont gratuits et sans obligation d'achat.
</p>
      <p><strong>18.2. Modalités de participation :</strong> Les conditions de participation (dates, lots, modalités de désignation des gagnants) sont précisées sur le post de publication dudit concours. La participation implique l'acceptation pleine et entière du présent règlement et des conditions générales de location de Bibli'o Jouets.</p>
      <p><strong>18.3. Désignation des gagnants :</strong>Sauf mention contraire, les gagnants sont désignés par tirage au sort via une application tierce certifiée (type Comment Picker). Bibli'o Jouets se réserve le droit de vérifier que le gagnant remplit toutes les conditions de participation avant la remise du lot.</p>
      <p><strong>18.4. Nature des lots :</strong>Les lots consistant en des prestations de location (ex: 2 mois offerts) sont soumis aux mêmes règles que les locations classiques :</p>
      <ul>
        <li>Les jouets et articles restent la propriété exclusive de Bibli'o Jouets.</li>
        <li>Le gagnant s'engage à restituer le matériel au terme de la durée de dotation prévue.</li>
        <li>En cas de dégradation majeure ou de non-restitution, Bibli'o Jouets se réserve le droit d'engager des poursuites conformément à l'Article 10.</li>
      </ul>
      <p><strong>18.5. Responsabilité :</strong>Ces concours ne sont en aucun cas parrainés, administrés ou associés aux plateformes Meta (Facebook, Instagram) ou TikTok. La responsabilité de Bibli'o Jouets est limitée à la valeur du lot mis en jeu.</p>

    </section>
            {/* Article 19: Organisation de Jeux-Concours*/}
<section aria-labelledby="cgv-box-mystere" className="box-section">
                <h2 id="cgv-jeux-concours">Article 19 - Offres Ponctuelles "Box Mystère" </h2>
<p>Nature de l'offre : Bibli'o Jouets peut proposer, en complément des abonnements classiques, des offres de location ponctuelle sous forme de "Box Mystère".</p>
      <p>Tarification et Contenu : Le tarif de la Box est fixé à 24,90 € TTC et comprend la location de 4 jouets (et la livraison) dont la sélection est effectuée par Bibli'o Jouets en fonction de l'âge de l'enfant.</p>
      <p>Absence de Tacite Reconduction : Contrairement aux formules détaillées à l'Article 5, la Box Mystère est une commande ponctuelle qui ne donne pas lieu à un abonnement mensuel renouvelable automatiquement.</p>
      <p>Durée et Disponibilité : Cette offre est disponible uniquement durant les périodes indiquées sur le site internet. Bibli'o Jouets se réserve le droit de suspendre ou de prolonger cette offre à tout moment.</p>
        <p>Conditions de Retour : Les jouets doivent être retournés complets et en bon état dans un délai de 7 jours suivant la fin de la période de location définie lors de l'achat, sous peine des pénalités prévues à l'Article 8.</p>
   <p><strong>Application des CGV :</strong> Toutes les clauses relatives aux modalités de paiement et d'autorisation de prélèvement (Article 5), l'hygiène (Article 9) et la responsabilité du client (Article 10) s'appliquent intégralement à cette offre. </p>
    </section>

    {/* Article 20 - Prestations Événementielles et Formules Mariage */}
<section aria-labelledby="cgv-prestations" className="prestations-section-evenementielles-mariage">
<p><strong>20.1. Objet et Formules :</strong> Bibli'o Jouets propose des formules de location de matériel (jouets, jeux créatifs, décoration) destinées aux événements (mariages, fêtes de famille, événements d'entreprise). Les formules incluent la livraison, l'installation et le nettoyage (« Sérénité Hygiène ») dans la zone de Montpellier et ses alentours (10km autour de Montpellier). Hors de cette zone, un devis spécifique sera établi.</p>
<p><strong>20.2. Réservation et Paiement :</strong> La réservation devient ferme après validation du devis et versement d'un acompte de 50%. Le solde doit être réglé au plus tard 1 jours avant la date de l'événement.</p>
<p><strong>20.3. Annulation :</strong> En cas d'annulation par le Client à moins de 7 jours de l'événement, l'acompte reste acquis à Bibli'o Jouets. Conformément à l'article L.221-28 du Code de la consommation, ces prestations datées ne bénéficient pas du droit de rétractation.</p>
<p><strong>20.4. Installation et Accès :</strong> Le Client doit assurer l'accès aux locaux aux horaires convenus. En cas d'événement en extérieur, un emplacement abrité doit être mis à disposition en cas d'intempéries.</p>
<p><strong>20.5. Surveillance : </strong>La mise à disposition des jouets et espaces enfants ne constitue en aucun cas une prestation de garde ou de garderie. La surveillance des enfants reste sous la responsabilité exclusive des parents ou des responsables de l'événement.</p>
<p><strong>20.6. Application des CGV :</strong> Toutes les clauses relatives aux modalités de paiement et d'autorisation de prélèvement (Article 5), l'hygiène (Article 9) et la responsabilité du client (Article 10) s'appliquent intégralement à cette offre. </p>


</section>
      {/* Pied de page du document */}
      <footer className="cgv-footer">
        <p> Ces CGV sont valables à compter du 6 août 2026. Bibli’o Jouets se réserve le droit de les modifier à tout moment ; la version applicable est celle en vigueur à la date de la commande.</p>
        <p><em>Mis à jour le 17/09/2026</em></p>
      </footer>
    </div>
  );
}

export default Cgv;