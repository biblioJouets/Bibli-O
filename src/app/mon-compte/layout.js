import AccountNavigation from '@/components/account/AccountNavigation';
import '@/styles/monCompte.css';

export const metadata = {
  title: 'Mon Compte — Bibliojouets',
};

export default function MonCompteLayout({ children }) {
  return (
    <div className="account-page-container">
      <div className="account-layout">
        <AccountNavigation />
        <main className="account-content">
          {children}
        </main>
      </div>
    </div>
  );
}
