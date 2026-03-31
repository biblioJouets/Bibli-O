import { Star, Award, Zap, Lock } from 'lucide-react';

export const metadata = { title: 'Programme Fidélité — Bibliojouets' };

const LEVELS = [
  { label: 'Débutant', min: 0, max: 99, color: '#888', bg: '#f3f4f6', icon: '🌱' },
  { label: 'Explorateur', min: 100, max: 299, color: '#3b8c6e', bg: '#DAEEE6', icon: '🌿' },
  { label: 'Expert', min: 300, max: 599, color: '#6EC1E4', bg: '#DFF1F9', icon: '⭐' },
  { label: 'Ambassadeur', min: 600, max: Infinity, color: '#d97706', bg: '#FFF7EB', icon: '🏆' },
];

const REWARDS = [
  { points: 50, label: '5 % de réduction sur votre prochain mois', unlocked: false },
  { points: 100, label: '1 échange supplémentaire ce mois', unlocked: false },
  { points: 200, label: 'Accès prioritaire aux nouveautés', unlocked: false },
  { points: 300, label: '1 mois offert', unlocked: false },
];

const currentPoints = 0;

export default function FidelitePage() {
  return (
    <div>
      <h2 className="section-title">Programme Fidélité</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Cumulez des points à chaque mois d&apos;abonnement et débloquez des récompenses exclusives.
      </p>

      {/* Niveau actuel */}
      <div className="bg-white rounded-[25px] shadow-sm p-6 mb-6" style={{ border: '1px solid #eee' }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full w-12 h-12 text-2xl" style={{ background: '#f3f4f6' }}>
              🌱
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: '#2E1D21' }}>Niveau Débutant</p>
              <p className="text-sm" style={{ color: '#888' }}>{currentPoints} points cumulés</p>
            </div>
          </div>
          <div
            className="px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: '#f3f4f6', color: '#888' }}
          >
            0 / 100 pts → Explorateur
          </div>
        </div>

        {/* Barre progression */}
        <div className="w-full rounded-full h-4" style={{ background: '#f3f4f6' }}>
          <div
            className="h-4 rounded-full transition-all"
            style={{ width: `${Math.min((currentPoints / 100) * 100, 100)}%`, background: '#6EC1E4' }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: '#888' }}>
          Plus que <strong style={{ color: '#2E1D21' }}>100 points</strong> pour atteindre le niveau Explorateur.
        </p>
      </div>

      {/* Paliers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {LEVELS.map(({ label, min, color, bg, icon }) => {
          const reached = currentPoints >= min;
          return (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-[20px] p-4 text-center"
              style={{
                background: reached ? bg : '#f9f9f9',
                border: `1px solid ${reached ? color + '44' : '#eee'}`,
                opacity: reached ? 1 : 0.7,
              }}
            >
              <span className="text-2xl">{icon}</span>
              <p className="font-bold text-sm" style={{ color: reached ? color : '#aaa' }}>{label}</p>
              <p className="text-xs" style={{ color: '#aaa' }}>{min} pts</p>
            </div>
          );
        })}
      </div>

      {/* Récompenses */}
      <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
        <div className="flex items-center gap-3 mb-5">
          <Award size={22} style={{ color: '#d97706' }} aria-hidden="true" />
          <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Récompenses disponibles</h3>
        </div>

        <div className="flex flex-col gap-3">
          {REWARDS.map(({ points, label, unlocked }) => {
            const available = currentPoints >= points;
            return (
              <div
                key={label}
                className="flex items-center justify-between gap-4 rounded-[15px] p-4"
                style={{
                  background: available ? '#DAEEE6' : '#f9f9f9',
                  border: `1px solid ${available ? '#88D4AB' : '#eee'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  {available
                    ? <Zap size={18} style={{ color: '#3b8c6e', shrink: 0 }} aria-hidden="true" />
                    : <Lock size={18} style={{ color: '#ccc', shrink: 0 }} aria-hidden="true" />
                  }
                  <div>
                    <p className="font-semibold text-sm" style={{ color: available ? '#2E1D21' : '#aaa' }}>{label}</p>
                    <p className="text-xs" style={{ color: '#888' }}>{points} points requis</p>
                  </div>
                </div>
                {available && (
                  <button
                    className="px-4 py-1.5 rounded-full text-xs font-bold shrink-0"
                    style={{ background: '#3b8c6e', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    Utiliser
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
