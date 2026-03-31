import { Gift, Users, Copy, CheckCircle } from 'lucide-react';

export const metadata = { title: 'Parrainage — Bibliojouets' };

export default function ParrainagePage() {
  return (
    <div>
      <h2 className="section-title">Parrainage</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Invitez vos proches et gagnez des récompenses pour chaque filleul abonné.
      </p>

      {/* Hero code parrainage */}
      <div
        className="rounded-[25px] p-8 mb-8 text-center"
        style={{ background: '#2E1D21', color: '#fff' }}
      >
        <Gift size={40} style={{ color: '#6EC1E4', margin: '0 auto 16px' }} aria-hidden="true" />
        <h3 className="font-bold text-xl mb-2">Votre code parrainage</h3>
        <p className="text-sm opacity-70 mb-6">
          Partagez ce code — votre filleul bénéficie du 1er mois à -50 % et vous gagnez 1 mois offert.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div
            className="px-8 py-3 rounded-full font-bold tracking-widest text-lg"
            style={{ background: '#6EC1E4', color: '#2E1D21' }}
          >
            BIBLIO-XXX
          </div>
          <button
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-colors"
            style={{ background: '#4a3b3f', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            <Copy size={16} aria-hidden="true" /> Copier
          </button>
        </div>
      </div>

      {/* Stats parrainage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { icon: Users, value: '0', label: 'filleuls inscrits', bg: '#DFF1F9', color: '#6EC1E4' },
          { icon: CheckCircle, value: '0', label: 'filleuls actifs', bg: '#DAEEE6', color: '#3b8c6e' },
          { icon: Gift, value: '0 mois', label: 'offerts gagnés', bg: '#FFF7EB', color: '#d97706' },
        ].map(({ icon: Icon, value, label, bg, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-[25px] p-6 text-center"
            style={{ background: bg }}
          >
            <Icon size={26} style={{ color }} aria-hidden="true" />
            <p className="text-3xl font-extrabold" style={{ color: '#2E1D21' }}>{value}</p>
            <p className="text-sm" style={{ color: '#666' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Comment ça marche */}
      <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
        <h3 className="font-bold text-base mb-5" style={{ color: '#2E1D21' }}>Comment ça marche ?</h3>
        <ol className="flex flex-col gap-4">
          {[
            { step: '1', text: 'Partagez votre code à un proche.' },
            { step: '2', text: 'Il s\'inscrit et utilise votre code à l\'abonnement.' },
            { step: '3', text: 'Il profite du 1er mois à moitié prix.' },
            { step: '4', text: 'Vous recevez automatiquement 1 mois gratuit.' },
          ].map(({ step, text }) => (
            <li key={step} className="flex items-start gap-4">
              <div
                className="shrink-0 flex items-center justify-center rounded-full w-8 h-8 font-bold text-sm"
                style={{ background: '#DFF1F9', color: '#6EC1E4' }}
              >
                {step}
              </div>
              <p className="text-sm pt-1" style={{ color: '#2E1D21' }}>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
