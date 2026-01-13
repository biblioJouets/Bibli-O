'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, Printer, CheckCircle, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import '@/styles/adminOrders.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATUS_DEFINITIONS = {
    PENDING: { label: "En attente", colorClass: "status-yellow", icon: Clock },
    PREPARING: { label: "En préparation", colorClass: "status-blue", icon: Package },
    SHIPPED: { label: "Expédié / Livré", colorClass: "status-green", icon: Truck },
    RETURNED: { label: "Retourné", colorClass: "status-purple", icon: CheckCircle },
    CANCELLED: { label: "Annulé", colorClass: "status-red", icon: null },
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedData);
      }
    } catch (error) {
      console.error("Erreur chargement commandes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const confirmChange = confirm(`Changer le statut vers : ${STATUS_DEFINITIONS[newStatus]?.label} ?`);
    if (!confirmChange) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      
      if (res.ok) {
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      alert("Erreur réseau");
    }
  };

  const isMondialRelay = (order) => {
    return order.mondialRelayPointId && order.mondialRelayPointId !== 'DOMICILE';
  };

  // --- FONCTION POUR GÉNÉRER L'ID COMPLET (CMD + Date + ID) ---
  const formatOrderId = (order) => {
    const date = new Date(order.createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
    const year = String(date.getFullYear()).slice(-2);
    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    
    // Format : CMD JJMMAAHHMM - ID
    return `CMD${day}${month}${year}${hour}${min}-${order.id}`;
  };

  // --- IMPRESSION FICHE COMPLÈTE (Restaurée) ---
  const printOrder = (order) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    
    // On recrée tout le HTML détaillé
    const content = `
      <html>
        <head>
          <title>Fiche Préparation - #${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { border-bottom: 2px solid #333; padding-bottom: 10px; font-size: 24px; }
            .header-info { font-size: 14px; margin-bottom: 20px; color: #555; }
            .box { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .box h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .product { display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 8px 0; }
            .strong { font-weight: bold; font-size: 1.1em; }
            .mr-code { font-size: 1.4em; font-weight: bold; color: #E91E63; display: block; margin-top: 5px; }
            .qty { font-weight: bold; background: #eee; padding: 2px 8px; border-radius: 4px; margin-right: 10px; }
            .footer { margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>📦 Fiche de Préparation - #${order.id}</h1>
          <div class="header-info">
             Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')} <br/>
             Référence complète : <strong>${formatOrderId(order)}</strong>
          </div>
          
          <div class="box">
            <h3>👤 Client</h3>
            <p class="strong">${order.Users?.firstName || ''} ${order.Users?.lastName || ''}</p>
            <p>Email: ${order.Users?.email}</p>
            <p>Tél Client: ${order.Users?.phone || 'Non renseigné'}</p>
          </div>

          <div class="box">
            <h3>📍 Livraison : ${isMondialRelay(order) ? 'MONDIAL RELAY' : 'DOMICILE'}</h3>
            <p class="strong">${order.shippingName || 'Nom destinataire manquant'}</p>
            <p>${order.shippingAddress || ''}</p>
            <p>${order.shippingZip || ''} ${order.shippingCity || ''}</p>
            <p><strong>Tél Livraison: ${order.shippingPhone || 'Non renseigné'}</strong></p>
            ${isMondialRelay(order) ? `<p>Code Point Relais : <span class="mr-code">${order.mondialRelayPointId}</span></p>` : ''}
          </div>

          <div class="box">
            <h3>🧸 Articles à préparer (${order.OrderProducts.length})</h3>
            ${order.OrderProducts.map(op => `
                <div class="product">
                    <span>
                      <span class="qty">${op.quantity || 1}x</span> ${op.Products.name}
                    </span>
                    <span>Ref: ${op.Products.reference || 'N/A'}</span>
                </div>
            `).join('')}
          </div>

          <div class="footer">
             Fiche générée le ${new Date().toLocaleString()} par BiblioJouets
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  if (loading) return <div className="loading-state">Chargement des commandes...</div>;

  return (
    <div className="admin-container">
      <Link href="/admin" className="back-link">
        <ArrowLeft size={20} /> Retour Dashboard
      </Link>

      <div className="page-header">
        <h1>📦 Gestion des Commandes</h1>
        <span className="order-count">{orders.length}</span>
      </div>

      <div className="orders-grid">
        {orders.map((order) => {
           const statusInfo = STATUS_DEFINITIONS[order.status] || STATUS_DEFINITIONS.PENDING;
           const StatusIcon = statusInfo.icon || Clock;
           
           return (
            <div key={order.id} className="order-card">
              
              <div className="card-header">
                <div className="header-left">
                  <div className="order-title-row">
                    {/* UTILISATION DE LA NOUVELLE FONCTION DE FORMATAGE */}
                    <span className="order-id">{formatOrderId(order)}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  <div className="order-meta-row">
                    <span className={`status-badge ${statusInfo.colorClass}`}>
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </span>
                    <span className="order-price">• {order.totalAmount}€</span>
                  </div>
                </div>

                <div className="actions-ipt">
                  <button onClick={() => printOrder(order)} className="btn-print">
                    <Printer size={18} /> Fiche
                  </button>
                  
                  <div className="select-wrapper">
                    <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="status-select"
                    >
                        {Object.keys(STATUS_DEFINITIONS).map(statusKey => (
                            <option key={statusKey} value={statusKey}>
                                {STATUS_DEFINITIONS[statusKey].label}
                            </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card-body">
                
                <div className="info-col">
                    <h4>👤 Client</h4>
                    <p className="highlight">{order.Users?.firstName} {order.Users?.lastName}</p>
                    <p className="sub-text">{order.Users?.email}</p>
                    <p className="sub-text">{order.Users?.phone}</p>
                </div>

                <div className="info-col">
                    <h4><MapPin size={16}/> Livraison</h4>
                    <div className="delivery-box">
                        <p className="highlight">{order.shippingName}</p>
                        <p>{order.shippingAddress}</p>
                        <p>{order.shippingZip} {order.shippingCity}</p>
                        {isMondialRelay(order) ? (
                            <p className="mr-point">Point Relais: <strong>{order.mondialRelayPointId}</strong></p>
                        ) : (
                            <p className="domicile-tag">Domicile</p>
                        )}
                    </div>
                </div>

                <div className="info-col">
                    <h4>🧸 Contenu ({order.OrderProducts.length})</h4>
                    <ul className="products-list">
                        {order.OrderProducts.map((op, idx) => (
                            <li key={idx}>
                                <span className="qty-badge">{op.quantity || 1}</span>
                                {op.Products.name}
                            </li>
                        ))}
                    </ul>
                </div>

              </div>
            </div>
           )
        })}
      </div>
    </div>
  );
}