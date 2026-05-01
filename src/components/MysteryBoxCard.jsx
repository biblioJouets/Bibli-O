'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '@/styles/mysterybox.css';

const AGE_OPTIONS = [
  { value: '0-6 mois',  label: '0 – 6 mois' },
  { value: '6-12 mois', label: '6 – 12 mois' },
  { value: '1-2 ans',   label: '1 – 2 ans' },
  { value: '2-3 ans',   label: '2 – 3 ans' },
  { value: '3-4 ans',   label: '3 – 4 ans' },
  { value: '4-5 ans',   label: '4 – 5 ans' },
  { value: '5-6 ans',   label: '5 – 6 ans' },
  { value: '6+ ans',    label: '6 ans et plus' },
];

const GENDER_OPTIONS = [
  { value: 'fille',  label: 'Fille' },
  { value: 'garcon', label: 'Garçon' },
  { value: 'mixte',  label: 'Mixte / Pas de préférence' },
];

const HIGHLIGHTS = [
  ' Sélection sur-mesure : 4 jouets soigneusement choisis par nos soins',
  ' Série très limitée : Seulement 100 Box disponibles !',
  ' Zéro tracas : Livraison incluse et nettoyage rigoureux',
  ' Sans engagement : Résiliation facile en un clic à tout moment',
];

export default function MysteryBoxCard({ boxProduct }) {
  const { addBoxToCart, loading } = useCart();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('');
  const [error, setError] = useState('');

  if (!boxProduct) return null;

  const outOfStock = boxProduct.stock === 0;

  async function handleConfirm() {
    if (!childAge || !childGender) {
      setError("Veuillez renseigner l'âge et le sexe de l'enfant.");
      return;
    }
    setError('');
    const ok = await addBoxToCart(boxProduct.id, childAge, childGender);
    if (ok) {
      setModalOpen(false);
      router.push('/panier');
    }
  }

  return (
    <>
  <section className="MysteryBoxSection">
    <h2 className="homePageSubTitle " id="mysteryBox-title">La Box Mystère de Mai</h2>
      <div className="mbc-wrapper">

        {/* Colonne image */}
        <div className="mbc-img-col">
          <Image
            src="/assets/image_promoBox.png"
            alt="Box Mystère de Mai — Bibli'o Jouets"
            width={1024}
            height={657}
            priority
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Colonne contenu */}
        
        <div className="mbc-content-col">
          
          <div className="mbc-badge">
            🌟 OFFRE ÉPHÉMÈRE DE MAI — SÉRIE LIMITÉE (100 BOX)
          </div>

          <div className="mbc-body">
            <h3 className="mbc-title">🐻 4 jouets Surprise, 24,90 € seulement !</h3>

            <p className="mbc-desc">
              Offrez à votre enfant tout l'émerveillement d'une surprise, avec la garantie de notre expertise !
              Notre équipe compose pour vous une sélection unique de <strong>4 jouets parfaitement adaptés</strong> à
              l'âge et au stade de développement de votre enfant. Laissez-nous vous surprendre !
            </p>

            <ul className="mbc-list">
              {HIGHLIGHTS.map(item => <li key={item}>{item}</li>)}
            </ul>

            <div className="mbc-price-row">
              <span className="mbc-price-main">24,90 €</span>
              <span className="mbc-price-old">38,00 €</span>
              <span className="mbc-price-badge">−13,10 €</span>
            </div>
            <p className="mbc-price-note">
              Offre non renouvelable. Passage automatique au forfait classique 4 jouets (38 €/mois)
              à partir du 2e mois, sauf action de votre part.
            </p>

            <button
              className="mbc-cta"
              onClick={() => setModalOpen(true)}
              disabled={loading || outOfStock}
              style={{
                background: outOfStock ? '#ccc' : 'linear-gradient(90deg, #f5a623, #f7c948)',
                color: outOfStock ? '#888' : '#7a3e00',
                cursor: outOfStock ? 'not-allowed' : 'pointer',
              }}
            >
              {outOfStock ? '⚠️ Épuisé' : '🎁 Je commande ma Box Mystère'}
            </button>
          </div>
        </div>
      </div>
</section>
      {/* ── MODALE ── */}
{modalOpen && (
  <div
    className="mbc-modal-overlay"
    onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
  >
    <div className="mbc-modal-content">
      <button
        className="mbc-modal-close"
        onClick={() => setModalOpen(false)}
        aria-label="Fermer"
      >
        ×
      </button>

      <h3 className="mbc-modal-title">
        📦 Personnalisez votre Box Mystère
      </h3>
      <p className="mbc-modal-desc">
        Ces informations nous permettent de sélectionner les <strong>4 jouets les plus adaptés</strong> à votre enfant.
      </p>

      <label className="mbc-modal-label">
        Âge de l'enfant
      </label>
      <select
        className="mbc-modal-select"
        value={childAge}
        onChange={e => setChildAge(e.target.value)}
      >
        <option value="">-- Sélectionnez l'âge --</option>
        {AGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <label className="mbc-modal-label">
        Sexe de l'enfant
      </label>
      <select
        className="mbc-modal-select mbc-modal-select-last"
        value={childGender}
        onChange={e => setChildGender(e.target.value)}
      >
        <option value="">-- Sélectionnez --</option>
        {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {error && (
        <p className="mbc-modal-error">{error}</p>
      )}

      <button 
        className="mbc-cta-modal"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? 'Ajout en cours...' : '✅ Valider et aller au panier'}
      </button>
    </div>
  </div>
)}
    </>
  );
}
