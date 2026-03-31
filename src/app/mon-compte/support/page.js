import { MessageCircle, Mail, Phone, ExternalLink, ChevronDown } from 'lucide-react';

export const metadata = { title: 'Support — Bibliojouets' };

const FAQ = [
  { q: 'Comment retourner un jouet ?', a: 'Rendez-vous dans "Logistique & Retours" pour déclarer un retour et télécharger votre étiquette prépayée.' },
  { q: 'Mon paiement a échoué, que faire ?', a: 'Rendez-vous dans "Facturation" pour mettre à jour votre carte bancaire. L\'abonnement sera automatiquement relancé.' },
  { q: 'Puis-je changer de formule d\'abonnement ?', a: 'Oui, rendez-vous dans "Mon Abonnement" pour passer à une formule supérieure ou inférieure.' },
  { q: 'Un jouet est abîmé à la réception ?', a: 'Contactez-nous dans les 48h avec une photo via le formulaire ci-dessous. Nous procédons à un remplacement rapide.' },
  { q: 'Comment fonctionne l\'échange mensuel ?', a: 'Chaque mois, vous pouvez échanger un jouet depuis votre commande active. Le jeton se réinitialise le 1er de chaque mois.' },
];

export default function SupportPage() {
  return (
    <div>
      <h2 className="section-title">Support & Aide</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Une question ? Consultez notre FAQ ou contactez-nous directement.
      </p>

      {/* Canaux de contact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Mail, label: 'Email', value: 'contact@bibliojouets.fr', href: 'mailto:contact@bibliojouets.fr', bg: '#DFF1F9', color: '#6EC1E4' },
          { icon: Phone, label: 'Téléphone', value: '06 36 25 87 18', href: 'tel:0636258718', bg: '#DAEEE6', color: '#3b8c6e' },
          { icon: MessageCircle, label: 'Chat en direct', value: 'Disponible 9h–18h', href: '#', bg: '#FFF7EB', color: '#d97706' },
        ].map(({ icon: Icon, label, value, href, bg, color }) => (
          <a
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-[20px] p-4 no-underline transition-all"
            style={{ background: bg, textDecoration: 'none' }}
          >
            <div className="shrink-0 flex items-center justify-center rounded-full w-10 h-10 bg-white">
              <Icon size={18} style={{ color }} aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#2E1D21' }}>{label}</p>
              <p className="text-xs" style={{ color: '#666' }}>{value}</p>
            </div>
            <ExternalLink size={14} style={{ color: '#aaa', marginLeft: 'auto' }} aria-hidden="true" />
          </a>
        ))}
      </div>

      {/* Formulaire contact */}
      <div className="bg-white rounded-[25px] shadow-sm p-6 mb-6" style={{ border: '1px solid #eee' }}>
        <h3 className="font-bold text-base mb-5" style={{ color: '#2E1D21' }}>Envoyer un message</h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="support-subject" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#555', marginBottom: 8 }}>
                Sujet
              </label>
              <select
                id="support-subject"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 10, fontSize: '1rem', background: '#fff', color: '#2E1D21' }}
              >
                <option value="">Choisir un sujet…</option>
                <option>Jouet abîmé à la réception</option>
                <option>Problème de paiement</option>
                <option>Question sur mon abonnement</option>
                <option>Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="support-order" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#555', marginBottom: 8 }}>
                Commande concernée (optionnel)
              </label>
              <input
                id="support-order"
                type="text"
                placeholder="Ex : #12345"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 10, fontSize: '1rem' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="support-message" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#555', marginBottom: 8 }}>
              Message
            </label>
            <textarea
              id="support-message"
              rows={5}
              placeholder="Décrivez votre problème…"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 10, fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <button className="btn-primary">Envoyer le message</button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
        <h3 className="font-bold text-base mb-5" style={{ color: '#2E1D21' }}>Questions fréquentes</h3>
        <div className="flex flex-col gap-3">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="rounded-[15px] overflow-hidden"
              style={{ border: '1px solid #eee' }}
            >
              <summary
                className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm list-none"
                style={{ color: '#2E1D21' }}
              >
                {q}
                <ChevronDown size={16} style={{ color: '#6EC1E4', flexShrink: 0 }} aria-hidden="true" />
              </summary>
              <div className="px-4 pb-4 text-sm" style={{ color: '#666' }}>
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
