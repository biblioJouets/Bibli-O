'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, CreditCard, User } from 'lucide-react';

const shortcuts = [
  { href: '/mon-compte/commandes', label: 'Mes Commandes', icon: ShoppingBag, description: 'Suivez vos locations en cours' },
  { href: '/mon-compte/abonnement', label: 'Mon Abonnement', icon: CreditCard, description: 'Gérez votre formule' },
  { href: '/mon-compte/profil', label: 'Mon Profil', icon: User, description: 'Informations personnelles' },
];

export default function MonCompteDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'unauthenticated') {
    router.push('/connexion');
    return null;
  }

  if (status === 'loading') {
    return <div className="loading-screen">Chargement...</div>;
  }

  return (
    <div>
      <h2 className="section-title">
        Bonjour, {session?.user?.name} 👋
      </h2>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Bienvenue dans votre espace personnel. Que souhaitez-vous faire ?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '28px 20px',
                borderRadius: '16px',
                border: '1px solid #eee',
                background: '#fafafa',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#2E1D21',
                transition: 'box-shadow 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#DFF1F9';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(110,193,228,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fafafa';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Icon size={32} color="#6EC1E4" aria-hidden="true" />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item.label}</span>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>{item.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
