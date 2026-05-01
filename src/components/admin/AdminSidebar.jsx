"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAdminSidebar } from "@/context/AdminSidebarContext";
import styles from "@/styles/adminSidebar.module.css";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useAdminSidebar();
  const menuRef = useRef(null);
  const [counts, setCounts] = useState({ rentalPreparing: 0, exchangePending: 0, refillPending: 0 });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.rentalPreparing !== undefined) {
          setCounts({
            rentalPreparing: data.rentalPreparing,
            exchangePending: data.exchangePending,
            refillPending: data.refillPending ?? 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) close();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => { close(); }, [pathname]);

  const isActive = (href) => {
    if (href === "/admin" && pathname === "/admin") return true;
    if (href !== "/admin" && pathname.startsWith(href.split("?")[0])) return true;
    return false;
  };

  return (
    <div className={styles.sidebarWrapper}>
      {isOpen && <div className={styles.overlay} onClick={close} />}

      <aside ref={menuRef} className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>🧸</span>
          <span className={styles.sidebarTitle}>Admin</span>
          <button className={styles.closeButton} onClick={close} aria-label="Fermer le menu">
            <X size={20} color="#2E1D21" />
          </button>
        </div>

        <nav className={styles.navGroup}>
          <p className={styles.navGroupLabel}>Tableau de bord</p>
          <Link href="/admin" className={`${styles.navItem} ${pathname === "/admin" ? styles.navItemActive : ""}`}>
            <span className={styles.navIcon}>📊</span>
            Vue d'ensemble
          </Link>
        </nav>

        <nav className={styles.navGroup}>
          <p className={styles.navGroupLabel}>Raccourcis rapides</p>
          <Link href="/admin/orders?type=RENTAL" className={`${styles.navItem} ${styles.navItemRental} ${pathname === "/admin/orders" ? styles.navItemActive : ""}`}>
            <span className={styles.navIcon}>📦</span>
            <span className={styles.navLabel}>Location</span>
            {counts.rentalPreparing > 0 && <span className={`${styles.badge} ${styles.badgeRed}`}>{counts.rentalPreparing}</span>}
          </Link>
          <Link href="/admin/orders?type=EXCHANGE" className={`${styles.navItem} ${styles.navItemExchange}`}>
            <span className={styles.navIcon}>🔄</span>
            <span className={styles.navLabel}>Boîte Navette</span>
            {counts.exchangePending > 0 && <span className={`${styles.badge} ${styles.badgeOrange}`}>{counts.exchangePending}</span>}
          </Link>
          <Link href="/admin/orders?type=ADOPTION" className={`${styles.navItem} ${styles.navItemAdoption}`}>
            <span className={styles.navIcon}>💜</span>
            <span className={styles.navLabel}>Adoption</span>
          </Link>
          <Link href="/admin/orders?type=REFILL" className={`${styles.navItem} ${styles.navItemRefill}`}>
            <span className={styles.navIcon}>🎁</span>
            <span className={styles.navLabel}>Réassort</span>
            {counts.refillPending > 0 && <span className={`${styles.badge} ${styles.badgeGreen}`}>{counts.refillPending}</span>}
          </Link>
        </nav>

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

        <nav className={styles.navGroup}>
          <p className={styles.navGroupLabel}>Catalogue</p>
          <Link href="/admin/products" className={`${styles.navItem} ${isActive("/admin/products") ? styles.navItemActive : ""}`}>
            <span className={styles.navIcon}>🧩</span>
            Gestion Produits
          </Link>
        </nav>

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

        <nav className={styles.navGroup}>
          <p className={styles.navGroupLabel}>Blogs</p>
          <Link href="/admin/blogs" className={`${styles.navItem} ${isActive("/admin/blogs") ? styles.navItemActive : ""}`}>
            <span className={styles.navIcon}>📝</span>
            Gestion Blogs
          </Link>
        </nav>
      </aside>
    </div>
  );
}
