'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, Printer, CheckCircle, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATUS_LABELS = {
    PENDING: { label: "En attente de préparation", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    PREPARING: { label: "En cours de préparation", color: "bg-blue-100 text-blue-800", icon: Package },
    SHIPPED: { label: "Expédié / Livré", color: "bg-green-100 text-green-800", icon: Truck },
    RETURNED: { label: "Retourné", color: "bg-purple-100 text-purple-800", icon: CheckCircle },
    CANCELLED: { label: "Annulé", color: "bg-red-100 text-red-800", icon: null },
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Erreur chargement commandes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!confirm(`Passer la commande #${orderId} en statut : ${newStatus} ?`)) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) fetchOrders();
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  // ✅ CORRECTION LOGIQUE : Est-ce vraiment un point relais ?
  const isMondialRelay = (order) => {
    return order.mondialRelayPointId && order.mondialRelayPointId !== 'DOMICILE';
  };

  const printOrder = (order) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    
    const content = `
      <html>
        <head>
          <title>Fiche Préparation - Commande #${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
            .box { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .product { display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 5px 0; }
            .strong { font-weight: bold; font-size: 1.1em; }
            .mr-code { font-size: 1.5em; font-weight: bold; color: #E91E63; }
            .qty { font-weight: bold; background: #eee; padding: 2px 6px; borderRadius: 4px; }
          </style>
        </head>
        <body>
          <h1>📦 Fiche de Préparation - #${order.id}</h1>
          <p>Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
          
          <div class="box">
            <h3>👤 Client</h3>
            <p><strong>${order.Users?.firstName || ''} ${order.Users?.lastName || ''}</strong></p>
            <p>Email: ${order.Users?.email}</p>
            <p>Tél Client: ${order.Users?.phone || 'Non renseigné'}</p>
          </div>

          <div class="box">
            <h3>📍 Livraison : ${isMondialRelay(order) ? 'MONDIAL RELAY' : 'DOMICILE'}</h3>
            <p class="strong">${order.shippingName || 'Nom destinataire manquant'}</p>
            <p>${order.shippingAddress || ''}</p>
            <p>${order.shippingZip || ''} ${order.shippingCity || ''}</p>
            <p><strong>Tél Livraison: ${order.shippingPhone || 'Non renseigné'}</strong></p>
            ${isMondialRelay(order) ? `<p>Code Point Relais : <br/><span class="mr-code">${order.mondialRelayPointId}</span></p>` : ''}
          </div>

          <div class="box">
            <h3>🧸 Articles à préparer (${order.OrderProducts.length})</h3>
            ${order.OrderProducts.map(op => `
                <div class="product">
                    <span>
                      <span class="qty">${op.quantity || 1}x</span> ${op.Products.name}
                    </span>
                    <span>Ref: ${op.Products.reference || op.Products.id}</span>
                </div>
            `).join('')}
          </div>

          <div style="margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; text-align: center;">
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

  if (loading) return <div className="p-20 text-center text-gray-500">Chargement des commandes...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px' }}>
      <Link href="/admin" className="flex items-center text-gray-500 hover:text-black mb-6">
        <ArrowLeft size={20} className="mr-2"/> Retour Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-[#2E1D21]">
        📦 Gestion des Commandes
        <span className="text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-normal">
          {orders.length}
        </span>
      </h1>

      <div className="grid gap-6">
        {orders.map((order) => {
           const StatusIcon = STATUS_LABELS[order.status]?.icon || Clock;
           
           return (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-[#2E1D21]">Commande #{order.id}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${STATUS_LABELS[order.status]?.color || 'bg-gray-100'}`}>
                      <StatusIcon size={16} />
                      {STATUS_LABELS[order.status]?.label || order.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      • {order.totalAmount}€
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => printOrder(order)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <Printer size={18} /> Fiche Prépa
                  </button>

                  {order.status === 'PENDING' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'SHIPPED')} className="flex items-center gap-2 px-4 py-2 bg-[#2E1D21] text-white rounded-lg hover:bg-opacity-90 transition-colors">
                        <Truck size={18} /> Marquer Expédié
                    </button>
                  )}
                   {order.status === 'SHIPPED' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'RETURNED')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <CheckCircle size={18} /> Marquer Retourné
                    </button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">👤 Client</h4>
                    <p className="text-gray-600">{order.Users?.firstName} {order.Users?.lastName}</p>
                    <p className="text-gray-500 text-sm">{order.Users?.email}</p>
                    <p className="text-gray-500 text-sm">{order.Users?.phone}</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin size={16}/> 
                        {/* ✅ CORRECTION ICI : Affichage dynamique */}
                        Livraison : {isMondialRelay(order) ? 'Point Relais' : 'Domicile'}
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                        <p className="font-semibold">{order.shippingName}</p>
                        <p>{order.shippingAddress}</p>
                        <p>{order.shippingZip} {order.shippingCity}</p>
                        {order.shippingPhone && (
                            <p className="mt-2 text-gray-500 flex items-center gap-1">
                                <Phone size={12}/> {order.shippingPhone}
                            </p>
                        )}
                        {/* ✅ CORRECTION ICI : N'affiche le point relais que si ce n'est PAS un domicile */}
                        {isMondialRelay(order) && (
                            <p className="mt-2 text-blue-600 font-bold">Ref Point: {order.mondialRelayPointId}</p>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">🧸 Contenu du colis</h4>
                    <ul className="space-y-2">
                        {order.OrderProducts.map((op, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-100 p-2 rounded">
                                {/* ✅ CORRECTION ICI : Affiche la vraie quantité */}
                                <span className="bg-[#EAF7FC] text-[#0077b6] w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
                                  {op.quantity || 1}
                                </span>
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