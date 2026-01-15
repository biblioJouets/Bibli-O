import React from "react";

import "@/styles/Cgu.css";

function Cgu() {
  return (
    <div className="cgu-container">
      <h1>Conditions Générales d’Utilisation (CGU)</h1>
      <p className="preamble">Bibli’o Jouets</p>
      <p className="last-updated">Dernière mise à jour : 19/12/2025</p>

      {/* Article 1: Objet */}
      <section aria-labelledby="cgu-objet">
        <h2 id="cgu-objet">1. Objet</h2>
        <p>
          Les présentes Conditions Générales d’Utilisation (ci-après « CGU »)
          ont pour objet de définir les modalités et conditions d’accès et
          d’utilisation du site Bibli’o Jouets (ci-après « le Site »),
          accessible à l’adresse{" "}
          <a
            href="https://www.bibliojouets.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.bibliojouets.fr
          </a>
          . Le site est exploité par Bibli’o Jouets, Société par Actions
          Simplifiée Unipersonnelle (SASU), représentée par Laura Calvas.
        </p>
        <p>
          Le Site permet aux utilisateurs (ci-après « les Utilisateurs » ou « le
          Client ») de souscrire à un service d’abonnement de location de
          jouets et articles de puériculture.
        </p>
        <p>
          En accédant au Site et en utilisant les services proposés,
          l’Utilisateur reconnaît avoir lu, compris et accepté sans réserve les
          présentes CGU.
        </p>
      </section>

      {/* Article 2: Acceptation des CGV */}
      <section aria-labelledby="cgu-acceptation-cgv">
        <h2 id="cgu-acceptation-cgv">
          2. Acceptation des Conditions Générales de Vente (CGV)
        </h2>
        <p>
          Toute souscription d’un abonnement sur le Site implique l’acceptation
          sans réserve des Conditions Générales de Vente (CGV) de Bibli’o
          Jouets, disponibles sur la{" "}
          {/* Si vous utilisez react-router, remplacez <a> par <Link> */}
          <a href="/conditions-generales-de-vente">page dédiée</a>.
        </p>
      </section>

      {/* Article 3: Acceptation des CGU */}
      <section aria-labelledby="cgu-acceptation-cgu">
        <h2 id="cgu-acceptation-cgu">3. Acceptation des CGU</h2>
        <p>
          L’accès et l’utilisation du Site impliquent l’acceptation pleine et
          entière des présentes CGU. En cas de désaccord avec tout ou partie de
          ces conditions, l’Utilisateur doit cesser d’utiliser les services de
          Bibli’o Jouets.
        </p>
        <p>
          Bibli’o Jouets se réserve le droit de modifier ou d’actualiser les
          CGU à tout moment. Les nouvelles dispositions prendront effet à
          compter de leur publication sur le Site.
        </p>
      </section>

      {/* Article 4: Description du service */}
      <section aria-labelledby="cgu-service">
        <h2 id="cgu-service">4. Description du service</h2>
        <p>
          Bibli’o Jouets propose un service d’abonnement mensuel permettant aux
          familles d’emprunter des jouets et articles de puériculture pour une
          durée déterminée.
        </p>
        <p>Chaque formule d’abonnement précise :</p>
        <ul>
          <li>Le nombre de jouets inclus,</li>
          <li>Le tarif mensuel,</li>
          <li>Les modalités de retrait et de retour,</li>
          <li>Les conditions de dépôt de garantie.</li>
        </ul>
        <p>
          Les jouets sont nettoyés, désinfectés et vérifiés avant chaque
          nouvelle mise à disposition. Le service est disponible en ligne via
          le Site, avec retrait en point relais, livraison locale ou en
          boutique (selon zone de couverture).
        </p>
      </section>

      {/* Article 5: Accès au Site et création de compte */}
      <section aria-labelledby="cgu-acces">
        <h2 id="cgu-acces">5. Accès au Site et création de compte</h2>
        <p>
          L’accès au Site est libre pour toute personne majeure. Pour utiliser
          le service d’abonnement, l’Utilisateur doit créer un compte
          personnel, fournir des informations exactes et tenir celles-ci à
          jour.
        </p>
        <p>
          Chaque compte est strictement personnel ; l’Utilisateur est
          responsable de la confidentialité de ses identifiants et de toute
          activité réalisée depuis son compte. Bibli’o Jouets ne pourra être
          tenue responsable en cas d’utilisation frauduleuse du compte par un
          tiers.
        </p>
      </section>

      {/* Article 6: Conditions d’abonnement et de location */}
      <section aria-labelledby="cgu-abonnement">
        <h2 id="cgu-abonnement">6. Conditions d’abonnement et de location</h2>

        <section aria-labelledby="cgu-abo-formules">
          <h3 id="cgu-abo-formules">6.1. Formules d’abonnement</h3>
          <p>
            Bibli’o Jouets propose plusieurs formules d’abonnement mensuel
            (Découverte, Standard, Premium) dont les tarifs et conditions sont
            consultables sur le Site.
          </p>
          <p>
            L’abonnement se renouvelle automatiquement chaque mois, sauf
            résiliation avant la date de renouvellement. Conformément à
            l’article L215-1 du Code de la consommation, un rappel de la
            reconduction tacite sera envoyé au Client avant chaque
            renouvellement annuel.
          </p>
        </section>

        <section aria-labelledby="cgu-abo-duree">
          <h3 id="cgu-abo-duree">6.2. Durée et restitution</h3>
          <p>
            Chaque location est valable pour une période d’un mois,
            renouvelable, à compter de la date de retrait ou de livraison. Les
            jouets doivent être restitués en bon état, complets et propres, à
            la date prévue.
          </p>
        </section>

        <section aria-labelledby="cgu-abo-caution">
          <h3 id="cgu-abo-caution">6.3. Caution</h3>
          <p>
            Une caution peut être demandée sous forme d’empreinte bancaire ou
            de chèque non encaissé. En cas de perte, casse ou détérioration
            majeure, une retenue pourra être appliquée selon la valeur du
            jouet.
          </p>
        </section>

        <section aria-labelledby="cgu-abo-retard">
          <h3 id="cgu-abo-retard">6.4. Retard de retour</h3>
          <p>
            Tout retard injustifié pourra entraîner une facturation
            supplémentaire ou la suspension du compte.
          </p>
        </section>
      </section>

      {/* Article 7: Tarifs et paiement */}
      <section aria-labelledby="cgu-tarifs">
        <h2 id="cgu-tarifs">7. Tarifs et paiement</h2>
        <p>
          Les prix sont exprimés en euros, toutes taxes comprises (TTC). Le
          paiement s’effectue en ligne par carte bancaire au moment de la
          souscription.
        </p>
        <p>
          Les abonnements sont renouvelés automatiquement chaque mois, sauf
          résiliation avant la date d’échéance.
        </p>
        <p>
          Bibli’o Jouets se réserve le droit de modifier ses tarifs à tout
          moment. Toute modification sera communiquée au Client avant
          renouvellement de son abonnement.
        </p>
      </section>

      {/* Article 8: Responsabilités de l’Utilisateur */}
      <section aria-labelledby="cgu-resp-utilisateur">
        <h2 id="cgu-resp-utilisateur">8. Responsabilités de l’Utilisateur</h2>
        <p>L’Utilisateur s’engage à :</p>
        <ul>
          <li>
            Utiliser les jouets de manière normale et adaptée à l’âge de
            l’enfant,
          </li>
          <li>Respecter les consignes d’utilisation et de sécurité,</li>
          <li>Restituer les jouets dans l’état où ils ont été reçus,</li>
          <li>
            Prévenir immédiatement Bibli’o Jouets en cas de casse ou perte.
          </li>
        </ul>
        <p>
          L’Utilisateur est responsable des dégradations survenues durant la
          période de location, sauf usure normale.
        </p>
      </section>

      {/* Article 9: Responsabilités de Bibli’o Jouets */}
      <section aria-labelledby="cgu-resp-biblio">
        <h2 id="cgu-resp-biblio">9. Responsabilités de Bibli’o Jouets</h2>
        <p>Bibli’o Jouets s’engage à :</p>
        <ul>
          <li>
            Fournir des jouets conformes aux normes CE et en bon état d’usage,
          </li>
          <li>
            Appliquer un protocole d’hygiène strict (nettoyage, désinfection,
            vérification),
          </li>
          <li>Assurer la disponibilité et la qualité du service.</li>
        </ul>
        <p>Bibli’o Jouets ne saurait être tenue responsable :</p>
        <ul>
          <li>Des dommages résultant d’un usage inapproprié des jouets,</li>
          <li>De retards imputables au transport ou à un tiers,</li>
          <li>De tout dommage indirect lié à l’utilisation du service.</li>
        </ul>
        <p>
          Bibli’o Jouets ne saurait être tenue responsable en cas de force
          majeure au sens de l’article 1218 du Code civil (catastrophe
          naturelle, grève, épidémie, etc.).
        </p>
      </section>

      {/* Article 10: Suspension ou résiliation du compte */}
      <section aria-labelledby="cgu-suspension">
        <h2 id="cgu-suspension">10. Suspension ou résiliation du compte</h2>
        <p>
          Bibli’o Jouets se réserve le droit de suspendre ou résilier l’accès
          d’un Utilisateur :
        </p>
        <ul>
          <li>En cas de non-paiement,</li>
          <li>De non-respect des présentes CGU,</li>
          <li>Ou de comportement abusif envers le personnel ou les autres utilisateurs.</li>
        </ul>
        <p>
          L’Utilisateur peut résilier son abonnement à tout moment depuis son
          espace personnel.
        </p>
      </section>

      {/* Article 11: Propriété intellectuelle */}
      <section aria-labelledby="cgu-pi">
        <h2 id="cgu-pi">11. Propriété intellectuelle</h2>
        <p>
          Tous les éléments du Site (textes, images, logo, charte graphique,
          base de données) sont la propriété exclusive de Bibli’o Jouets.
        </p>
        <p>
           Toute reproduction, diffusion ou utilisation sans autorisation préalable est interdite. 
Certains visuels et photographies présents sur le Site ont été générés ou retouchés à l'aide de technologies d'Intelligence Artificielle. Bibli'o Jouets s'efforce de garantir que ces représentations sont fidèles aux produits réels, mais elles n'ont qu'une valeur illustrative et non contractuelle. 

        </p>
      </section>

      {/* Article 12: Données personnelles (RGPD) */}
      <section aria-labelledby="cgu-rgpd">
        <h2 id="cgu-rgpd">12. Données personnelles (RGPD)</h2>
        <p>
          Bibli’o Jouets collecte et traite les données personnelles de
          l’Utilisateur dans le cadre de la gestion des abonnements, paiements
          et communications clients.
        </p>
        <p>
          Les données sont traitées conformément au Règlement Général sur la
          Protection des Données (RGPD) et à la législation française en
          vigueur.
        </p>
        <p>
          
Bibli'o Jouets collecte et traite les données personnelles de l'Utilisateur pour la gestion des abonnements, paiements et communications. Ces données sont conservées pour une durée de 3 ans à compter de la fin de la relation commerciale, à l'exception des documents comptables conservés 10 ans. L'Utilisateur dispose d'un droit d'accès, de rectification, de suppression et d'opposition via : 
{" "}
          <a href="mailto:contact@bibliojouets.fr">
            contact@bibliojouets.fr
          </a>
          .
        </p>
        <p>Les données ne sont jamais revendues à des tiers.</p>
      </section>

      {/* Article 13: Droit applicable et litiges */}
      <section aria-labelledby="cgu-litiges">
        <h2 id="cgu-litiges">13. Droit applicable et litiges</h2>
        <p>
          Les présentes CGU sont régies par le droit français. Tout litige
          relatif à leur interprétation ou exécution sera soumis aux tribunaux
          compétents du ressort de Montpellier.
        </p>
      </section>

      {/* Article 14: Conditions de livraison et de retrait */}
      <section aria-labelledby="cgu-livraison">
        <h2 id="cgu-livraison">14. Conditions de livraison et de retrait</h2>
        <p>
          Bibli’o Jouets propose plusieurs modes de mise à disposition et de
          retour des jouets :
        </p>

        <section aria-labelledby="cgu-liv-relais">
          <h3 id="cgu-liv-relais">14.1. Retrait en point relais</h3>
          <p>
            Le Client peut choisir un point relais partenaire au moment de la
            commande. Les horaires et adresses sont précisés sur le Site ou
            communiqués lors de la réservation. Le Client s’engage à récupérer
            sa commande dans les délais indiqués.
          </p>
        </section>

        <section aria-labelledby="cgu-liv-domicile">
          <h3 id="cgu-liv-domicile">14.2. Livraison à domicile</h3>
          <p>
            
Une livraison locale est possible dans certaines zones géographiques définies par Bibli’o Jouets.
          </p>
          <p>
            Des frais de livraison peuvent être appliqués selon la distance ou le volume des jouets.

 Le Client doit être présent lors du créneau de livraison convenu. En cas d’absence non signalée, les frais de re-livraison pourront être facturés.
          </p>
          <p>
En cas d'absence non signalée lors du créneau de livraison convenu, des frais de re-livraison forfaitaires pourront être appliqués. Le montant de ces frais est précisé lors de la validation de la commande.</p>
        </section>

        <section aria-labelledby="cgu-liv-retour">
          <h3 id="cgu-liv-retour">14.3. Retour des jouets</h3>
          <p>
            Les jouets doivent être restitués dans le même mode que celui
            choisi pour le retrait (ex. : livraison, relais ou boutique). Tout
            retard ou non-retour entraîne la facturation du mois suivant
            jusqu’à restitution effective.
          </p>
        </section>
      </section>

      {/* Article 15: Contenus utilisateurs */}
      <section aria-labelledby="cgu-contenus">
        {/* J'ai corrigé la coquille "Contenues" en "Contenus" */}
        <h2 id="cgu-contenus">15. Contenus utilisateurs</h2>
        <p>
          Les avis ou commentaires publiés par les Utilisateurs sur le Site
          peuvent être utilisés par Bibli’o Jouets à des fins de
          communication, dans le respect du droit à l’image et de la vie
          privée.
        </p>
      </section>

      {/* Article 16: Contact */}
      <section aria-labelledby="cgu-contact">
        <h2 id="cgu-contact">16. Contact</h2>
        <p>
          Pour toute question relative aux présentes CGU ou au fonctionnement
          du service :
        </p>
        <address>
          Email :{" "}
          <a href="mailto:contact@bibliojouets.fr">
            contact@bibliojouets.fr
          </a>
          <br />
          1 av de l’aurore, 34570 Saussan, France 
        </address>
      </section>

      {/* Pied de page du document */}
      <footer className="cgu-footer">
        <p>
          Les présentes CGU entrent en vigueur le 1 novembre 2025 et
          remplacent toute version antérieure.
        </p>
        <p>
          Elles peuvent être modifiées à tout moment, la version en ligne au
          jour de l’utilisation du Site fait foi.
        </p>
        <p>
            Mise à jour le 19/12/25

        </p>
      </footer>
    </div>
  );
}

export default Cgu;