//composant Enfant CardsPlan.jsx

import React from "react";

//css 
import "./style/CardsPlan.css"

function CardsPlan ({title, price, button, list, theme }) {
    const cardClasses = `CardPlan ${theme}`;

    return(
<div className={cardClasses}>
    <h3 className="CardPlan-title">{title}</h3>
<p className="CardPlan-price">{price}</p>

{button}

{/* map de la liste  */}
<ul className="CardPlan-list">
    {list && list.map((item, index) => (
        <li key={index}>{item}</li>
    ))}
</ul>

</div>

    )
}

export default CardsPlan;