"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/styles/adminSidebar.module.css";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ rentalPreparing: 0, exchangePending: 0 });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.rentalPreparing !== undefined) {
          setCounts({
            rentalPreparing: data.rentalPreparing,
            exchangePending: data.exchangePending,
          });
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (href) => {
    if (href === "/admin" && pathname === "/admin") return true;
    if (href !== "/admin" && pathname.startsWith(href.split("?")[0])) return true;
    return false;
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo / titre */}
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarLogo}>🧸</span>
        <span className={styles.sidebarTitle}>Admin</span>
      </div>

      {/* TABLEAU DE BORD */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Tableau de bord</p>
        <Link
          href="/admin"
          className={`${styles.navItem} ${pathname === "/admin" ? styles.navItemActive : ""}`}
        >
          <span className={styles.navIcon}>📊</span>
          Vue d'ensemble
        </Link>
      </nav>

      {/* RACCOURCIS RAPIDES */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Raccourcis rapides</p>

        {/* Location */}
        <Link
          href="/admin/orders?type=RENTAL"
          className={`${styles.navItem} ${styles.navItemRental} ${
            pathname === "/admin/orders" ? styles.navItemActive : ""
          }`}
        >
          <span className={styles.navIcon}>📦</span>
          <span className={styles.navLabel}>Location</span>
          {counts.rentalPreparing > 0 && (
            <span className={`${styles.badge} ${styles.badgeRed}`}>
              {counts.rentalPreparing}
            </span>
          )}
        </Link>

        {/* Boîte Navette */}
        <Link
          href="/admin/orders?type=EXCHANGE"
          className={`${styles.navItem} ${styles.navItemExchange}`}
        >
          <span className={styles.navIcon}>🔄</span>
          <span className={styles.navLabel}>Boîte Navette</span>
          {counts.exchangePending > 0 && (
            <span className={`${styles.badge} ${styles.badgeOrange}`}>
              {counts.exchangePending}
            </span>
          )}
        </Link>

        {/* Adoption */}
        <Link
          href="/admin/orders?type=ADOPTION"
          className={`${styles.navItem} ${styles.navItemAdoption}`}
        >
          <span className={styles.navIcon}>💜</span>
          <span className={styles.navLabel}>Adoption</span>
        </Link>
      </nav>

      {/* LOGISTIQUE */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Logistique</p>
        <Link href="/admin/orders?status=PREPARING" className={styles.navItem}>
          <span className={styles.navIcon}>🚚</span>
          Expéditions
        </Link>
        <Link href="/admin/orders?status=RETURNING" className={styles.navItem}>
          <span className={styles.navIcon}>↩️</span>
          Retours
        </Link>
      </nav>

      {/* CATALOGUE */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Catalogue</p>
        <Link
          href="/admin/products"
          className={`${styles.navItem} ${isActive("/admin/products") ? styles.navItemActive : ""}`}
        >
          <span className={styles.navIcon}>🧩</span>
          Gestion Produits
        </Link>
      </nav>

      {/* CLIENTS */}
      <nav className={styles.navGroup}>
        <p className={styles.navGroupLabel}>Clients</p>
        <Link href="/admin/clients" className={`${styles.navItem} ${styles.navItemDisabled}`}>
          <span className={styles.navIcon}>👥</span>
          Comptes clients
          <span className={styles.comingSoon}>bientôt</span>
        </Link>
        <Link href="/admin/support" className={`${styles.navItem} ${styles.navItemDisabled}`}>
          <span className={styles.navIcon}>💬</span>
          Support
          <span className={styles.comingSoon}>bientôt</span>
        </Link>
      </nav>
    </aside>
  );
}
