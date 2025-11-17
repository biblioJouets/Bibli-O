import { NewsletterSubscriber } from "./newsletter.model.js";

export const addSubscriber = async (email) => {
  try {
    await NewsletterSubscriber.findOrCreate({ where: { email } });
    return { success: true };
  } catch (err) {
    console.error("Erreur ajout newsletter:", err);
    return { success: false, error: err };
  }
};