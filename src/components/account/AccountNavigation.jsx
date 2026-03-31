'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, ShoppingBag, CreditCard, User, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/mon-compte', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/mon-compte/commandes', label: 'Mes Commandes', icon: ShoppingBag },
  { href: '/mon-compte/abonnement', label: 'Mon Abonnement', icon: CreditCard },
  { href: '/mon-compte/profil', label: 'Mon Profil', icon: User },
];

export default function AccountNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* ---- SIDEBAR (Desktop ≥ 768px) ---- */}
      <aside className="account-sidebar hidden md:block">
        <div className="user-brief">
          <div className="avatar-placeholder">
            {session?.user?.name ? session.user.name[0].toUpperCase() : 'U'}
          </div>
          <p className="user-name">
            Bonjour, <strong>{session?.user?.name}</strong>
          </p>
        </div>

        <nav className="account-nav" aria-label="Navigation du compte">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={clsx('nav-item', { active })}
              >
                <Icon size={20} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}

          <button
            className="nav-item logout"
            onClick={() => signOut({ callbackUrl: '/' })}
            aria-label="Se déconnecter"
          >
            <LogOut size={20} aria-hidden="true" />
            Me déconnecter
          </button>
        </nav>
      </aside>

      {/* ---- BOTTOM NAVIGATION (Mobile < 768px) ---- */}
      <nav
        className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 flex md:hidden"
        aria-label="Navigation mobile du compte"
      >
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs font-medium transition-colors',
                active
                  ? 'text-[#6EC1E4]'
                  : 'text-[#2E1D21] hover:bg-gray-50'
              )}
            >
              <span className="relative">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="leading-none">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          aria-label="Se déconnecter"
          className="flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs font-medium text-[#FF8C94] hover:bg-gray-50 transition-colors"
        >
          <LogOut size={22} aria-hidden="true" />
          <span className="leading-none">Sortir</span>
        </button>
      </nav>
    </>
  );
}
