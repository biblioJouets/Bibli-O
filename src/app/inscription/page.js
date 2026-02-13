// src/app/inscription/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import '@/styles/auth.css';

// 1. On définit le composant à l'extérieur pour qu'il ne soit pas recréé à chaque rendu
const PasswordInput = ({ name, label, show, setShow, value, onChange }) => (
  <div className="form-group">
    <label>{label}</label>
    <div className="relative w-full">
      <input 
        type={show ? "text" : "password"} 
        name={name} 
        required 
        onChange={onChange} // On utilise la fonction passée en prop
        value={value} 
        minLength={6}
        className="w-full pr-10" 
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

export default function InscriptionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Une erreur est survenue");
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
          <div className="flex gap-4">
            <div className="form-group flex-1 mr-3">
              <label>Prénom</label>
              <input type="text" name="firstName" required onChange={handleChange} className="w-full" />
            </div>
            <div className="form-group flex-1 ml-3">
              <label>Nom</label>
              <input type="text" name="lastName" required onChange={handleChange} className="w-full" />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" required onChange={handleChange} className="w-full" />
          </div>

          <div className="form-group">
            <label>Téléphone (optionnel)</label>
            <input type="tel" name="phone" onChange={handleChange} className="w-full" />
          </div>

          {/* 2. On passe handleChange en prop ici */}
          <PasswordInput 
            name="password" 
            label="Mot de passe" 
            show={showPass} 
            setShow={setShowPass} 
            value={formData.password}
            onChange={handleChange} 
          />

          <PasswordInput 
            name="confirmPassword" 
            label="Confirmer le mot de passe" 
            show={showConfirm} 
            setShow={setShowConfirm} 
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" className="auth-button mt-4" disabled={loading}>
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