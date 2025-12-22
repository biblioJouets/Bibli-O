'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MonComptePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' ou 'infos'
  
  // États pour les données
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Redirection si non connecté
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/connexion');
  }, [status, router]);

  // Chargement des données
  useEffect(() => {
    if (session?.user?.id) {
      fetchData(session.user.id);
    }
  }, [session]);

  const fetchData = async (userId) => {
    try {
      // 1. Récupérer les infos user à jour
      const resUser = await fetch(`/api/users/${userId}`);
      const userData = await resUser.json();
      if (resUser.ok) setProfile(userData);

      // 2. Récupérer l'historique des commandes (Il faudra créer cette route API si elle n'existe pas, voir note plus bas)
      // Pour l'instant, on simule ou on appelle une route dédiée
      // Note: Idéalement créer route /api/orders/user/[id]
      const resOrders = await fetch(`/api/orders/user/${userId}`); 
      if (resOrders.ok) {
        const ordersData = await resOrders.json();
        setOrders(ordersData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        setMessage('✅ Profil mis à jour avec succès !');
      } else {
        setMessage('❌ Erreur lors de la mise à jour.');
      }
    } catch (error) {
      setMessage('❌ Erreur technique.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper pour les couleurs de statut
  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PREPARING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      ACTIVE: "bg-green-100 text-green-800", // En location
      RETURNING: "bg-orange-100 text-orange-800",
      COMPLETED: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100";
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="container mt-10 mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-[#2E1D21]">Mon Espace Client</h1>

      {/* Navigation Onglets */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-6 font-semibold ${activeTab === 'orders' ? 'border-b-4 border-[#FF8C94] text-[#2E1D21]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          📦 Mes Commandes
        </button>
        <button
          onClick={() => setActiveTab('infos')}
          className={`pb-4 px-6 font-semibold ${activeTab === 'infos' ? 'border-b-4 border-[#6EC1E4] text-[#2E1D21]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          👤 Mes Informations
        </button>
      </div>

      {/* CONTENU : Onglet Commandes */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-600 mb-4">Vous n'avez pas encore effectué de location.</p>
              <Link href="/bibliotheque" className="btn btn-primary">Découvrir les jouets</Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white border rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">Commande #{order.id} du {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">{order.totalAmount}€</p>
                    
                    {/* Lien Suivi Mondial Relay (si dispo) */}
                    {order.trackingUrl && (
                      <a href={order.trackingUrl} target="_blank" className="text-sm text-blue-600 hover:underline block mt-1">
                        📍 Suivre mon colis
                      </a>
                    )}
                  </div>
                </div>

                {/* Produits de la commande */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Jouets loués :</h4>
                  <ul className="space-y-2">
                    {order.OrderProducts.map((op) => (
                      <li key={op.ProductId} className="flex items-center text-sm text-gray-700">
                        <span className="mr-2">🧸</span> {op.Products.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Zone Retour (Si actif) */}
                {(order.status === 'ACTIVE' || order.status === 'SHIPPED') && (
                  <div className="mt-6 bg-[#FFFAF4] p-4 rounded-md border border-orange-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#2E1D21]">Retour prévu le : {order.rentalEndDate ? new Date(order.rentalEndDate).toLocaleDateString() : 'Date à venir'}</p>
                      <p className="text-sm text-gray-600">L'étiquette retour est dans votre colis.</p>
                    </div>
                    {order.returnLabelUrl && (
                      <a href={order.returnLabelUrl} target="_blank" className="btn btn-outline-blue text-sm">
                        📄 Télécharger l'étiquette (PDF)
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* CONTENU : Onglet Infos */}
      {activeTab === 'infos' && (
        <form onSubmit={handleUpdateProfile} className="max-w-lg bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold mb-6">Modifier mon profil</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Email (Non modifiable)</label>
            <input type="email" value={profile.email} disabled className="w-full p-2 border bg-gray-100 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-2">Prénom</label>
              <input 
                type="text" 
                value={profile.firstName || ''} 
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Nom</label>
              <input 
                type="text" 
                value={profile.lastName || ''} 
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Téléphone (Pour suivi colis)</label>
            <input 
              type="tel" 
              value={profile.phone || ''} 
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6EC1E4]"
            />
          </div>

          {message && <div className={`mb-4 p-2 rounded text-center ${message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

          <button type="submit" disabled={isSaving} className="btn btn-primary w-full">
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      )}
    </div>
  );
}