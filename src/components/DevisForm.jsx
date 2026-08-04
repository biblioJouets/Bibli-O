'use client'; 
import '../styles/devisForm.css'; 
import React, { useState } from 'react';

export default function DevisForm() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(e.target);
    
    if (formData.get('botcheck')) {
      setStatus('success');
      setMessage('Votre demande a bien été envoyée !');
      return;
    }

    const data = {
      name: formData.get('name'),
      date: formData.get('date'),
      location: formData.get('location'),
      details: formData.get('details'),
    };

    try {
      const response = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Une erreur est survenue lors de l'envoi.");
      }

      setStatus('success');
      setMessage('Votre demande de devis a été envoyée avec succès ! Nous vous recontacterons très vite.');
      e.target.reset(); 
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <section id="devis" className="bj-mar-section bj-mar-contact bg-warm-3">
      <div className="bj-mar-container bj-mar-contact-grid">
        <div className="bj-mar-contact-info">
           <span className="bj-mar-overline">Contactez-<span className="bj-main-title-highlight">nous</span></span>
           <h2 className="bj-mar-h2">Possibilité de faire un <span className="bj-main-title-highlight">devis sur mesure</span></h2>
           <p className="bj-mar-text">Professionnels de l'événementiel ou futurs mariés, déléguez l'espace enfant en toute sérénité. Remplissez ce formulaire et obtenez une proposition rapide.</p>
        </div>
        <div className="bj-mar-contact-form-card bg-warm-1">
          <form className="bj-mar-form" onSubmit={handleSubmit}>
            <input type="text" name="botcheck" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />

            <div className="bj-mar-form-group">
              <label htmlFor="name">Nom & Prénom / Agence</label>
              <input type="text" id="name" name="name" placeholder="Vos coordonnées" required disabled={status === 'loading'} />
            </div>
            <div className="bj-mar-form-group">
              <label htmlFor="date">Date de l'événement</label>
              <input type="date" id="date" name="date" required disabled={status === 'loading'} />
            </div>
            <div className="bj-mar-form-group">
              <label htmlFor="location">Lieu de réception</label>
              <input type="text" id="location" name="location" placeholder="Montpellier et alentours..." required disabled={status === 'loading'} />
            </div>
            <div className="bj-mar-form-group">
              <label htmlFor="details">Détails du projet (Formule souhaitée, nombre d'enfants...)</label>
              <textarea id="details" name="details" rows="4" placeholder="Dites-nous tout..." required disabled={status === 'loading'}></textarea>
            </div>
            
            <button 
              type="submit" 
              className="bj-mar-btn-primary" 
              disabled={status === 'loading'}
              style={{ opacity: status === 'loading' ? 0.7 : 1, cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
            >
              {status === 'loading' ? 'Envoi en cours...' : 'Demander un devis sur mesure'}
            </button>

            {status === 'success' && (
              <p className="bj-mar-text-small" style={{ color: '#88D4AB', marginTop: '1rem', fontWeight: 'bold' }}>
                {message}
              </p>
            )}
            {status === 'error' && (
              <p className="bj-mar-text-small" style={{ color: '#FF8C94', marginTop: '1rem', fontWeight: 'bold' }}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}