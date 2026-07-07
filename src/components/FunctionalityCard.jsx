import React from "react";
import '../styles/functionalitycard.css';

function FunctionalityCard({ title, description, number, className = "", numberClassName = "" }) {
    const rootClass = `functionality-card ${className}`.trim();
    const numberClass = `functionality-number ${numberClassName}`.trim();

    return (
        <div className={rootClass}>
            <div className={numberClass}>{number}</div>
            <h3 className="functionality-title">{title}</h3>
            <p className="functionality-description">{description}</p>
        </div>
    );
}

export default FunctionalityCard;