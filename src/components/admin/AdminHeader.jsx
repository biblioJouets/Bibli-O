"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAdminSidebar } from "@/context/AdminSidebarContext";
import styles from "@/styles/adminHeader.module.css";

const ROUTE_LABELS = {
  "/admin": "Vue d'ensemble",
  "/admin/orders": "Logistique & Commandes",
  "/admin/products": "Gestion Produits",
  "/admin/clients": "Comptes Clients",
};

function getBreadcrumb(pathname) {
  if (pathname === "/admin") return [{ label: "Vue d'ensemble", href: "/admin" }];
  const label = ROUTE_LABELS[pathname];
  return [
    { label: "Admin", href: "/admin" },
    { label: label ?? "Page", href: pathname },
  ];
}

export default function AdminHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { open } = useAdminSidebar();
  const breadcrumb = getBreadcrumb(pathname);
  const adminName = session?.user?.name ?? session?.user?.email ?? "Admin";

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.burgerButton}
          onClick={open}
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} color="#2E1D21" />
        </button>
        <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
          {breadcrumb.map((item, i) => (
            <span key={item.href} className={styles.breadcrumbItem}>
              {i > 0 && <span className={styles.breadcrumbSep}>/</span>}
              <span className={i === breadcrumb.length - 1 ? styles.breadcrumbCurrent : styles.breadcrumbLink}>
                {item.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.adminBadge}>
          <span className={styles.adminAvatar}>🧸</span>
          <span className={styles.adminName}>{adminName}</span>
          <span className={styles.adminRole}>Admin</span>
        </div>
        <Link href="/" className={styles.btnHome} title="Retour à l'accueil">
          Accueil
        </Link>
        <button
          className={styles.btnLogout}
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Se déconnecter"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
