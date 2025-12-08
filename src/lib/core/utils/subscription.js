export const getSuggestedPlan = (count) => {
    if (count <= 2) return { name: "Découverte", price: "19€", contactLink: null };
    if (count <= 4) return { name: "Standard", price: "25€", contactLink: null };
    if (count <= 6) return { name: "Premium", price: "32€", contactLink: null };
    
    return { 
        name: "Sur devis", 
        price: null, 
        contactLink: "/contact" 
    };
};