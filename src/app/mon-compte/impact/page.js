import { Sparkles, Leaf, Star, TrendingUp, Gift } from 'lucide-react';

export const metadata = { title: 'Mon Impact — Bibliojouets' };

export default function ImpactPage() {
  return (
    <div>
      <h2 className="section-title">Mon Impact & Fidélité</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Suivez vos économies, votre impact écologique et vos récompenses.
      </p>

      {/* Compteurs impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { icon: Sparkles, value: '0', label: 'jouets explorés', bg: '#FFF7EB', color: '#d97706' },
          { icon: TrendingUp, value: '0 €', label: 'économisés', bg: '#DAEEE6', color: '#3b8c6e' },
          { icon: Leaf, value: '0 kg', label: 'CO₂ économisés', bg: '#DFF1F9', color: '#6EC1E4' },
        ].map(({ icon: Icon, value, label, bg, color }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center gap-2 rounded-[25px] p-6 text-center"
            style={{ background: bg, border: `1px solid ${bg}` }}
          >
            <Icon size={28} style={{ color }} aria-hidden="true" />
            <p className="text-3xl font-extrabold" style={{ color: '#2E1D21' }}>{value}</p>
            <p className="text-sm font-medium" style={{ color: '#666' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Programme fidélité */}
      <div className="bg-white rounded-[25px] shadow-sm p-6 mb-6" style={{ border: '1px solid #eee' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#FFF7EB' }}>
            <Star size={20} style={{ color: '#d97706' }} aria-hidden="true" />
          </div>
          <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Programme fidélité</h3>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2" style={{ color: '#888' }}>
            <span>Niveau Débutant</span>
            <span>0 / 100 pts</span>
          </div>
          <div className="w-full rounded-full h-3" style={{ background: '#f3f4f6' }}>
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: '0%', background: '#6EC1E4' }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: '#888' }}>
            Prochain niveau : <strong style={{ color: '#2E1D21' }}>Explorateur</strong> (100 pts)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Bronze', points: '0 pts', reached: false },
            { label: 'Explorateur', points: '100 pts', reached: false },
            { label: 'Expert', points: '300 pts', reached: false },
          ].map(({ label, points, reached }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-[15px] p-4 text-center"
              style={{
                background: reached ? '#DAEEE6' : '#f9f9f9',
                border: `1px solid ${reached ? '#88D4AB' : '#eee'}`,
              }}
            >
              <Star size={20} style={{ color: reached ? '#3b8c6e' : '#ccc' }} aria-hidden="true" />
              <p className="font-bold text-sm" style={{ color: '#2E1D21' }}>{label}</p>
              <p className="text-xs" style={{ color: '#888' }}>{points}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Code parrainage */}
      <div
        className="rounded-[25px] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ background: '#2E1D21', color: '#fff' }}
      >
        <div className="flex items-center justify-center rounded-full w-12 h-12 shrink-0" style={{ background: '#4a3b3f' }}>
          <Gift size={22} style={{ color: '#6EC1E4' }} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="font-bold">Code parrainage</p>
          <p className="text-sm mt-0.5 opacity-70">Partagez votre code et gagnez 1 mois offert pour chaque filleul.</p>
        </div>
        <div
          className="px-5 py-2 rounded-full font-bold tracking-widest text-sm shrink-0"
          style={{ background: '#6EC1E4', color: '#2E1D21' }}
        >
          BIBLIO-XXX
        </div>
      </div>
    </div>
  );
}
