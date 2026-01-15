import "@/styles/MentionsLegales.css"; 

function MentionsLegales() {
  return (
   
    <div className="mentions-legales-container">
      <h1>Mentions Légales</h1>

      {/* Section Éditeur */}
      <section aria-labelledby="editor-heading">
        <h2 id="editor-heading">Éditeur du site</h2>
        <p>Le présent site est édité par :</p>
        <dl className="info-list">
          <dt>PLEBANI Lucas</dt>
          <dd>pour le compte de Bibli'o Jouet, société par Actions Simplifiée Unipersonnelle (SASU)</dd>
          
          <dt>Siège social</dt>
          <dd>
            1 avenue de l’Aurore<br />
            34570 Saussan, France
          </dd>
          
          <dt>SIRET</dt>
          <dd>992 548 891 00017</dd>
          
          <dt>SIREN</dt>
          <dd>992 548 891</dd>
          
          <dt>Capital social</dt>
          <dd>1 euro</dd>
          
          <dt>Représentante légale</dt>
          <dd>Laura Calvas</dd>
          
          <dt>Email de contact</dt>
          <dd><a href="mailto:contact@bibliojouets.com">contact@bibliojouets.com</a></dd>
          
          <dt>Téléphone</dt>
          <dd><a href="tel:+33636258718">06 36 25 87 18</a></dd>
          
          <dt>Noms de domaine</dt>
          <dd>
            <a href="https://www.bibliojouets.fr" target="_blank" rel="noopener noreferrer">www.bibliojouets.fr</a><br />
            <a href="https://www.bibliojouets.com" target="_blank" rel="noopener noreferrer">www.bibliojouets.com</a>
          </dd>
        </dl>
      </section>

      {/* Section Hébergement */}
      <section aria-labelledby="hosting-heading">
        <h2 id="hosting-heading">Hébergement du site</h2>
        <p>Le site est hébergé par :</p>
        <dl className="info-list">
          <dt>Hébergeur</dt>
          <dd>OVH SAS</dd>
          
          <dt>Adresse</dt>
          <dd>
            2 rue Kellermann<br />
            59100 Roubaix – France
          </dd>
          
          <dt>Site web</dt>
          <dd><a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer">www.ovh.com</a></dd>
        </dl>
      </section>

      {/* Section Propriété Intellectuelle */}
      <section aria-labelledby="pi-heading">
        <h2 id="pi-heading">Propriété Intellectuelle</h2>
       <p>L’ensemble du contenu présent sur ce site (textes, images, logos, illustrations, vidéos, éléments graphiques, structure du site, etc.) est la propriété exclusive de Bibli’o Jouets, sauf mention contraire.
 Toute reproduction, distribution, modification, adaptation ou utilisation, totale ou partielle, du contenu sans autorisation écrite préalable est strictement interdite. 
Certains visuels présents sur le site ont été générés ou retouchés par Intelligence Artificielle (IA). Ils sont utilisés à titre illustratif et ne sont pas contractuels.
</p>
      </section>

      {/* Section Responsabilité */}
      <section aria-labelledby="responsibility-heading">
        <h2 id="responsibility-heading">Responsabilité</h2>
        <p>Bibli’o Jouets s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur ce site. Cependant, l’entreprise ne saurait être tenue responsable :</p>
        <ul>
          <li>d’éventuelles erreurs ou omissions,</li>
          <li>d’une indisponibilité temporaire du site,</li>
          <li>ou de dommages résultant de l’utilisation des informations disponibles.</li>
        </ul>
      </section>

      {/* Section RGPD */}
      <section aria-labelledby="rgpd-heading">
        <h2 id="rgpd-heading">Données personnelles (RGPD)</h2>
       <p>
        Les informations collectées via le site sont traitées conformément au Règlement Général sur la Protection des Données (RGPD).
 Pour plus de détails sur la collecte, l’utilisation et la conservation de vos données, ainsi que sur vos droits (accès, rectification, suppression, opposition), veuillez consulter notre Politique de confidentialité. 
Les données personnelles des Clients sont conservées pendant toute la durée de l’abonnement, puis pendant une durée de 3 ans à des fins de prospection commerciale. Par dérogation, les documents et pièces justificatives relatifs aux transactions (factures) sont conservés pendant 10 ans au titre des obligations comptables et légales.
        </p>
      </section>

      {/* Section Contact et Litiges */}
      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact et Litiges</h2>
        <p>Pour toute question, vous pouvez nous contacter :</p>
        {/* La balise <address> est la plus sémantique pour des infos contact */}
        <address>
          Email : <a href="mailto:contact@bibliojouets.com">contact@bibliojouets.com</a><br />
          Adresse : 1 avenue de l’Aurore, 34570 Saussan, France
        </address>
        <p >
          En cas de litige, et conformément à l’article L.612-1 du Code de la consommation, le consommateur a le droit de recourir gratuitement à un médiateur de la consommation. 
Le médiateur de la consommation désigné est le CM2C. Il peut être saisi via son site internet : <a href="https://www.cm2c.net/" target="_blank" rel="noopener noreferrer">https://www.cm2c.net/</a> ou par voie postale : CM2C, 49 rue de Ponthieu, 75008 Paris.
        </p>
      </section>
    </div>

  );
}

export default MentionsLegales;