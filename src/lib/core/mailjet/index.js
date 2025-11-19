// src/lib/core/mailjet/index.js

import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

// -------------------------
// 1) Envoi d'un email simple
// -------------------------
export async function sendMail({ toEmail, subject, text }) {
  try {
    await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_SENDER_EMAIL,
              Name: "Bibli'O Jouets",
            },
            To: [{ Email: toEmail }],
            Subject: subject,
            TextPart: text,
          },
        ],
      });

    return { success: true };
  } catch (err) {
    console.error("Erreur sendMail Mailjet :", err);
    throw err;
  }
}

// -------------------------------------------------
// 2) Ajouter un contact dans une liste Mailjet
// -------------------------------------------------
export async function addContactToList({ email, name, listId }) {
  try {
    // Création / mise à jour du contact
    await mailjet.post("contact", { version: "v3" }).request({
      Email: email,
      Name: name || "",
    });

    // Ajout dans la liste
    await mailjet.post("listrecipient", { version: "v3" }).request({
      ContactAlt: email,
      ListID: listId ?? process.env.MAILJET_CONTACT_LIST_ID,
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
