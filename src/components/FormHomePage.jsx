'use client';

import React, { useState, useEffect, useRef } from 'react';
import '@/styles/formHomepage.css';
import { z } from 'zod';
import HCaptcha from "@hcaptcha/react-hcaptcha";

const contactSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/),
  surname: z.string().min(2).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/),
  phone: z.string().regex(/^(?:(?:\+|00)33|0)[1-9]\d{8}$/),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

function FormHomePage() {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    message: '',
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [status, setStatus] = useState(null);
  
  // Utiliser useRef pour stocker la fonction sanitize
  const sanitizeRef = useRef(null);

  useEffect(() => {
    import('isomorphic-dompurify').then((module) => {
      // Chercher la fonction sanitize dans différents endroits possibles
      const sanitizeFn = 
        module.default?.sanitize?.bind(module.default) ||
        module.sanitize?.bind(module) ||
        module.default?.default?.sanitize?.bind(module.default.default);
      
      if (typeof sanitizeFn === 'function') {
        sanitizeRef.current = sanitizeFn;
      } else {
        console.error("DOMPurify.sanitize introuvable. Module:", module);
      }
    }).catch(err => {
      console.error("Erreur chargement DOMPurify:", err);
    });
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;

    // Utiliser sanitize si disponible, sinon valeur brute
    const sanitizedValue = sanitizeRef.current 
      ? sanitizeRef.current(value) 
      : value;

    setForm({ ...form, [name]: sanitizedValue });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    if (!captchaToken) {
      setStatus("Veuillez valider le captcha avant l'envoi.");
      return;
    }
  console.log("FORM DEBUG", form);
    try {
      contactSchema.parse(form);

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hcaptchaToken: captchaToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setForm({ name: '', surname: '', phone: '', email: '', message: '' });
        setCaptchaToken(null);
      } else {
        setStatus(data?.message || 'error');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setStatus('Merci de corriger les champs du formulaire.');
      } else {
        console.error(err);
        setStatus('error');
      }
    }
  };

  return (
    <div className="formHomePage">
      <h3 className="form-title">Nous envoyer un message</h3>
      <form onSubmit={onSubmit}>
        <input type="text" name="name" placeholder="Nom" value={form.name} onChange={onChange} required />
        <input type="text" name="surname" placeholder="Prénom" value={form.surname} onChange={onChange} required />
        <input type="tel" name="phone" placeholder="Téléphone" value={form.phone} onChange={onChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <textarea name="message" placeholder="Commentaire" value={form.message} onChange={onChange} required />

        <HCaptcha
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
          onVerify={(token) => setCaptchaToken(token)}
        />
        <button type="submit">Envoyer</button>
      </form>

      {status === 'loading' && <p>Envoi...</p>}
      {status === 'success' && <p>Message envoyé — merci !</p>}
      {status && status !== 'loading' && status !== 'success' && <p>Erreur : {status}</p>}
    </div>
  );
}

export default FormHomePage;