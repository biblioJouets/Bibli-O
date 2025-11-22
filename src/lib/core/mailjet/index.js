// src/lib/core/mailjet/index.js

import Mailjet from "node-mailjet";
import { z } from "zod";

// -------------------------
// Vérification des variables d'environnement requises
// -------------------------
const requiredEnvVars = [
  'MAILJET_API_KEY',
  'MAILJET_API_SECRET', 
  'MAILJET_SENDER_EMAIL',
  'MAILJET_CONTACT_LIST_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`[WARN] Variable d'environnement manquante: ${envVar}`);
  }
}

// -------------------------
// Validation des emails envoyés
// -------------------------
const mailSchema = z.object({
  toEmail: z.string().email(),
  subject: z.string().min(1).max(200),
  text: z.string().min(1).max(2000),
});

// -------------------------
// Validation des contacts newsletter
// -------------------------
const contactSchema = z.object({
  email: z.string().email(),
  name: z.string().max(50).optional(),
  listId: z.union([z.string(), z.number()]).optional(),
});

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

// -------------------------
// 1) Envoi d'un email
// -------------------------
export async function sendMail({ toEmail, subject, text }) {
  const validated = mailSchema.parse({ toEmail, subject, text });

  const sanitized = {
    toEmail: validated.toEmail.trim(),
    subject: validated.subject.trim(),
    text: validated.text.trim(),
  };

  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL,
            Name: "Bibli'O Jouets",
          },
          To: [{ Email: sanitized.toEmail }],
          Subject: sanitized.subject,
          TextPart: sanitized.text,
        },
      ],
    });

    return { success: true };
  } catch (err) {
    console.error("Erreur sendMail Mailjet :", err);
    throw err;
  }
}

// -------------------------
// 2) Ajouter un contact à la liste Mailjet
// -------------------------
export async function addContactToList({ email, name, listId }) {
  const validated = contactSchema.parse({ email, name, listId });

  const sanitized = {
    email: validated.email.trim(),
    name: validated.name?.trim(),
  };

  // Déterminer le finalListId avec validation
  const finalListId = validated.listId 
    ? Number(validated.listId)
    : Number(process.env.MAILJET_CONTACT_LIST_ID);

  // Vérifier que finalListId est configuré et valide
  if (!finalListId || isNaN(finalListId)) {
    console.error('[ERROR] MAILJET_CONTACT_LIST_ID non configuré ou invalide');
    return { success: false, message: 'Configuration Mailjet manquante' };
  }

  try {
    // Création du contact
    const payload = { Email: sanitized.email };
    if (sanitized.name) payload.Name = sanitized.name;

    await mailjet.post("contact", { version: "v3" }).request(payload);

    // Ajout dans la liste
    await mailjet.post("listrecipient", { version: "v3" }).request({
      ContactAlt: sanitized.email,
      ListID: finalListId,
      IsUnsubscribed: false,
    });

    return { success: true };
  } catch (err) {
    if (err.statusCode === 400 && err.message.includes("duplicate")) {
      return { success: true, message: "Contact déjà dans la liste" };
    }
    console.error("Erreur Mailjet addContactToList :", err);
    throw err;
  }
}
