//Composant parents de CardsPlans.jsx

import React from "react";
import CardsPlan from './CardsPlan'
//import des buttons 
import ButtonRed from "./ButtonRed";
import ButtonGreen from "./ButtonGreen";
import ButtonYellow from "./ButtonYellow";

import "@/styles/CardsPlansButtons.css";

//Création des lists des cards 

const decouverteList = ["2 jouets par mois","Livraison offertes"];
const standardList = ["4 jouets par mois","Livraison offertes"];
const premiumList = ["6 jouets par mois","Livraison offertes"];


function CardsPlans(){
    return (
<div className="CardsPlans-Container">

{/* === Carte 1 Rouge | Decouverte Card ===*/}
<CardsPlan
title={"Découverte"}
price={"19"}
theme="theme-red"
button={<ButtonRed text="L'offre découverte" href="/abonnements"/>}
list={decouverteList}
/>
{/* === Carte 2 verte | Standard Card ===*/}
<CardsPlan
title={"Standard"}
price={"25€"}
theme="theme-green"
button={<ButtonGreen text="L'offre Standard" href="/abonnements"/>}
list={standardList}
/>
{/* === Carte 3 Jaune | Premium Card ===*/}
<CardsPlan
title={"Premium"}
price={"32€"}
theme="theme-yellow"
button={<ButtonYellow text="L'offre Premium" href="/abonnements"/>}
list={premiumList}
/>

</div>
    )
}
export default CardsPlans;
