import React from "react";
import 'styles/functionalitycard.css';

function functionalityCard({ title, description, number, className = "", numberClassName = ""}){
    const rootClass = `functionality-card ${className}`.trim();
    const numberClass = `functionality-number ${numberClassName}`.trim();
    return (
<div className={rootClass}>
    <p className={numberClass}>{number}</p>
    <h3 className="functionality-title">{title}</h3>
    <p className="functionality-description">{description}</p>
</div>
    )


}
export default functionalityCard;