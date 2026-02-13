'use client';
import { useState } from 'react';
import Link from 'next/link';
import '@/styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // On affiche toujours success pour sécurité
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Mot de passe oublié ? 🔒</h1>
        
        {status === 'success' ? (
          <div className="text-center">
            <p className="mb-4 text-green-700 bg-green-100 p-3 rounded">
              Si un compte est associé à cet email, vous recevrez un lien de réinitialisation dans quelques instants.
            </p>
            <Link href="/connexion" className="auth-button block text-center">Retour à la connexion</Link>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-6">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="auth-button" disabled={status === 'loading'}>
                {status === 'loading' ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>
            <div className="auth-footer">
               <Link href="/connexion" className="auth-link">Retour</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}