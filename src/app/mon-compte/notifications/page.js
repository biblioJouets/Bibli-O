import { Bell, Package, CreditCard, Star, Megaphone } from 'lucide-react';

export const metadata = { title: 'Notifications — Bibliojouets' };

const NOTIFICATION_TYPES = [
  { icon: Package, label: 'Livraisons & Retours', desc: 'Suivi de vos colis et rappels de retour.', enabled: true, color: '#6EC1E4', bg: '#DFF1F9' },
  { icon: CreditCard, label: 'Paiements', desc: 'Alertes en cas d\'échec ou de prélèvement à venir.', enabled: true, color: '#3b8c6e', bg: '#DAEEE6' },
  { icon: Star, label: 'Nouveautés', desc: 'Les derniers jouets ajoutés à la bibliothèque.', enabled: false, color: '#d97706', bg: '#FFF7EB' },
  { icon: Megaphone, label: 'Offres & Promotions', desc: 'Codes promo et offres exclusives membres.', enabled: false, color: '#888', bg: '#f3f4f6' },
];

const FAKE_NOTIFICATIONS = [
  { type: 'package', text: 'Votre colis a été expédié — suivi disponible.', date: 'Il y a 2 jours', read: false },
  { type: 'billing', text: 'Votre abonnement sera renouvelé le 01/04/2024 (19,90 €).', date: 'Il y a 3 jours', read: true },
  { type: 'new', text: 'Nouveau jouet disponible : LEGO Technic 42150.', date: 'Il y a 5 jours', read: true },
];

export default function NotificationsPage() {
  return (
    <div>
      <h2 className="section-title">Notifications</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Gérez vos préférences de notification et consultez vos alertes récentes.
      </p>

      {/* Préférences */}
      <div className="bg-white rounded-[25px] shadow-sm p-6 mb-6" style={{ border: '1px solid #eee' }}>
        <h3 className="font-bold text-base mb-5" style={{ color: '#2E1D21' }}>Mes préférences</h3>
        <div className="flex flex-col gap-4">
          {NOTIFICATION_TYPES.map(({ icon: Icon, label, desc, enabled, color, bg }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="shrink-0 flex items-center justify-center rounded-full w-10 h-10"
                  style={{ background: bg }}
                >
                  <Icon size={18} style={{ color }} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#2E1D21' }}>{label}</p>
                  <p className="text-xs" style={{ color: '#888' }}>{desc}</p>
                </div>
              </div>
              {/* Toggle statique */}
              <div
                className="relative shrink-0 rounded-full transition-colors"
                style={{
                  width: 44,
                  height: 24,
                  background: enabled ? '#6EC1E4' : '#ddd',
                  cursor: 'pointer',
                }}
                role="switch"
                aria-checked={enabled}
                aria-label={`Activer les notifications ${label}`}
              >
                <div
                  className="absolute top-1 rounded-full transition-transform"
                  style={{
                    width: 16,
                    height: 16,
                    background: '#fff',
                    left: enabled ? 24 : 4,
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications récentes */}
      <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Bell size={20} style={{ color: '#2E1D21' }} aria-hidden="true" />
            <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Récentes</h3>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6EC1E4', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'underline', padding: 0 }}
          >
            Tout marquer comme lu
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {FAKE_NOTIFICATIONS.map(({ text, date, read }, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-[15px] p-4"
              style={{
                background: read ? '#fafafa' : '#DFF1F9',
                border: `1px solid ${read ? '#eee' : '#b3e0f2'}`,
              }}
            >
              <div
                className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                style={{ background: read ? 'transparent' : '#6EC1E4' }}
              />
              <div className="flex-1">
                <p className="text-sm" style={{ color: '#2E1D21', fontWeight: read ? 400 : 600 }}>{text}</p>
                <p className="text-xs mt-1" style={{ color: '#aaa' }}>{date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
