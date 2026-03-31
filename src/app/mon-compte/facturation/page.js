import { CreditCard, FileText, Bell, Calendar } from 'lucide-react';

export const metadata = { title: 'Facturation & Paiement — Bibliojouets' };

const fakeInvoices = [
  { id: 'INV-2024-003', date: '01/03/2024', amount: '19,90 €', status: 'Payée' },
  { id: 'INV-2024-002', date: '01/02/2024', amount: '19,90 €', status: 'Payée' },
  { id: 'INV-2024-001', date: '01/01/2024', amount: '19,90 €', status: 'Payée' },
];

export default function FacturationPage() {
  return (
    <div>
      <h2 className="section-title">Facturation & Paiement</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        Gérez votre carte bancaire, consultez vos factures et suivez vos échéances.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* Carte bancaire */}
        <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#DFF1F9' }}>
              <CreditCard size={20} style={{ color: '#6EC1E4' }} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Moyen de paiement</h3>
          </div>
          <div
            className="flex items-center justify-between rounded-[15px] p-4 mb-4"
            style={{ background: '#f9f9f9', border: '1px solid #eee' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 rounded" style={{ background: '#2E1D21' }} />
              <span className="text-sm font-medium" style={{ color: '#2E1D21' }}>•••• •••• •••• 4242</span>
            </div>
            <span className="text-xs" style={{ color: '#888' }}>12/26</span>
          </div>
          <button
            className="text-sm font-semibold underline"
            style={{ color: '#6EC1E4', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Mettre à jour ma carte →
          </button>
        </div>

        {/* Prochaine échéance */}
        <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#FFF7EB' }}>
              <Calendar size={20} style={{ color: '#d97706' }} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Prochaine échéance</h3>
          </div>
          <p className="text-3xl font-extrabold mb-1" style={{ color: '#2E1D21' }}>19,90 €</p>
          <p className="text-sm" style={{ color: '#888' }}>Prélevé le <strong style={{ color: '#2E1D21' }}>01/04/2024</strong></p>
          <div
            className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: '#DAEEE6', color: '#3b8c6e' }}
          >
            <Bell size={12} aria-hidden="true" /> Rappel activé
          </div>
        </div>

      </div>

      {/* Historique factures */}
      <div className="bg-white rounded-[25px] shadow-sm p-6" style={{ border: '1px solid #eee' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center rounded-full w-10 h-10" style={{ background: '#f3f4f6' }}>
            <FileText size={20} style={{ color: '#888' }} aria-hidden="true" />
          </div>
          <h3 className="font-bold text-base" style={{ color: '#2E1D21' }}>Historique des factures</h3>
        </div>

        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#888', fontWeight: 600 }}>Référence</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#888', fontWeight: 600 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#888', fontWeight: 600 }}>Montant</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#888', fontWeight: 600 }}>Statut</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#888', fontWeight: 600 }}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {fakeInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', color: '#2E1D21', fontWeight: 600 }}>{inv.id}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{inv.date}</td>
                  <td style={{ padding: '12px', color: '#2E1D21', fontWeight: 700 }}>{inv.amount}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: '#DAEEE6', color: '#3b8c6e' }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6EC1E4', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'underline', padding: 0 }}
                    >
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
