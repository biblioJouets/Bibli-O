import React from "react";
import 'styles/CommitmentCard.css';


function CommitmentCard({ title, description, icon, className = "", iconClassName = "" }) {
    const rootClass = `commitment-card ${className}`.trim();
    const imgClass = `commitment-icon ${iconClassName}`.trim();
    return (
        <div className={rootClass}>
            <img src={icon} alt={title} className={imgClass} />
            <h3 className="commitment-title">{title}</h3>
            <p className="commitment-description">{description}</p>
        </div>
    );
}

export default CommitmentCard;
