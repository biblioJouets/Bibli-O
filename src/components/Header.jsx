'use client';

import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X, User, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react"; 
import { useCart } from "@/context/CartContext";
import Image from 'next/image';
import Link from 'next/link';
import 'styles/Button.css'; 
import 'styles/header.css';

const logo = "/assets/logoBiblioJouets.png"

export default function HeaderBiblioJouets() {
  const { data: session } = useSession();
  const { cartCount } = useCart();

  const [isBurgerOpen, setBurgerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // États pour les menus déroulants
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Profil
  const [isOffersOpen, setOffersOpen] = useState(false);     // Nos Offres
  
  const menuRef = useRef(null);
  const dropdownRef = useRef(null); 
  const offersRef = useRef(null); // Ref pour le clic extérieur de Nos Offres

  // Clic extérieur : Menu Burger
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

  // Clic extérieur : Menu Profil
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideDropdown);
    return () => document.removeEventListener('mousedown', handleClickOutsideDropdown);
  }, []);

  // Clic extérieur : Menu Nos Offres
  useEffect(() => {
    const handleClickOutsideOffers = (event) => {
      if (offersRef.current && !offersRef.current.contains(event.target)) {
        setOffersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideOffers);
    return () => document.removeEventListener('mousedown', handleClickOutsideOffers);
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
  const closeBurger = () => {
    setBurgerOpen(false);
    setOffersOpen(false); // On ferme aussi le sous-menu au cas où
  };

  return ( 
    <nav className={`header-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo-container">
        <Link href="/" className="logo-link">
          <Image src={logo} alt="Logo Bibli'O Jouets" className="logo-img" width={150} height={50} />
        </Link>
      </div>

      {!isBurgerOpen && (
        <button className="burger-button" onClick={toggleBurger} aria-label="Toggle menu">
          <Menu size={28} color="#2E1D21" />
          {cartCount > 0 && <span className="cart-badge-dot"></span>}
        </button>
      )}

      {/* =========================================
          NAVIGATION PRINCIPALE + MOBILE DRAWER
         ========================================= */}
      <div ref={menuRef} className={`nav-menu ${isBurgerOpen ? "open" : ""}`}>
        <button className="close-menu-button" onClick={closeBurger} aria-label="Fermer le menu">
          <X size={24} color="#2E1D21" />
        </button>

        <Link href="/bibliotheque" onClick={closeBurger}>Nos Jouets</Link>
        <Link href="/fonctionnement" onClick={closeBurger}>Comment ça marche ?</Link>
        
        {/* NOUVEAU MENU DÉROULANT : NOS OFFRES (Calqué sur le profil utilisateur) */}
        <div className="user-dropdown-container offers-container" ref={offersRef}>
          <button 
            className="dropdown-trigger nav-link-trigger" 
            onClick={() => setOffersOpen(!isOffersOpen)}
            aria-expanded={isOffersOpen}
          >
            Nos Offres {isOffersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {isOffersOpen && (
            <div className="user-dropdown-menu offers-dropdown">
              <Link href="/abonnements" className="dropdown-item" onClick={closeBurger}>
                Nos Abonnements
              </Link>
              <Link href="/mariage" className="dropdown-item" onClick={closeBurger} style={{ color: '#FF8C94' }}>
                Mariages & Événements
              </Link>
            </div>
          )}
        </div>

        <Link href="/a-propos" onClick={closeBurger}>Notre histoire</Link>
        <Link href="/contact" onClick={closeBurger}>Nous contacter</Link>

        <div className="nav-actions-mobile">
          {session ? (
            <>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" onClick={closeBurger} style={{ color: '#FF8C94', fontWeight: 'bold' }}>
                  Admin Dashboard
                </Link>
              )}
              <Link href="/mon-compte" onClick={closeBurger} className="action-link">
                <User size={20} /><span>Mon Compte</span>
              </Link>
              <Link href="/panier" onClick={closeBurger} className="action-link">
                <ShoppingCart size={20} /><span>Panier</span>
                 {cartCount > 0 && <span className="cart-badge-dot"></span>}
              </Link>
              <Link href="#" onClick={(e) => { e.preventDefault(); signOut({ callbackUrl: '/' }); closeBurger(); }} style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '15px' }}>
                Se déconnecter
              </Link>
            </>
          ) : (
            <>
              <Link href="/inscription" onClick={closeBurger}>S'inscrire</Link>
              <Link href="/connexion" onClick={closeBurger}>Se connecter</Link>
            </>
          )}
        </div>
      </div>

      {/* =========================================
           DESKTOP (Droite du header)
         ========================================= */}
      <div className="header-actions">
        {session ? (
          <>
            <Link href="/panier" className="icon-link" aria-label="Panier">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge-desktop">{cartCount}</span>}
            </Link>

            <div className="user-dropdown-container" ref={dropdownRef}>
              <button 
                className="icon-link dropdown-trigger" 
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                aria-label="Menu utilisateur"
                aria-expanded={isDropdownOpen}
              >
                <User size={22} />
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown-menu">
                  <Link href="/mon-compte" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Mon Compte
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="dropdown-item admin-item" onClick={() => setDropdownOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button className="dropdown-item logout-btn" onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: window.location.origin }); }}>
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className="HeaderButton Blue" onClick={() => signIn()} style={{ padding: '15px 20px' }}>
            Se connecter
          </button>
        )}
      </div>
    </nav>
  );
}