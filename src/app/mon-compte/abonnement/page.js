'use client';

import { CreditCard } from 'lucide-react';

export default function AbonnementPage() {
  return (
    <div>
      <h2 className="section-title">Mon Abonnement</h2>
      <div className="empty-state">
        <CreditCard size={48} color="#6EC1E4" style={{ margin: '0 auto 16px' }} />
        <h3>Gestion de l&apos;abonnement</h3>
        <p style={{ color: '#888' }}>Cette section est en cours de développement.</p>
      </div>
    </div>
  );
}
