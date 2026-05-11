/**
 * Génère un ou plusieurs codes cadeaux en base de données.
 *
 * Usage :
 *   node scripts/generate-gift-code.mjs              → 1 code de 30 €
 *   node scripts/generate-gift-code.mjs --amount 50  → 1 code de 50 €
 *   node scripts/generate-gift-code.mjs --count 5    → 5 codes de 30 €
 *
 * Requiert DATABASE_URL dans .env (chargé via dotenv).
 */

import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Charge .env manuellement (pas de dotenv requis)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  // .env absent, on continue avec les variables d'environnement système
}

// Parse les arguments CLI
const args = process.argv.slice(2);
function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const amount = parseFloat(getArg("--amount") ?? "30");
const count = parseInt(getArg("--count") ?? "1", 10);

if (isNaN(amount) || amount <= 0) {
  console.error("❌  --amount doit être un nombre positif.");
  process.exit(1);
}
if (isNaN(count) || count < 1 || count > 100) {
  console.error("❌  --count doit être entre 1 et 100.");
  process.exit(1);
}

function generateCode() {
  // Format : BJ-XXXX-XXXX (lettres majuscules + chiffres)
  const part = () => randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
  return `BJ-${part()}-${part()}`;
}

const prisma = new PrismaClient();

async function main() {
  const codes = [];

  for (let i = 0; i < count; i++) {
    let code;
    let attempts = 0;
    // Gestion des collisions (très improbable mais robuste)
    do {
      code = generateCode();
      attempts++;
      if (attempts > 10) throw new Error("Impossible de générer un code unique après 10 tentatives.");
    } while (await prisma.giftCode.findUnique({ where: { code } }));

    const created = await prisma.giftCode.create({
      data: { code, amount },
    });
    codes.push(created);
    console.log(`✅  ${created.code}  —  ${amount.toFixed(2)} €  (id: ${created.id})`);
  }

  console.log(`\n🎁  ${codes.length} code(s) généré(s) avec succès.`);
}

main()
  .catch((e) => {
    console.error("❌  Erreur :", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
