'use client';

import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import 'styles/Button.css'; 
import 'styles/header.css';

const logo = "/assets/logoBiblioJouets.png"

export default function HeaderBiblioJouets() {
  const { data: session } = useSession();

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
        <Link href="/" className="logo-link">
          <Image src={logo} alt="Logo Bibli'O Jouets" className="logo-img" 
           width={150}   
           height={50} 
          />
        </Link>
      </div>

      {/* Burger button (mobile) */}
      {!isBurgerOpen && (
        <button
          className="burger-button"
          onClick={toggleBurger}
          aria-label="Toggle menu"
        >
          <Menu size={28} color="#2E1D21" />
        </button>
      )}

      {/* =========================================
          NAVIGATION PRINCIPALE + MOBILE DRAWER
         ========================================= */}
      <div ref={menuRef} className={`nav-menu ${isBurgerOpen ? "open" : ""}`}>
        <button
          className="close-menu-button"
          onClick={closeBurger}
          aria-label="Fermer le menu"
        >
          <X size={24} color="#2E1D21" />
        </button>

        {/* 1. Liens TOUJOURS visibles (Desktop & Mobile) */}
        <Link href="/bibliotheque" onClick={closeBurger}>Nos Jouets</Link>
        <Link href="/fonctionnement" onClick={closeBurger}>Comment ça marche ?</Link>
        <Link href="/abonnements" onClick={closeBurger}>Nos Abonnements</Link>
        <Link href="/contact" onClick={closeBurger}>Nous contacter</Link>

        {/* 2. Liens UNIQUEMENT MOBILE (Cachés sur Desktop via CSS) */}
        <div className="nav-actions-mobile">
          
          {session ? (
            <>
              {/* --- CAS CONNECTÉ (MOBILE) --- */}
              
              {session.user.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  onClick={closeBurger}
                  style={{ color: '#FF8C94', fontWeight: 'bold' }}
                >
                  Admin Dashboard
                </Link>
              )}

              <Link href="/mon-compte" onClick={closeBurger} className="action-link">
                <User size={20} />
                <span>Mon Compte</span>
              </Link>
              
              <Link href="/panier" onClick={closeBurger} className="action-link">
                <ShoppingCart size={20} />
                <span>Panier</span>
              </Link>

              <Link 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  signOut({ callbackUrl: '/' });
                  closeBurger();
                }}
                style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '15px' }}
              >
                Se déconnecter
              </Link>
            </>
          ) : (
            <>
              {/* --- CAS NON CONNECTÉ (MOBILE) --- */}
              <Link href="/inscription" onClick={closeBurger}>S'inscrire</Link>
              <Link href="/connexion" onClick={closeBurger}>Se connecter</Link>
            </>
          )}
        </div>
      </div>

      {/* =========================================
          ACTIONS DESKTOP (Droite du header)
         ========================================= */}
      <div className="header-actions">
        
        {/* Icônes (Visibles seulement si connecté) */}
        {session && (
          <>
            <Link href="/mon-compte" className="icon-link" aria-label="Mon compte">
              <User size={22} />
            </Link>
            <Link href="/panier" className="icon-link" aria-label="Panier">
              <ShoppingCart size={22} />
            </Link>
          </>
        )}

        {/* Boutons (Admin / Auth) */}
        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {session.user.role === 'ADMIN' && (
               <Link href="/admin" style={{ fontWeight: 'bold', color: '#FF8C94' }}>
                 Admin
               </Link>
            )}
            
            <button 
              className="Button Blue" 
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ padding: '15px 20px' }} 
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <button 
            className="Button Blue" 
            onClick={() => signIn()}
                          style={{ padding: '15px 20px' }} 

          >
            Se connecter
          </button>
        )}
      </div>
    </nav>
  );
}