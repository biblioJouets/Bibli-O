import React from "react";
import '../styles/CommitmentCard.css';

function CommitmentCard({ title, description, icon, className = "", iconWrapperClass = "" }) {
    const rootClass = `bj-commitment-card ${className}`.trim();
    const wrapperClass = `bj-commitment-icon-wrapper ${iconWrapperClass}`.trim();

    return (
        <div className={rootClass}>
            {/* La bulle colorée organique qui entoure l'icône */}
            <div className={wrapperClass}>
                <img src={icon} alt={title} className="bj-commitment-icon" />
            </div>
            <h3 className="bj-commitment-title">{title}</h3>
            <p className="bj-commitment-description">{description}</p>
        </div>
    );
}

export default CommitmentCard;