// src/app/admin/client/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, CheckCircle, XCircle, Users, Mail, Phone, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import '@/styles/client.css';

export default function AdminClientsPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, [session]);

  const fetchClients = async () => {
    try {
      // Assure-toi que cette route API existe et renvoie les données avec la relation Prisma : include: { Orders: true }
      const res = await fetch('/api/admin/users'); 
      if (res.ok) {
        const data = await res.json();
        // Optionnel : Trier par date de création (les plus récents en premier)
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setClients(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage par nom, prénom ou email
  const filteredClients = clients.filter(c => {
    const search = searchTerm.toLowerCase();
    const fullName = `${c.firstName}${c.lastName}`.toLowerCase();
    return fullName.includes(search) || c.email?.toLowerCase().includes(search);
  });

  // Formater la date en français
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1 className="admin-title">
            <Users size={32} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'bottom', color: '#6EC1E4' }} />
            Gestion des Clients
          </h1>
          <p>Visualisez les inscrits et leur historique de commandes</p>
        </div>
      </header>

      <div className="admin-filters-bar">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, prénom ou email..." 
            className="search-input"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Chargement des données clients...</div>
        ) : (
          <table className="client-table">
            <thead>
              <tr>
                <th>Client</th>
                <th><Mail size={16} className="inline-icon"/> Contact</th>
                <th><Calendar size={16} className="inline-icon"/> Inscription</th>
                <th>Rôle</th>
                <th><CreditCard size={16} className="inline-icon"/> Stripe ID</th>
                <th><ShoppingBag size={16} className="inline-icon"/> Commandes</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map(client => {
                  const hasOrders = client.Orders && client.Orders.length > 0;
                  const orderCount = client.Orders ? client.Orders.length : 0;

                  return (
                    <tr key={client.id}>
                      <td>
                        <div className="client-name">
                          {client.firstName} {client.lastName}
                        </div>
                      </td>
                      <td>
                        <div className="client-contact">
                          <a href={`mailto:${client.email}`} className="client-email">{client.email}</a>
                          {client.phone && <span className="client-phone"><Phone size={14} /> {client.phone}</span>}
                        </div>
                      </td>
                      <td>{formatDate(client.createdAt)}</td>
                      <td>
                        <span className={`badge ${client.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                          {client.role}
                        </span>
                      </td>
                      <td className="stripe-id">
                        {client.stripeCustomerId || <span className="empty-data">Non lié</span>}
                      </td>
                      <td>
                        {hasOrders ? (
                          <span className="badge badge-orders-yes">
                            <CheckCircle size={14} style={{ marginRight: '4px' }}/> {orderCount} commande(s)
                          </span>
                        ) : (
                          <span className="badge badge-orders-no">
                            <XCircle size={14} style={{ marginRight: '4px' }}/> Aucune
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">Aucun client trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}