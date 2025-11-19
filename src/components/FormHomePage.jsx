// src/components/FormHomePage.jsx
import React, { useState } from 'react';
import '@/styles/formHomepage.css';

function FormHomePage() {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', surname: '', phone: '', email: '', message: '' });
      } else {
        setStatus(data?.message || 'error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="formHomePage">
      <h3 className="form-title">Nous envoyer un message</h3>
      <form onSubmit={onSubmit}>
        <input type="text" id="name" name="name" placeholder="Nom" value={form.name} onChange={onChange} required />
        <input type="text" id="surname" name="surname" placeholder="Prénom" value={form.surname} onChange={onChange} required />
        <input type="tel" id="phone" name="phone" placeholder="Téléphone" value={form.phone} onChange={onChange} required />
        <input type="email" id="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <textarea id="message" name="message" placeholder="Commentaire" value={form.message} onChange={onChange} required />
        <button type="submit">Envoyer</button>
      </form>

      {status === 'loading' && <p>Envoi...</p>}
      {status === 'success' && <p>Message envoyé — merci !</p>}
      {status && status !== 'loading' && status !== 'success' && <p>Erreur : {status}</p>}
    </div>
  );
}

export default FormHomePage;
