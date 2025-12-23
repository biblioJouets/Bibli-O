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

  //states Adresses
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    postalCode: '',
    city: '',
    country: 'France'
  });

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
      setLoading(true); // On affiche le chargement
      
      // 1. Récupérer les infos user
      const resUser = await fetch(`/api/users/${userId}`);
      const userData = await resUser.json();

      if (resUser.ok) {
        // 👇 FIX : On vérifie si les données sont dans 'userData' ou 'userData.data'
        // Cela gère les deux cas possibles de ton API
        const userProfile = userData.data || userData;
        
        console.log("Données reçues :", userProfile); // Pour débugger si besoin
        setProfile(userProfile);
      }

      // 2. Récupérer l'historique des commandes
      const resOrders = await fetch(`/api/orders/user/${userId}`); 
      if (resOrders.ok) {
        const ordersData = await resOrders.json();
        // Pareil pour les commandes, parfois c'est dans .data
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData.data || []);
      }
    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };
const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${session.user.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress)
      });

      if (res.ok) {
        // Si succès, on recharge les données pour voir la nouvelle adresse
        fetchData(session.user.id); 
        setShowAddressForm(false); // On ferme le formulaire
        setNewAddress({ street: '', postalCode: '', city: '', country: 'France' }); // Reset
        setMessage('✅ Adresse ajoutée !');
      } else {
        setMessage('❌ Erreur lors de l\'ajout.');
      }
    } catch (err) {
      console.error(err);
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
        <div className="space-y-6">
          
          {/* --- 1. EN-TÊTE PROFIL (Avatar + Résumé) --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-[var(--col-gold)] flex items-center justify-center text-black text-2xl font-bold shadow-md">
              {profile.firstName?.[0] || '?'}{profile.lastName?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2E1D21]">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-500 flex items-center gap-2 text-sm mt-1">
                {/* On gère le cas où createdAt n'est pas encore chargé */}
                📅 Membre depuis le {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR') : '...'}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Compte Vérifié
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- 2. INFORMATIONS PERSONNELLES --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#2E1D21]">
                  ✏️ Mes coordonnées
                </h3>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prénom</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={profile.firstName || ''}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#6EC1E4] focus:ring-1 focus:ring-[#6EC1E4] outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={profile.lastName || ''}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#6EC1E4] focus:ring-1 focus:ring-[#6EC1E4] outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Non modifiable)</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed">
                    ✉️ {profile.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Téléphone</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400">📞</span>
                    <input 
                      type="tel" 
                      name="phone"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:border-[#6EC1E4] focus:ring-1 focus:ring-[#6EC1E4] outline-none transition"
                    />
                  </div>
                </div>

                {message && (
                  <div className={`p-2 rounded text-center text-sm ${message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                  </div>
                )}

                <button type="submit" disabled={isSaving} className="w-full mt-4 btn btn-primary py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all">
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </form>
            </div>

            {/* --- 3. CARNET D'ADRESSES & SÉCURITÉ --- */}
            <div className="space-y-6">
              
              {/* Bloc Adresses */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-[#2E1D21]">
                  📍 Mes adresses
                </h3>
                
                {/* LISTE DES ADRESSES EXISTANTES */}
                {profile.Addresses && profile.Addresses.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {profile.Addresses.map((addr) => (
                      <div key={addr.id} className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[#2E1D21]">{addr.street}</p>
                          <p>{addr.postalCode} {addr.city}</p>
                          <p className="text-gray-500 text-xs mt-1">{addr.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !showAddressForm && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4">
                      <p className="text-sm text-gray-500">Aucune adresse enregistrée</p>
                    </div>
                  )
                )}
                
                {/* FORMULAIRE D'AJOUT (Masqué par défaut) */}
                {showAddressForm ? (
                  <form onSubmit={handleAddAddress} className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-sm mb-3">Nouvelle adresse</h4>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Numéro et rue" 
                        required
                        className="w-full p-2 border rounded text-sm"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Code Postal" 
                          required
                          className="w-full p-2 border rounded text-sm"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder="Ville" 
                          required
                          className="w-full p-2 border rounded text-sm"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button 
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-200 rounded"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit"
                          className="px-3 py-1 text-sm bg-[#6EC1E4] text-white rounded hover:bg-[#5aaac9]"
                        >
                          Valider
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="w-full mt-2 text-sm text-[#6EC1E4] font-bold hover:underline flex items-center justify-center gap-1"
                  >
                    + Ajouter une nouvelle adresse
                  </button>
                )}
              </div>
            

            </div>
          </div>
        </div>
      )}
    </div>
  );
}