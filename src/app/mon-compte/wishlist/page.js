import { Heart, Bell, Share2, Baby } from 'lucide-react';

export const metadata = { title: 'Ma Wishlist — Bibliojouets' };

export default function WishlistPage() {
  return (
    <div>
      <h2 className="section-title">Ma Wishlist</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Sauvegardez les jouets qui vous font envie et soyez alerté de leur disponibilité.
      </p>

      {/* État vide */}
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-[25px] p-12 text-center mb-8"
        style={{ border: '2px dashed #ddd', background: '#fafafa' }}
      >
        <Heart size={48} style={{ color: '#FF8C94' }} aria-hidden="true" />
        <div>
          <p className="font-bold text-lg" style={{ color: '#2E1D21' }}>Votre wishlist est vide</p>
          <p className="text-sm mt-1" style={{ color: '#888' }}>
            Parcourez notre bibliothèque et cliquez sur ❤️ pour sauvegarder un jouet.
          </p>
        </div>
        <a
          href="/bibliotheque"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-colors"
          style={{ background: '#2E1D21', color: '#fff', textDecoration: 'none' }}
        >
          Parcourir la bibliothèque →
        </a>
      </div>

      {/* Fonctionnalités à venir */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Bell, label: 'Alertes dispo', desc: 'Soyez notifié quand un jouet redevient disponible.' },
          { icon: Share2, label: 'Partager la liste', desc: 'Envoyez votre liste à la famille pour les cadeaux.' },
          { icon: Baby, label: 'Par profil enfant', desc: 'Associez chaque jouet au bon profil enfant.' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex gap-3 rounded-[20px] p-4"
            style={{ background: '#fff', border: '1px solid #eee' }}
          >
            <div
              className="shrink-0 flex items-center justify-center rounded-full w-10 h-10"
              style={{ background: '#DFF1F9' }}
            >
              <Icon size={18} style={{ color: '#6EC1E4' }} aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#2E1D21' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#888' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
