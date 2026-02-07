export const getSuggestedPlan = (count) => {
    // Si pas de jouets
    if (!count || count === 0) return { name: "Aucune formule", price: "0€", contactLink: null };

    // Définition des tarifs
    const pricing = {
        1: 20,
        2: 25,
        3: 35,
        4: 38,
        5: 45,
        6: 51,
        7: 56,
        8: 60,
        9: 63
    };

    // Si le nombre est entre 1 et 9
    if (pricing[count]) {
        return { 
            name: `Box ${count} Jouet${count > 1 ? 's' : ''}`, 
            price: `${pricing[count]}€`,
            contactLink: null 
        };
    }

    // Si plus de 9 jouets
    return { 
        name: "Sur devis (Maxi Box)", 
        price: "Sur mesure", 
        contactLink: "/contact" 
    };
};