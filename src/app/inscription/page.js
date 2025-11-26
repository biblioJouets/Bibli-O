'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/auth.css'; // Import du CSS

export default function InscriptionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          // Vous pouvez ajouter l'adresse ici si vous voulez l'inclure dès l'inscription
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Une erreur est survenue");
      }

      // Succès : Redirection vers la connexion
      router.push('/connexion?success=true');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Rejoindre l'aventure 🧸</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Prénom</label>
              <input type="text" name="firstName" required onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Nom</label>
              <input type="text" name="lastName" required onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Téléphone (optionnel)</label>
            <input type="tel" name="phone" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" name="password" required onChange={handleChange} minLength={6} />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" name="confirmPassword" required onChange={handleChange} minLength={6} />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>

        <div className="auth-footer">
          Déjà membre ? <Link href="/connexion" className="auth-link">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}