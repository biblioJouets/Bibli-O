import React from "react";
import "./style/protocol.css"
import Nettoyage from "../assets/protocole_nettoyage.svg"
import ButtonDuo from "./ButtonDuo";

const listProtocole = [
"​​ 1. Inspection : Contrôle complet des pièces à la réception.",

" 2. Désinfection : Nettoyage avec des produits écologiques et hypoallergéniques. ",

"​ 3. Vérification : Second contrôle qualité pour une sécurité parfaite.",

"​ 4. Emballage : Mise sous scellé pour garantir une hygiène intacte. "
]
function Protocol() 


{
    return(
        <div className="SectionProtocol">
            <h2>Un Protocole de Nettoyage et de Désinfection Impeccable</h2>
            <div className="TextImage">
                <div className="ImageProtocolWrapper">
                    <img 
                        className="ImageProtocol" 
                        src={Nettoyage} 
                        alt="Image du protocole de nettoyage et de réparation des jouets Bibli'O Jouets"
                    />
                </div>
                <div className="Text">
                    <h3>Jouez l'Esprit Léger : Notre Engagement Hygiène & Sécurité</h3>
<p>L'hygiène est notre priorité absolue. Chaque jouet suit un processus strict en 4 étapes avant de vous être envoyé :</p>
<ul>
    {listProtocole.map((item, index) => (
        <li key={index}>{item}</li>
    ))}

</ul>
 
    <ButtonDuo
            blueText="Découvrir nos jouets"
            redText="Voir les abonnements"
            blueHref="/catalogue"
            redHref="/abonnements"
            target="_self"
          />



                    </div>
                    
            </div>
        </div>
    )
}

export default Protocol;