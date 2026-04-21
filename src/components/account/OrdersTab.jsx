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
  const [exchangeGuard, setExchangeGuard] = useState({ canExchange: true, reason: null });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (userId) => {
    try {
      const res = await fetch(`/api/orders/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setExchangeGuard(data.exchangeGuard);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) fetchOrders(session.user.id);
  }, [session]);

  // Refetch quand l'onglet redevient visible (retour depuis Stripe, confirmation, etc.)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user?.id) {
        fetchOrders(session.user.id);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <OrderCard
            key={order.id}
            order={order}
            canExchange={exchangeGuard.canExchange}
            canExchangeReason={exchangeGuard.reason}
            onRefresh={() => fetchOrders(session.user.id)}
          />
        ))}
      </div>
    </div>
  );
}