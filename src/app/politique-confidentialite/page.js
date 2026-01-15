import '@/styles/privacy.css';
export default function PrivacyPolicyPage() {
  return (
    <div className="privacy-container">
      <header className="privacy-header">
        <h1>Politique de confidentialité - Bibli'o Jouets</h1>
        <p className="last-update">Dernière mise à jour : octobre 2025</p>
      </header>

      <section className="privacy-intro">
        <p>
          La présente politique de confidentialité décrit la manière dont Bibli'o Jouets collecte, utilise et protège les données personnelles dans le cadre de ses activités (location de jouets, abonnements, gestion des clients et du site web).
        </p>
        <p>
          La présente politique est établie conformément au Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 (RGPD) et à la Loi Informatique et Libertés modifiée.
        </p>
        <p>
          Vos données sont hébergées en France et ne font l'objet d'aucun transfert en dehors de l'Union européenne.
        </p>
      </section>

      <section>
        <h2>1. Responsable du traitement</h2>
        <div className="company-details">
          <p><strong>Bibli'o Jouets (SASU)</strong></p>
          <p>Siège : 1 avenue de l'Aurore, 34570 Saussan</p>
          <p>Email : <a href="mailto:contact@bibliojouets.com">contact@bibliojouets.com</a></p>
          <p>Représentante légale : Laura Calvas</p>
        </div>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <p>Nous collectons uniquement les données nécessaires à la gestion de nos services :</p>
        <ul>
          <li><strong>Clients / abonnés :</strong> nom, prénom, adresse, email, téléphone, moyen de paiement, historique de location.</li>
          <li><strong>Prospects / visiteurs du site :</strong> nom, email, message, cookies de navigation.</li>
          <li><strong>Partenaires / points relais :</strong> nom, coordonnées professionnelles.</li>
        </ul>
        <p>
          Les données personnelles des Clients sont conservées pendant toute la durée de l'abonnement, puis pendant une durée de 3 ans à compter du dernier contact (fin de contrat ou dernière interaction) à des fins de prospection commerciale.
        </p>
        <p>
          Par exception, les documents relatifs aux transactions (factures, bons de commande) sont conservés pendant 10 ans afin de répondre aux obligations comptables et fiscales légales.
        </p>
        <p>
          Les données de paiement sont supprimées dès la fin de la transaction, sauf en cas d'abonnement récurrent où elles sont conservées de manière sécurisée par notre prestataire de paiement.
        </p>
      </section>

      <section>
        <h2>3. Finalités de traitement</h2>
        <p>Les données personnelles sont utilisées pour :</p>
        <ul>
          <li>Gérer les abonnements et les contrats clients</li>
          <li>Gérer les factures et la comptabilité</li>
          <li>Suivre les jouets et leur entretien</li>
          <li>Répondre aux demandes envoyées via le site</li>
          <li>Envoyer des informations et actualités (newsletter, si consentement donné)</li>
        </ul>
      </section>

      <section>
        <h2>4. Base légale des traitements</h2>
        <ul>
          <li><strong>Exécution d'un contrat :</strong> gestion des abonnements et des locations</li>
          <li><strong>Obligation légale :</strong> comptabilité et facturation</li>
          <li><strong>Consentement :</strong> newsletter, cookies, formulaires</li>
          <li><strong>Intérêt légitime :</strong> amélioration des services</li>
        </ul>
      </section>

      <section>
        <h2>5. Destinataires des données</h2>
        <p>Les données sont accessibles uniquement par :</p>
        <ul>
          <li>Laura Calvas (gérante)</li>
          <li>L'alternant(e) sous contrat de confidentialité</li>
          <li>Les prestataires techniques (OVH pour l'hébergement du site, outils de messagerie et de facturation conformes au RGPD).</li>
        </ul>
        <p><strong>Aucune donnée n'est vendue, louée ou cédée à des tiers.</strong></p>
      </section>

      <section>
        <h2>6. Durée de conservation</h2>
        <table className="privacy-table">
          <thead>
            <tr>
              <th>Catégorie de données</th>
              <th>Durée</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Données clients / abonnés</td>
              <td>3 ans après la fin du contrat</td>
            </tr>
            <tr>
              <td>Données de facturation</td>
              <td>10 ans (obligation légale)</td>
            </tr>
            <tr>
              <td>Données de contact (formulaires)</td>
              <td>1 an après dernier contact</td>
            </tr>
            <tr>
              <td>Données newsletter</td>
              <td>Jusqu'au retrait du consentement</td>
            </tr>
            <tr>
              <td>Cookies analytiques</td>
              <td>13 mois maximum</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>7. Sécurité</h2>
        <p>Bibli'o Jouets met en œuvre des mesures techniques et organisationnelles adaptées :</p>
        <ul>
          <li>Mots de passe forts et double authentification</li>
          <li>Sauvegardes sécurisées</li>
          <li>Accès limité aux données personnelles</li>
          <li>Destruction sécurisée des données obsolètes</li>
        </ul>
      </section>

      <section>
        <h2>8. Droits des personnes</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition</li>
        </ul>
        <div className="contact-box">
          <p>Pour exercer ces droits :</p>
          <p>Email : <a href="mailto:contact@bibliojouets.com">contact@bibliojouets.com</a></p>
          <p>Courrier : 1 avenue de l'Aurore, 34570 Saussan</p>
          <p><em>Une réponse vous sera adressée sous 30 jours maximum.</em></p>
        </div>
      </section>

      <section>
        <h2>9. Gestion du consentement newsletter</h2>
        <p>
          Vous pouvez vous désinscrire à tout moment des communications marketing en cliquant sur le lien de désinscription présent dans chaque e-mail.
        </p>
      </section>

      <section>
        <h2>10. Cookies</h2>
        <p>
          Le site bibliojouets.fr utilise des cookies nécessaires à son bon fonctionnement et, avec votre accord, des cookies de mesure d'audience.
        </p>
        <p>
          Lors de votre première visite, un bandeau d'information vous permet d'accepter ou de refuser les cookies. Vous pouvez modifier vos préférences à tout moment via votre navigateur.
        </p>
      </section>

      <section>
        <h2>11. Utilisation de l'Intelligence Artificielle</h2>
        <p>
          Dans le cadre de la présentation de ses services, Bibli'o Jouets peut utiliser des visuels générés ou retouchés par Intelligence Artificielle (IA).
        </p>
        <p>
          Ces outils sont utilisés uniquement pour l'illustration des produits et ne donnent lieu à aucun traitement de données personnelles ou biométriques vous concernant.
        </p>
      </section>

      <footer className="privacy-footer">
        <h2>Mise à jour</h2>
        <p>
          Cette politique est susceptible d'évoluer à mesure que le site et les services évoluent. La version à jour est toujours disponible sur le site bibliojouets.fr.
        </p>
        <p>
          Cette politique de confidentialité a été approuvée par la direction de Bibli'o Jouets et est applicable à compter du <strong>19 décembre 2025</strong>. Toute modification fera l'objet d'une mise à jour sur cette page.
        </p>
      </footer>
    </div>
  );
}