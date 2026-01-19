# 🧠 Neuron

Application de culture générale avec répétition espacée. Apprends chaque jour, mémorise pour toujours.

![Neuron Logo](./public/logo.svg)

## ✨ Fonctionnalités

- **Répétition espacée** : Algorithme optimisé pour maximiser la mémorisation
- **Projets personnalisés** : Combine les thèmes qui t'intéressent
- **30+ thématiques** : Sciences, histoire, sport, cinéma, etc.
- **Questions IA** : Génération automatique via OpenAI
- **Gamification** : XP, niveaux, streak, badges
- **Mode sombre/clair** : Interface adaptée à tes préférences
- **Mobile-first** : Conçu pour les smartphones

## 🛠️ Stack technique

- **Framework** : Next.js 14 (App Router)
- **Base de données** : PostgreSQL (Supabase)
- **ORM** : Prisma
- **Auth** : NextAuth.js v5 (Magic link + Google OAuth)
- **Styling** : Tailwind CSS
- **IA** : OpenAI GPT-4o-mini
- **Déploiement** : Vercel

## 🚀 Déploiement

### 1. Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un compte
2. Crée un nouveau projet
3. Dans **Settings > Database > Connection string**, copie :
   - **URI** (avec `?pgbouncer=true`) → `DATABASE_URL`
   - **Direct** → `DIRECT_URL`

### 2. Configurer les variables d'environnement

Copie `.env.example` vers `.env` et remplis :

```bash
# Supabase
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Auth
AUTH_SECRET="$(openssl rand -base64 32)"  # Génère une clé aléatoire
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Google OAuth (optionnel)
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Email (optionnel, pour magic link)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@ton-domaine.com"
```

### 3. Installation locale

```bash
# Cloner le repo
git clone https://github.com/ton-username/neuron.git
cd neuron

# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers Supabase
npm run db:push

# Seeder la base (thèmes + questions)
npm run db:seed

# Lancer en dev
npm run dev
```

### 4. Déployer sur Vercel

1. Push ton code sur GitHub
2. Va sur [vercel.com](https://vercel.com) et importe le repo
3. Ajoute les variables d'environnement (même que `.env`)
4. Change `NEXTAUTH_URL` vers ton URL Vercel (ex: `https://neuron.vercel.app`)
5. Déploie !

### 5. Configurer Google OAuth (optionnel)

1. Va sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crée un projet
3. Configure l'écran de consentement OAuth
4. Crée des identifiants OAuth 2.0
5. Ajoute les URLs de redirection :
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://ton-app.vercel.app/api/auth/callback/google` (prod)
6. Copie Client ID et Secret dans tes variables d'env

## 📁 Structure du projet

```
neuron/
├── prisma/
│   ├── schema.prisma    # Schéma de la base de données
│   └── seed.ts          # Données initiales (thèmes, questions)
├── src/
│   ├── app/
│   │   ├── (app)/       # Pages authentifiées
│   │   │   ├── dashboard/
│   │   │   ├── learn/
│   │   │   ├── stats/
│   │   │   ├── profile/
│   │   │   └── projects/
│   │   ├── auth/        # Pages d'authentification
│   │   └── api/         # Routes API
│   ├── components/
│   │   ├── ui/          # Composants réutilisables
│   │   └── nav/         # Navigation
│   ├── lib/
│   │   ├── auth.ts      # Configuration NextAuth
│   │   ├── prisma.ts    # Client Prisma
│   │   ├── openai.ts    # Client OpenAI
│   │   ├── spaced-repetition.ts  # Algorithme SR
│   │   └── utils.ts     # Utilitaires
│   ├── hooks/           # React hooks
│   └── types/           # Types TypeScript
├── public/              # Assets statiques
└── ...config files
```

## 🎯 Algorithme de répétition espacée

Intervalles (en jours) après chaque bonne réponse :

| Étape | Intervalle | Jour cumulé |
|-------|------------|-------------|
| 1     | +1 jour    | J1          |
| 2     | +1 jour    | J2          |
| 3     | +3 jours   | J5          |
| 4     | +5 jours   | J10         |
| 5     | +8 jours   | J18         |
| 6     | +13 jours  | J31         |
| 7     | +21 jours  | J52         |
| 8+    | +34 jours  | cap         |

**Mauvaise réponse** → Retour à J+1

## 🏅 Système de gamification

### XP
- Bonne réponse : **+10 XP**
- Mauvaise réponse : **+2 XP**
- Bonus révision : **+5 XP**
- Objectif quotidien : **+50 XP**
- Bonus streak : **+25 XP**

### Niveaux
- Niveau N nécessite N × 100 XP
- Niveau 1 : 0-100 XP
- Niveau 2 : 100-300 XP
- Niveau 3 : 300-600 XP
- etc.

## 🔧 Commandes utiles

```bash
# Dev
npm run dev          # Lancer en développement
npm run build        # Build production
npm run start        # Lancer en production

# Base de données
npm run db:push      # Appliquer le schéma
npm run db:generate  # Générer le client Prisma
npm run db:seed      # Peupler avec les données initiales
npm run db:studio    # Interface visuelle Prisma
```

## 📝 TODO / Améliorations futures

- [ ] API de génération de questions IA
- [ ] Système de badges complet
- [ ] Mode offline (PWA)
- [ ] Notifications push
- [ ] Classement entre amis
- [ ] Import/export de projets
- [ ] Plus de thématiques

## 📄 Licence

MIT

---

Fait avec ❤️ et ☕
