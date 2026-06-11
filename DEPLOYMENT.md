# Guide de Déploiement - El-Minassa Chat Platform

## Déploiement sur Vercel

### Prérequis
- ✅ Vercel CLI installé (`npm install -g vercel`)
- ✅ Compte Vercel (créer sur https://vercel.com)
- ✅ Repository GitHub connecté
- ✅ Variables d'environnement configurées

### Étape 1: Authentifier Vercel

```bash
vercel login
```

Cela ouvrira un navigateur pour vous authentifier avec votre compte Vercel.

### Étape 2: Variables d'Environnement Requises

Accédez à votre projet Vercel et ajoutez ces variables:

**Database:**
- `DATABASE_URL` - URL PostgreSQL de Neon DB (obligatoire)

**Authentication:**
- `NEXTAUTH_SECRET` - Clé secrète pour NextAuth (générez une clé sécurisée)
- `NEXTAUTH_URL` - URL de production (ex: https://votre-domaine.com)

**Email (optionnel):**
- `RESEND_API_KEY` - API key de Resend pour envoyer des emails
- `RESEND_FROM_EMAIL` - Email expéditeur (ex: noreply@votre-domaine.com)

**AI Model:**
- `OPENROUTER_API_KEY` - API key OpenRouter pour le modèle IA

**Authentification tiers (optionnel):**
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `GITHUB_CLIENT_ID` - GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth Client Secret

### Étape 3: Générer une clé secrète sécurisée

```bash
# Sur Windows PowerShell
$key = [Convert]::ToBase64String((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32)); $key

# Ou utilisez Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Étape 4: Déployer le projet

**Option A: Via CLI (depuis la ligne de commande)**

```bash
cd c:\Users\admin\Desktop\el-minassa_chat
vercel deploy --prod
```

**Option B: Via GitHub (recommandé)**

1. Poussez votre code sur GitHub:
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. Connectez votre repo GitHub à Vercel:
   - Allez sur https://vercel.com/dashboard
   - Cliquez "New Project"
   - Sélectionnez votre repository
   - Configurez les variables d'environnement
   - Cliquez "Deploy"

### Étape 5: Migrations de Base de Données

Après le déploiement, exécutez les migrations:

```bash
npx prisma migrate deploy
```

Ou via le hook de déploiement automatique (configuré dans vercel.json):
- Les migrations s'exécutent automatiquement lors du déploiement

### Étape 6: Vérifier le déploiement

```bash
vercel list  # Voir tous vos déploiements
vercel logs  # Voir les logs en temps réel
```

Votre site sera accessible à:
- `https://<votre-projet>.vercel.app` (URL auto-générée)
- Votre domaine personnalisé (si configuré)

## Configuration du Domaine Personnalisé

Dans les paramètres Vercel du projet:
1. Allez à "Settings" → "Domains"
2. Ajoutez votre domaine
3. Configurez les DNS selon les instructions Vercel
4. Mettez à jour `NEXTAUTH_URL` avec votre domaine

## Monitoring et Logs

```bash
# Voir les logs en temps réel
vercel logs <project-name>

# Voir l'historique des déploiements
vercel list

# Voir les détails d'un déploiement
vercel inspect <deployment-url>
```

## Rollback en cas de problème

```bash
vercel rollback
```

## Support PostgreSQL sur Vercel

Le projet utilise PostgreSQL via Neon DB (fourni gratuitement):
- URL déjà configurée dans `.env`
- Vercel gère automatiquement les connexions
- Aucune configuration supplémentaire nécessaire

## Troubleshooting

**Erreur: "DATABASE_URL not found"**
- Vérifiez que `DATABASE_URL` est dans les variables Vercel
- Régénérez la connection string depuis Neon DB

**Erreur: "NEXTAUTH_SECRET not found"**
- Générez une nouvelle clé avec: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Ajoutez-la à Vercel Environment Variables

**Build échoue**
- Vérifiez les logs: `vercel logs`
- Assurez-vous que toutes les dépendances sont installées: `npm install`
- Lancez un build local: `npm run build`

**Problèmes de CORS/API**
- Vérifiez `NEXTAUTH_URL` correspond à votre domaine
- Configurez les redirects dans middleware.ts si nécessaire

## Paramètres de Performance (vercel.json)

- **Région**: CDG1 (Datacenter Paris, France)
- **Timeout API**: 30 secondes
- **Build Command**: Optimisé avec Prisma + Next.js
- **Routing**: Middleware configuré pour maintenance mode

---

**Questions?** Consultez:
- https://vercel.com/docs
- https://nextjs.org/docs/deployment
- https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-vercel-postgres
