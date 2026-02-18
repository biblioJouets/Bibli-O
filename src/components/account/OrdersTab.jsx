/* src/components/account/OrdersTab.jsx */
'use client';

import { useState, useEffect, } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrdersTab() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/user/${session.user.id}`);
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Chargement des commandes...</p>;

  if (orders.length === 0) {
    return (
      <div className="tab-content empty-state">
        <h3>Aucune commande pour le moment 📦</h3>
        <p>Découvrez notre collection de jouets !</p>
        <Link href="/bibliotheque" className="btn-primary">
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
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-date">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className={`order-status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="order-body">
              <div className="order-images">
                {(order.items || order.OrderItems || []).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="order-img-wrapper">
                    <Image
                      src={item.product?.images?.[0] || '/assets/box_bj.png'}
                      alt="Produit"
                      width={50}
                      height={50}
                      className="order-thumb"
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="more-items">+{order.items.length - 3}</span>
                )}
              </div>
              <div className="order-info">
                <span className="total-price">{order.totalAmount}€</span>
                <Link href={`/confirmation-commande?id=${order.id}`} className="btn-details">
                  Détails
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}