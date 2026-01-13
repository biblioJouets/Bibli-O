/* src/app/mon-compte/page.js */
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
// Import du fichier CSS dédié
import '@/styles/monCompte.css';

export default function MonComptePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("Statut Session:", status);
  console.log("Données Session:", session);
  
  // Onglet actif par défaut
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' ou 'infos'
  
  // États des données
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  
  // États Adresse
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    postalCode: '',
    city: '',
    country: 'France'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Redirection si non connecté
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/connexion');
  }, [status, router]);

  // Chargement initial
  useEffect(() => {
    if (session?.user?.id) {
      // Charger le profil (mockup ou fetch réel si vous avez l'endpoint user)
      setProfile({
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ')[1] || '',
        email: session.user.email || '',
        phone: '' // À récupérer via API si dispo
      });

      // Charger les commandes
      fetchOrders(session.user.id);
    }
  }, [session]);

  const fetchOrders = async (userId) => {
    try {
      const res = await fetch(`/api/orders/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Erreur chargement commandes", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // --- LOGIQUE COMMANDES ---

  const formatOrderId = (order) => {
    if (!order.createdAt) return `#${order.id}`;
    const date = new Date(order.createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // Format : CMDjjmmaahhmm-ID
    return `CMD${day}${month}${year}${hours}${minutes}-${order.id}`;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: { label: 'En attente de préparation', className: 'status-pending' },
      PREPARING: { label: 'En cours de préparation', className: 'status-preparing' },
      SHIPPED: { label: 'Expédiée', className: 'status-shipped' },
      ACTIVE: { label: 'Box reçue (Location en cours)', className: 'status-active' },
      RETURNING: { label: 'Retour en cours', className: 'status-returning' },
      RETURNED: { label: 'Bien retournée', className: 'status-returned' },
      CANCELLED: { label: 'Annulée', className: 'status-cancelled' },
    };
    return statusMap[status] || { label: status, className: 'status-default' };
  };

  // --- HANDLERS PROFIL ---

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    // Simulation API update
    setTimeout(() => {
        setIsSaving(false);
        setMessage('Profil mis à jour avec succès !');
    }, 1000);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    // Logique d'enregistrement d'adresse ici
    setShowAddressForm(false);
  };

  if (status === 'loading') return <div className="loader-container"><div className="loader">Chargement...</div></div>;

  return (
    <div className="account-page">
      <div className="account-container">
        
        {/* En-tête avec Logout */}
        <div className="account-header-top">
            <h1>Mon Compte</h1>
            <div className="user-welcome">
                <span>{session?.user?.email}</span>
                
                
            </div>
        </div>

        {/* Navigation Onglets */}
        <div className="account-tabs">
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Mes Commandes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'infos' ? 'active' : ''}`}
            onClick={() => setActiveTab('infos')}
          >
            👤 Mes Informations
          </button>
        </div>

        {/* Contenu - Onglet COMMANDES */}
        {activeTab === 'orders' && (
          <div className="tab-content fade-in">
            {loadingOrders ? (
                <p>Chargement de vos commandes...</p>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <p>Vous n'avez pas encore de box active.</p>
                    <Link href="/abonnements" className="btn-primary">Je découvre les formules</Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => {
                        const statusInfo = getStatusLabel(order.status);
                        return (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-ref-group">
                                        <span className="order-ref">{formatOrderId(order)}</span>
                                        <span className="order-date">du {new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`status-badge ${statusInfo.className}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>

                                <div className="order-body">
                                    {/* Galerie images produits */}
                                    <div className="order-products">
                                        {order.OrderProducts?.map((op) => (
                                            <div key={op.Products.id} className="product-thumb">
                                                <Image 
                                                    src={op.Products.images?.[0] || '/assets/toys/jouet1.jpg'} 
                                                    alt={op.Products.name} 
                                                    width={60} 
                                                    height={60} 
                                                    className="thumb-img"
                                                />
                                                {op.quantity > 1 && <span className="qty-pill">x{op.quantity}</span>}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="order-summary">
                                        <p><strong>Total :</strong> {order.totalAmount} € / mois</p>
<p>
  <strong>Livraison :</strong> {
    (order.mondialRelayPointId && order.mondialRelayPointId !== 'DOMICILE') 
    ? `Point Relais (${order.mondialRelayPointId})` 
    : 'Domicile'
  }
</p>                                    </div>
                                </div>

                                <div className="order-footer">
                                     {/* Boutons d'actions conditionnels */}
                                     {order.trackingUrl && (
                                         <a href={order.trackingUrl} target="_blank" className="btn-action btn-track">
                                            🚚 Suivre mon colis
                                         </a>
                                     )}
                                     <button className="btn-action btn-secondary" disabled>📄 Facture</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
          </div>
        )}

        {/* Contenu - Onglet INFORMATIONS */}
        {activeTab === 'infos' && (
          <div className="tab-content fade-in">
            <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Prénom</label>
                        <input 
                            type="text" 
                            value={profile.firstName}
                            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nom</label>
                        <input 
                            type="text" 
                            value={profile.lastName}
                            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={profile.email}
                            disabled
                            className="input-disabled"
                        />
                    </div>
                    <div className="form-group">
                        <label>Téléphone</label>
                        <input 
                            type="tel" 
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        />
                    </div>
                </div>

                {message && <div className="success-message">{message}</div>}

                <div className="form-actions">
                    <button type="submit" disabled={isSaving} className="btn-primary">
                        {isSaving ? 'Enregistrement...' : 'Enregistrer mes modifications'}
                    </button>
                </div>
            </form>

            <hr className="divider" />

            {/* Section Adresse */}
            <div className="address-section">
                <h3>Mes Adresses de livraison</h3>
                
                {showAddressForm ? (
                    <form onSubmit={handleAddressSubmit} className="address-form-box">
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Rue</label>
                                <input 
                                    type="text" 
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Code Postal</label>
                                <input 
                                    type="text" 
                                    value={newAddress.postalCode}
                                    onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ville</label>
                                <input 
                                    type="text" 
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="form-actions right">
                            <button type="button" onClick={() => setShowAddressForm(false)} className="btn-text">
                                Annuler
                            </button>
                            <button type="submit" className="btn-primary small">
                                Valider l'adresse
                            </button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setShowAddressForm(true)} className="btn-link-add">
                        + Ajouter une nouvelle adresse
                    </button>
                )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}