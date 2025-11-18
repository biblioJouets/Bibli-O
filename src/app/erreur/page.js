

'use client';

import React from 'react';
import Link from 'next/link'; // 1. On importe Link
import { Home } from 'lucide-react';

// 2. On importe le CSS en tant qu'objet "styles"
// Assurez-vous d'avoir renommé le fichier en .module.css
import styles from "@/styles/Error404.module.css";
const Error404Pages = () => {
  return (
    // 3. On utilise styles['nom-de-classe'] pour accéder au CSS
    <div className={styles['error404-container']}>
      
      {/* Éléments de fond animés */}
      <div className={styles['background-shapes']}>
        <div className={`${styles.shape} ${styles['shape-circle-1']}`}></div>
        <div className={`${styles.shape} ${styles['shape-circle-2']}`}></div>
        <div className={`${styles.shape} ${styles['shape-square-1']}`}></div>
        <div className={`${styles.shape} ${styles['shape-circle-3']}`}></div>
        <div className={`${styles.shape} ${styles['shape-square-2']}`}></div>
      </div>

      {/* Contenu principal */}
      <div className={styles['content-wrapper']}>
        {/* Les chiffres 404 */}
        <div className={styles['error-code']}>
          <span className={`${styles.digit} ${styles['digit-1']}`}>4</span>
          <span className={`${styles.digit} ${styles['digit-2']}`}>0</span>
          <span className={`${styles.digit} ${styles['digit-3']}`}>4</span>
        </div>

        {/* Message d'erreur */}
        <div className={styles['error-message']}>
          <h1 className={styles['main-message']}>Oops ! Jouet perdu ?</h1>
          <p className={styles['sub-message']}>
            Il semble que cette page se soit cachée dans le coffre à jouets. 
            Pas de panique, retrouvons notre chemin.
          </p>
        </div>

        {/* 4. Bouton de retour optimisé avec Link */}
        {/* On entoure le bouton avec Link pour une navigation instantanée */}
        <Link href="/" className={styles['home-button']}>
            <Home className={styles['home-icon']} size={24} />
            <span>Retourner à l'accueil</span>
        </Link>
        
      </div>
    </div>
  );
}

export default Error404Pages;
