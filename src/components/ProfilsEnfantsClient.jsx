'use client';

import { Baby, Plus, Star, Heart } from 'lucide-react';

export const metadata = { title: 'Profils Enfants — Bibliojouets' };

export default function ProfilsEnfantsPage() {
  return (
    <div>
      <h2 className="section-title">Profils Enfants</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Créez des profils pour chaque enfant afin de recevoir des recommandations personnalisées.
      </p>

      {/* Grille profils (vide — état initial) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        {/* Placeholder — aucun profil */}
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-[25px] p-8 text-center"
          style={{ border: '2px dashed #ddd', minHeight: 180 }}
        >
          <Baby size={36} style={{ color: '#ccc' }} aria-hidden="true" />
          <p className="text-sm font-medium" style={{ color: '#aaa' }}>Aucun profil créé</p>
        </div>

        {/* Bouton ajouter un profil */}
        <button
          className="flex flex-col items-center justify-center gap-3 rounded-[25px] p-8 text-center transition-colors"
          style={{
            border: '2px dashed #ccc',
            background: 'transparent',
            cursor: 'pointer',
            minHeight: 180,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#6EC1E4';
            e.currentTarget.style.background = '#DFF1F9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#ccc';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Plus size={32} style={{ color: '#6EC1E4' }} aria-hidden="true" />
          <span className="text-sm font-semibold" style={{ color: '#6EC1E4' }}>
            Ajouter un enfant
          </span>
        </button>
      </div>

      {/* Pourquoi créer un profil */}
      <div
        className="rounded-[25px] p-6"
        style={{ background: '#FFF7EB', border: '1px solid #ffe8c0' }}
      >
        <h3 className="font-bold text-base mb-4" style={{ color: '#2E1D21' }}>
          Pourquoi créer un profil ?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Star, title: 'Recommandations', desc: 'Jouets adaptés à l\'âge et aux intérêts de chaque enfant.' },
            { icon: Heart, title: 'Multi-enfants', desc: 'Gérez plusieurs enfants avec des préférences distinctes.' },
            { icon: Baby, title: 'Suivi de croissance', desc: 'Nous adaptons les suggestions au fur et à mesure.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div
                className="shrink-0 flex items-center justify-center rounded-full w-9 h-9"
                style={{ background: '#fff' }}
              >
                <Icon size={18} style={{ color: '#d97706' }} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#2E1D21' }}>{title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#888' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
