import React from "react";
import Image from "next/image";
import '../styles/CommitmentCard.css';

function CommitmentCard({ title, description, icon, className = "", iconWrapperClass = "bj-bg-blue" }) {
    const rootClass = `bj-commitment-card ${className}`.trim();
    const wrapperClass = `bj-commitment-icon-wrapper ${iconWrapperClass}`.trim();

    return (
        <div className={rootClass}>
            <div className={wrapperClass}>
                <Image 
                    src={icon} 
                    alt={title} 
                    width={40} 
                    height={40} 
                    className="bj-commitment-icon" 
                />
            </div>
            <h3 className="bj-commitment-title">{title}</h3>
            <p className="bj-commitment-description">{description}</p>
        </div>
    );
}

export default CommitmentCard;