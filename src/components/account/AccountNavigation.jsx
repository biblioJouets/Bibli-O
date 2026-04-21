'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  CreditCard,
  Receipt,
  Baby,
  Heart,
  Sparkles,
  Gift,
  Star,
  Bell,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

// Bottom nav : 4 items principaux + bouton "Plus"
const BOTTOM_NAV_ITEMS = [
  { href: '/mon-compte', label: 'Accueil', icon: LayoutDashboard, exact: true },
  { href: '/mon-compte/commandes', label: 'Commandes', icon: ShoppingBag },
  { href: '/mon-compte/abonnement', label: 'Abonnement', icon: CreditCard },
  { href: '/mon-compte/profil', label: 'Profil', icon: User },
];

// Pages en cours de construction — non accessibles
const COMING_SOON = new Set([
  '/mon-compte/logistique',
  '/mon-compte/profils-enfants',
  '/mon-compte/wishlist',
  '/mon-compte/impact',
  '/mon-compte/parrainage',
  '/mon-compte/fidelite',
  '/mon-compte/notifications',
  '/mon-compte/support',
]);

// Sidebar : groupes de navigation
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { href: '/mon-compte', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Mes commandes',
    items: [
      { href: '/mon-compte/commandes', label: 'Mes commandes', icon: ShoppingBag },
      { href: '/mon-compte/logistique', label: 'Logistique', icon: Truck },
    ],
  },
  {
    label: 'Abonnement',
    items: [
      { href: '/mon-compte/abonnement', label: 'Abonnement', icon: CreditCard },
      { href: '/mon-compte/facturation', label: 'Facturation', icon: Receipt },
    ],
  },
  {
    label: 'Personnalisation',
    items: [
      { href: '/mon-compte/profils-enfants', label: 'Profils enfants', icon: Baby },
      { href: '/mon-compte/wishlist', label: 'Wishlist', icon: Heart },
    ],
  },
  {
    label: 'Récompenses',
    items: [
      { href: '/mon-compte/impact', label: 'Mon impact', icon: Sparkles },
      { href: '/mon-compte/parrainage', label: 'Parrainage', icon: Gift },
      { href: '/mon-compte/fidelite', label: 'Fidélité', icon: Star },
    ],
  },
  {
    label: 'Compte',
    items: [
      { href: '/mon-compte/notifications', label: 'Notifications', icon: Bell },
      { href: '/mon-compte/profil', label: 'Mon profil', icon: User },
      { href: '/mon-compte/support', label: 'Support', icon: HelpCircle },
    ],
  },
];

// Tous les items hors bottom nav, pour le menu "Plus" mobile
const MORE_ITEMS = [
  { href: '/mon-compte/logistique', label: 'Logistique', icon: Truck },
  { href: '/mon-compte/facturation', label: 'Facturation', icon: Receipt },
  { href: '/mon-compte/profils-enfants', label: 'Profils enfants', icon: Baby },
  { href: '/mon-compte/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/mon-compte/impact', label: 'Mon impact', icon: Sparkles },
  { href: '/mon-compte/parrainage', label: 'Parrainage', icon: Gift },
  { href: '/mon-compte/fidelite', label: 'Fidélité', icon: Star },
  { href: '/mon-compte/notifications', label: 'Notifications', icon: Bell },
  { href: '/mon-compte/support', label: 'Support', icon: HelpCircle },
];

function isActive(item, pathname) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export default function AccountNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* ===== SIDEBAR — Desktop (≥ 768px) ===== */}
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
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
              {group.label && (
                <p
                  className="px-3 mb-1 text-xs font-bold uppercase tracking-widest"
                  style={{ color: '#bbb' }}
                >
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = isActive(item, pathname);
                const Icon = item.icon;
                const soon = COMING_SOON.has(item.href);

                if (soon) {
                  return (
                    <span
                      key={item.href}
                      className="nav-item"
                      style={{ opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' }}
                      aria-disabled="true"
                    >
                      <Icon size={18} aria-hidden="true" />
                      {item.label}
                      <span
                        className="ml-auto text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                        style={{ background: '#f3f4f6', color: '#aaa' }}
                      >
                        Bientôt
                      </span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={clsx('nav-item', { active })}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}

          <button
            className="nav-item logout"
            onClick={() => signOut({ callbackUrl: '/' })}
            aria-label="Se déconnecter"
          >
            <LogOut size={18} aria-hidden="true" />
            Me déconnecter
          </button>
        </nav>
      </aside>

      {/* ===== BOTTOM NAV — Mobile (< 768px) ===== */}
      <nav
        className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 flex md:hidden"
        aria-label="Navigation mobile du compte"
      >
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs font-medium transition-colors',
                active ? 'text-[#6EC1E4]' : 'text-[#2E1D21] hover:bg-gray-50'
              )}
            >
              <Icon size={22} aria-hidden="true" />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* Bouton "Plus" */}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-label="Plus d'options"
          aria-expanded={moreOpen}
          className={clsx(
            'flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs font-medium transition-colors',
            moreOpen ? 'text-[#6EC1E4]' : 'text-[#2E1D21] hover:bg-gray-50'
          )}
        >
          {moreOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          <span className="leading-none">Plus</span>
        </button>
      </nav>

      {/* ===== DRAWER "Plus" — Mobile ===== */}
      {moreOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          {/* Panneau */}
          <div
            className="fixed bottom-16 left-0 right-0 z-40 md:hidden rounded-t-[25px] bg-white p-4 shadow-2xl"
            role="dialog"
            aria-label="Menu supplémentaire"
          >
            <div className="grid grid-cols-3 gap-3">
              {MORE_ITEMS.map((item) => {
                const active = isActive(item, pathname);
                const Icon = item.icon;
                const soon = COMING_SOON.has(item.href);

                if (soon) {
                  return (
                    <span
                      key={item.href}
                      aria-disabled="true"
                      className="flex flex-col items-center gap-1.5 rounded-[15px] p-3 text-center text-xs font-medium relative"
                      style={{ opacity: 0.4, cursor: 'not-allowed', background: '#f3f4f6', color: '#aaa' }}
                    >
                      <Icon size={20} aria-hidden="true" />
                      <span className="leading-tight">{item.label}</span>
                      <span
                        className="absolute top-1.5 right-1.5 text-[9px] font-bold uppercase px-1 py-0.5 rounded-full"
                        style={{ background: '#e5e7eb', color: '#9ca3af' }}
                      >
                        Bientôt
                      </span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={clsx(
                      'flex flex-col items-center gap-1.5 rounded-[15px] p-3 text-center text-xs font-medium transition-colors',
                      active
                        ? 'bg-[#DFF1F9] text-[#6EC1E4]'
                        : 'bg-gray-50 text-[#2E1D21] hover:bg-[#DFF1F9] hover:text-[#6EC1E4]'
                    )}
                  >
                    <Icon size={20} aria-hidden="true" />
                    <span className="leading-tight">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex flex-col items-center gap-1.5 rounded-[15px] p-3 text-center text-xs font-medium bg-gray-50 transition-colors hover:bg-red-50"
                style={{ color: '#FF8C94' }}
              >
                <LogOut size={20} aria-hidden="true" />
                <span className="leading-tight">Déconnexion</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
