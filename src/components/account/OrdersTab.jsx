/* src/components/account/OrdersTab.jsx */
//gère  l'état de la requête et la boucle principale.
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import OrderCard from './OrderCard';
import '@/styles/orders.css'; // Import du CSS natif

export default function OrdersTab() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders/user/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des commandes :", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchOrders();
    }
  }, [session]);

  if (loading) return <div className="loader-message">Chargement de vos commandes...</div>;

  if (orders.length === 0) {
    return (
      <div className="tab-content empty-state">
        <h3>Aucune commande pour le moment 📦</h3>
        <p>Découvrez notre collection de jouets pour trouver votre bonheur !</p>
        <Link href="/bibliotheque" className="btn-primary btn-pill">
          Voir la bibliothèque
        </Link>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <h2 className="section-title">Mes Commandes</h2>
      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}