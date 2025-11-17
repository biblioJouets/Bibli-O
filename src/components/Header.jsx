import { useState, useEffect, useRef } from "react";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import logo from "../assets/logoBiblioJouets.png";
import ButtonContactHeader from "./ButtonBlue";
import "./style/header.css";

function HeaderBiblioJouets() {
  const [isBurgerOpen, setBurgerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);

  // Gestion du clic en dehors du menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          !event.target.classList.contains('burger-button')) {
        setBurgerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleBurger = () => setBurgerOpen(!isBurgerOpen);
  const closeBurger = () => setBurgerOpen(false);

  return (
    <nav className={`header-nav ${isScrolled ? 'scrolled' : ''}`}>

      <div className="logo-container">
        <a href="/" className="logo-link">
          <img src={logo} alt="Logo Bibli'O Jouets" className="logo-img" />
        </a>
      </div>

    {/* Burger button (visible uniquement en mobile) */}
    {!isBurgerOpen && (
        <button
            className="burger-button"
            onClick={toggleBurger}
            aria-label="Toggle menu"
        >
            <Menu size={28} color="#2E1D21" />
        </button>
    )}
    {/* Navigation principale */}
      <div ref={menuRef} className={`nav-menu ${isBurgerOpen ? "open" : ""}`}>
        {/* Bouton de fermeture (visible uniquement quand le menu est ouvert en mobile) */}
        <button
          className="close-menu-button"
          onClick={closeBurger}
          aria-label="Fermer le menu"
        >
          <X size={24} color="#2E1D21" />
        </button>

        {/* Liens de navigation */}
        <a href="/catalogue" onClick={closeBurger}>
          Nos Jouets
        </a>
        <a href="/fonctionnement" onClick={closeBurger}>
          Comment ça marche ?
        </a>
        <a href="/abonnements" onClick={closeBurger}>
          Nos Abonnements
        </a>
        <a href="/a-propos" onClick={closeBurger}>
          À Propos
        </a>

        {/* Actions secondaires (visible dans le menu mobile) */}
        <div className="nav-actions-mobile">
          <a href="/mon-compte" onClick={closeBurger} className="action-link">
            <User size={20} />
            <span>Mon Compte</span>
          </a>
          <a href="/panier" onClick={closeBurger} className="action-link">
            <ShoppingCart size={20} />
            <span>Panier</span>
          </a>
        </div>
      </div>

      {/* Actions secondaires et CTA (visible en desktop) */}
      <div className="header-actions">
        <a href="/mon-compte" className="icon-link" aria-label="Mon compte">
          <User size={22} />
        </a>
        <a href="/panier" className="icon-link" aria-label="Panier">
          <ShoppingCart size={22} />
        </a>
        <ButtonContactHeader 
        text={"S'abonner"}
        href={"/abonnements"}/>
      </div>
    </nav>
  );
}

export default HeaderBiblioJouets;