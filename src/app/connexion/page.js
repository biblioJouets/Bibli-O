// src/app/connexion/page.js
'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react'; 
import '@/styles/auth.css';

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);

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
        redirect: false, 
      });

      if (res?.error) {
        if (res.error.includes("Trop de tentatives")) {
           setError("⛔ Trop de tentatives. Veuillez patienter 1 minute.");
        } else {
           setError("Email ou mot de passe incorrect.");
        }
        setLoading(false);
      } else {
        router.refresh(); 
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
          <div className="bg-green-100 text-green-800 p-4 rounded mb-4 text-center">
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
              className="w-full" // S'assure que l'email prend toute la largeur
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            {/* Ajout de w-full ici pour que le conteneur prenne toute la largeur */}
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
                // w-full pour la largeur, pr-10 (40px) pour laisser la place à l'icône à droite
                className="w-full pr-10" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                // Positionnement absolu à droite, centré verticalement
                className="absolute right-0.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                style={{ background: 'none', border: 'none', padding: 0 }} // Reset style bouton
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div className="text-right mt-1">
                <Link href="/mot-de-passe-oublie" className="text-sm text-blue-500 hover:underline">
                    Mot de passe oublié ?
                </Link>
            </div>
          </div>

          <button type="submit" className="auth-button mt-4" disabled={loading}>
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