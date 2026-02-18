/* src/components/account/ProfileTab.jsx */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfileTab() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [addresses, setAddresses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // États pour l'ajout d'adresse
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', postalCode: '', city: '', country: 'France' });

  useEffect(() => {
    if (session?.user?.id) fetchUserProfile();
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`/api/users/${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          email: data.email || ''
        });
        setAddresses(data.Address || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) setMessage({ type: 'success', text: 'Profil mis à jour !' });
      else setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur serveur.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${session.user.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        fetchUserProfile(); // Recharger les données
        setShowAddressForm(false);
        setNewAddress({ street: '', postalCode: '', city: '', country: 'France' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Supprimer cette adresse ?')) return;
    try {
      const res = await fetch(`/api/users/${session.user.id}/addresses?addressId=${addressId}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchUserProfile();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="tab-content">
      <h2 className="section-title">Mes Informations</h2>
      
      {message && (
        <div className={`message-box ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleProfileUpdate} className="profile-form">
        <div className="form-group">
          <label>Email (non modifiable)</label>
          <input type="email" value={profile.email} disabled className="input-disabled" />
        </div>
        <div className="form-row">
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
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <input 
            type="tel" 
            value={profile.phone} 
            onChange={(e) => setProfile({...profile, phone: e.target.value})} 
          />
        </div>
        <button type="submit" disabled={isSaving} className="btn-primary">
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>

      <div className="addresses-section">
        <h3 className="subsection-title">Mes Adresses</h3>
        
        <div className="address-list">
          {addresses.map(addr => (
            <div key={addr.id} className="address-card">
              <p>{addr.street}</p>
              <p>{addr.postalCode} {addr.city}</p>
              <button onClick={() => handleDeleteAddress(addr.id)} className="btn-delete-addr">
                Supprimer
              </button>
            </div>
          ))}
        </div>

        {/* Formulaire ajout adresse */}
        <div className="add-address-wrapper">
            {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="address-form-inline">
                    <h4>Nouvelle adresse</h4>
                    <div className="form-group">
                        <input 
                            placeholder="Rue..." 
                            required
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <input 
                                placeholder="Code Postal" 
                                required
                                value={newAddress.postalCode}
                                onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <input 
                                placeholder="Ville" 
                                required
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
                            Valider
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
    </div>
  );
}