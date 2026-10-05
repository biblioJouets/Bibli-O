# 🚀 Antisèche des Commandes Cursor

## ⌨️ Raccourcis Principaux
- **`Ctrl + K` (ou `Cmd + K`)** : Générer ou modifier du code en ligne. À utiliser directement dans un fichier ouvert ou dans le terminal pour générer une commande.
- **`Ctrl + L` (ou `Cmd + L`)** : Ouvrir le Chat Cursor. Idéal pour poser des questions, déboguer ou demander des explications sur le code.
- **`Ctrl + I` (ou `Cmd + I`)** : Ouvrir le Composer (Plan Pro). Permet de demander la création d'une fonctionnalité complète qui va créer/modifier plusieurs fichiers en même temps.
- **`Tab`** : Accepter l'autocomplétion multi-lignes (Cursor Tab).

## 🎯 Utilisation du Contexte (Symbole `@`)
Dans n'importe quel champ de texte Cursor (Chat, Composer, ou Ctrl+K), utilise **`@`** pour inclure du contexte :
- **`@Files`** : Cherche et inclut un fichier spécifique (ex: `@schema.prisma`).
- **`@Folders`** : Inclut tout un dossier.
- **`@Codebase`** : Force l'IA à scanner tout ton projet avant de répondre (ou appuyer sur `Ctrl + Enter` dans le chat).
- **`@Web`** : Demande à l'IA de faire une recherche sur internet (utile pour les bugs récents ou la doc introuvable).
- **`@Docs`** : Permet d'ajouter et d'interroger des documentations officielles externes tierces (ex: `@Stripe`, `@Next.js`).

## 🛠️ Astuces
- **.cursorrules** : Fichier à placer à la racine du projet pour définir le comportement global de l'IA (stack technique, charte graphique, ton).
- **Glisser-déposer d'images** : Dans le chat (`Ctrl+L`), dépose une maquette ou capture d'écran pour demander à l'IA de générer l'UI correspondante.