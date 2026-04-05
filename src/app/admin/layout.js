import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import styles from "@/styles/adminLayout.module.css";

export const metadata = {
  title: "Administration — Bibli'O Jouets",
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminWrapper}>
      <AdminSidebar />
      <div className={styles.adminContent}>
        <AdminHeader />
        <main className={styles.adminMain}>
          {children}
        </main>
      </div>
    </div>
  );
}
