'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import '@/styles/auth.css';

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('success')) {
      setSuccessMessage("Compte créé avec succès ! Connectez-vous.");
    }
    if (searchParams.get('error') === 'CredentialsSignin') {
      setError("Email ou mot de passe incorrect.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false, // On gère la redirection manuellement pour éviter le rechargement
      });

      if (res?.error) {
        setError("Email ou mot de passe incorrect.");
        setLoading(false);
      } else {
        // Redirection forcée vers l'accueil ou l'admin
        router.refresh(); // Rafraîchit la session
        router.push('/'); 
      }
    } catch (err) {
      setError("Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Bon retour parmi nous ! 👋</h1>

        {successMessage && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
            {successMessage}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-footer">
          Pas encore de compte ? <Link href="/inscription" className="auth-link">Créer un compte</Link>
        </div>
      </div>
    </div>
  );
}