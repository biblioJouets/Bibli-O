// src/app/reset-password/[token]/page.js
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import '@/styles/auth.css';

// Composant réutilisable pour éviter la duplication de code
// On s'assure qu'il a "w-full" pour bien prendre toute la largeur
const PasswordInput = ({ label, value, onChange, show, setShow }) => (
  <div className="form-group">
    <label>{label}</label>
    <div className="relative w-full">
      <input 
        type={show ? "text" : "password"} 
        required 
        value={value}
        onChange={onChange}
        minLength={6}
        className="w-full pr-10" // w-full pour la largeur, pr-10 pour l'icône
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  </div>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams(); 
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // On gère la visibilité des deux champs indépendamment
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    setStatus('loading');
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => router.push('/connexion'), 3000);
      } else {
        const data = await res.json();
        setMessage(data.message || "Erreur lors de la réinitialisation");
        setStatus('error');
      }
    } catch (err) {
      setMessage("Une erreur est survenue");
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <h1 className="auth-title">Succès ! 🎉</h1>
          <p className="text-green-600 mb-4">Votre mot de passe a été mis à jour.</p>
          <p>Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Nouveau mot de passe</h1>
        
        {message && <div className="error-message">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Champ Nouveau Mot de passe */}
          <PasswordInput 
            label="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            show={showPass}
            setShow={setShowPass}
          />

          {/* Champ Confirmation */}
          <PasswordInput 
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirm}
            setShow={setShowConfirm}
          />

          <button type="submit" className="auth-button mt-4" disabled={status === 'loading'}>
            {status === 'loading' ? 'Mise à jour...' : 'Valider'}
          </button>
        </form>
      </div>
    </div>
  );
}