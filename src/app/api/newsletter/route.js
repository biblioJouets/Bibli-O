import express from "express";
import { addSubscriber } from "./newsletter.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Adresse e-mail invalide" });
  }

  const result = await addSubscriber(email);

  if (result.success) {
    res.status(201).json({ message: "Email enregistré !" });
  } else {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
