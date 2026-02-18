/* src/app/mon-compte/page.js */
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, LogOut } from 'lucide-react'; // J'ai ajouté des icônes pour faire plus propre si tu veux
import '@/styles/monCompte.css';

// Import de tes nouveaux composants
import OrdersTab from '@/components/account/OrdersTab';
import ProfileTab from '@/components/account/ProfileTab';

export default function MonComptePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('orders');

  // Redirection si non connecté (sécurité côté client)
  if (status === 'unauthenticated') {
    router.push('/connexion');
    return null;
  }

  // Affichage pendant le chargement de la session
  if (status === 'loading') return <div className="loading-screen">Chargement...</div>;

  return (
    <div className="account-page-container">
      <div className="account-layout">
        
        {/* --- SIDEBAR GAUCHE (Navigation) --- */}
        <aside className="account-sidebar">
          <div className="user-brief">
            <div className="avatar-placeholder">
              {session?.user?.name ? session.user.name[0].toUpperCase() : 'U'}
            </div>
            <p className="user-name">Bonjour, <strong>{session?.user?.name}</strong></p>
          </div>

          <nav className="account-nav">
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={20} /> Mes Commandes
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'infos' ? 'active' : ''}`}
              onClick={() => setActiveTab('infos')}
            >
              <User size={20} /> Mes Informations
            </button>

            <button 
              className="nav-item logout"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut size={20} /> Me déconnecter
            </button>
          </nav>
        </aside>

        {/* --- CONTENU PRINCIPAL (Affichage conditionnel) --- */}
        <main className="account-content">
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'infos' && <ProfileTab />}
        </main>

      </div>
    </div>
  );
}