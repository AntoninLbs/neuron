# Neuron - Application d'apprentissage intelligent 🧠

Application de révisions avec répétition espacée et génération de questions par IA.

## Fonctionnalités

- ✅ Authentification (Email/Password + Google OAuth)
- ✅ Création de projets avec catégories personnalisées
- ✅ Génération de questions par IA (OpenAI)
- ✅ Système de répétition espacée (algorithme SM-2)
- ✅ Profil utilisateur modifiable
- ✅ Mode sombre/clair
- ✅ PWA (installable sur mobile)

## Stack technique

- **Framework**: Next.js 14
- **Auth & Database**: Supabase
- **IA**: OpenAI (GPT-4o-mini)
- **UI**: Tailwind CSS + Radix UI
- **Police**: Inter

## Installation

### 1. Cloner et installer

```bash
git clone https://github.com/votre-repo/neuron.git
cd neuron
npm install
```

### 2. Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **SQL Editor** et exécuter le script `supabase-schema.sql`
3. Copier les clés API depuis **Settings > API**

### 3. Variables d'environnement

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-proj-xxx
```

### 4. Icônes PWA

Pour que l'icône apparaisse correctement sur mobile, convertir le fichier `public/icon.svg` en PNG :

**Option A - En ligne :**
1. Aller sur [svgtopng.com](https://svgtopng.com) ou [cloudconvert.com](https://cloudconvert.com)
2. Uploader `public/icon.svg`
3. Créer 3 fichiers :
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
   - `apple-touch-icon.png` (180x180)
4. Placer dans le dossier `public/`

**Option B - ImageMagick (local) :**
```bash
cd public
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
convert icon.svg -resize 180x180 apple-touch-icon.png
```

### 5. Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Configuration Supabase

### Authentication

1. **Settings > Authentication > URL Configuration**
   - Site URL: `https://votre-app.vercel.app`
   - Redirect URLs: ajouter `https://votre-app.vercel.app`, `http://localhost:3000`

2. **Google OAuth** (optionnel)
   - Aller dans **Providers > Google**
   - Activer et ajouter Client ID + Secret depuis Google Cloud Console

### Base de données

Exécuter le script SQL fourni (`supabase-schema.sql`) qui crée :
- Table `profiles` : Profils utilisateurs
- Table `projects` : Projets d'apprentissage
- Table `cards` : Questions/cartes de révision
- Table `user_stats` : Statistiques utilisateur
- Policies RLS pour la sécurité
- Triggers pour la création automatique des profils

## Déploiement Vercel

1. Push sur GitHub
2. Connecter le repo à Vercel
3. Ajouter les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. Déployer !

## Structure du projet

```
src/
├── app/
│   ├── (app)/           # Pages protégées (auth requise)
│   │   ├── dashboard/   # Liste des projets
│   │   ├── learn/       # Page d'apprentissage
│   │   ├── profile/     # Profil utilisateur
│   │   └── projects/    # Création de projet
│   ├── api/             # Routes API
│   └── auth/            # Pages d'authentification
├── components/          # Composants réutilisables
├── lib/                 # Utilitaires
└── types/               # Types TypeScript
```

## Catégories disponibles

Marketing, Mathématiques, Histoire, Géographie, Sciences, Économie, Informatique, Langues, Philosophie, Droit, Physique, Chimie, Biologie, Littérature, Musique, Cinéma, Sport, Cuisine, Psychologie, Management

## Licence

MIT
