import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Initialisation de Sequelize
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false, // mettre true pour voir les requêtes SQL
  }
);

// Test de la connexion
try {
  await sequelize.authenticate();
  console.log("✅ Connexion Sequelize + PostgreSQL réussie");
} catch (error) {
  console.error("❌ Erreur de connexion Sequelize :", error);
}

