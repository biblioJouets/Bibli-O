import React from "react";
import jouet1 from "../assets/toys/jouet1.jpg";
import jouet2 from "../assets/toys/jouet2.jpg";
import jouet3 from "../assets/toys/jouet3.jpg";
import jouet4 from "../assets/toys/jouet4.jpg";
import jouet5 from "../assets/toys/jouet5.jpg";

import '../components/style/newtoys.css'

function NewToys() {

    const toys = [
        { src: jouet1, alt: "Description jouet 1", label: "jouet 1" },
        { src: jouet2, alt: "Description jouet 2", label: "jouet 2" },
        { src: jouet3, alt: "Description jouet 3", label: "jouet 3" },
        { src: jouet4, alt: "Description jouet 4", label: "jouet 4" },
        { src: jouet5, alt: "Description jouet 5", label: "jouet 5" }
    ];

    const renderToyItems = (isAriaHidden = false) => {
        return (
            <>
                {toys.map((toy, index) => (
                    <div className="toyItemContainer" key={`set1-${index}`}>
                        <div className="toyItem">
                            <img src={toy.src} alt={isAriaHidden ? "" : toy.alt} className="newToyImage"/>
                        </div>
                        <p>{toy.label}</p>
                    </div>
                ))}
                
                {toys.map((toy, index) => (
                    <div className="toyItemContainer" key={`set2-${index}`}>
                        <div className="toyItem">
                            <img src={toy.src} alt="" className="newToyImage"/>
                        </div>
                        <p>{toy.label}</p>
                    </div>
                ))}
                
                {toys.map((toy, index) => (
                    <div className="toyItemContainer" key={`set3-${index}`}>
                        <div className="toyItem">
                            <img src={toy.src} alt="" className="newToyImage"/>
                        </div>
                        <p>{toy.label}</p>
                    </div>
                ))}
            </>
        );
    };

    return (
        <div className="newToysSection"> 
            <h2>Les Nouveautés du mois</h2>

            <div className="ToysSectionMask">
                <div className="ToysSectionWrapper">
                    <div className="ToysSection">
                        {renderToyItems(false)}
                    </div>
                    <div aria-hidden="true" className="ToysSection">
                        {renderToyItems(true)}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default NewToys;