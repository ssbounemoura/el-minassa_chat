# 🚀 Instructions de Déploiement Rapide

## Méthode 1: Script Automatique PowerShell (RECOMMANDÉ)

### Sur Windows PowerShell:

```powershell
# Accédez au dossier du projet
cd c:\Users\admin\Desktop\el-minassa_chat

# Exécutez le script de déploiement
.\deploy.ps1
```

**Le script fera automatiquement:**
✅ Vérifier les prérequis (Node.js, npm, Vercel CLI)  
✅ Installer les dépendances  
✅ Compiler le projet  
✅ Déployer sur Vercel en production  

---

## Méthode 2: Déploiement Manuel via CLI

```bash
# 1. Authentification Vercel
vercel login

# 2. Build local
npm run build

# 3. Déploiement production
vercel deploy --prod
```

---

## Méthode 3: Déploiement via GitHub (Plus facile!)

### Étapes:

1. **Poussez votre code sur GitHub:**
```bash
cd c:\Users\admin\Desktop\el-minassa_chat
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **Connectez à Vercel:**
   - Allez sur https://vercel.com/dashboard
   - Cliquez "New Project"
   - Importez votre repository GitHub
   - Sélectionnez "Next.js" comme framework
   - Cliquez "Deploy"

3. **Variables d'Environnement:**
   - Dans les paramètres du projet Vercel
   - Allez à "Settings" → "Environment Variables"
   - Ajoutez ces variables (voir liste ci-dessous)

---

## ✅ Variables d'Environnement Requises

### Essentielles:
| Variable | Exemple | Où le trouver |
|----------|---------|--------------|
| `DATABASE_URL` | `postgresql://...` | Neon DB (déjà dans .env) |
| `NEXTAUTH_SECRET` | `abc123xyz...` | Générer: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_URL` | `https://el-minassa.com` | Votre domaine de production |

### Recommandées:
| Variable | Où le trouver |
|----------|--------------|
| `OPENROUTER_API_KEY` | https://openrouter.ai/api/keys |
| `RESEND_API_KEY` | https://resend.com (optionnel, pour emails) |

### Optionnelles (OAuth):
- `GOOGLE_CLIENT_ID` - Google Console
- `GOOGLE_CLIENT_SECRET` - Google Console
- `GITHUB_CLIENT_ID` - GitHub Settings
- `GITHUB_CLIENT_SECRET` - GitHub Settings

---

## 📋 Checklist Avant Déploiement

- [ ] Toutes les variables d'environnement sont configurées
- [ ] `DATABASE_URL` pointe vers PostgreSQL (Neon DB)
- [ ] `NEXTAUTH_SECRET` est une clé sécurisée et unique
- [ ] `NEXTAUTH_URL` correspond à votre domaine
- [ ] Build local réussit: `npm run build`
- [ ] Pas d'erreurs TypeScript
- [ ] Git est à jour: `git status` montre "clean"

---

## 🔐 Générer une Clé Secrète Sécurisée

### Option 1: PowerShell
```powershell
$key = [Convert]::ToBase64String((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32)); Write-Host $key
```

### Option 2: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 3: OpenSSL
```bash
openssl rand -hex 32
```

Copiez la clé générée et ajoutez-la à Vercel comme `NEXTAUTH_SECRET`.

---

## 📊 URL de Déploiement

Après le déploiement, votre site sera accessible à:

```
🌍 URL Vercel auto-générée: https://<votre-projet>.vercel.app
🌍 Votre domaine (si configuré): https://votre-domaine.com
```

### Ajouter un domaine personnalisé:
1. Allez à "Settings" → "Domains"
2. Ajoutez votre domaine
3. Suivez les instructions pour configurer le DNS
4. Mettez à jour `NEXTAUTH_URL` dans les variables

---

## 🐛 Troubleshooting

**"vercel: command not found"**
```bash
npm install -g vercel
vercel login
```

**Build échoue**
```bash
# Nettoyez et relancez
rm -r node_modules .next
npm install
npm run build
```

**Database connection error**
- Vérifiez `DATABASE_URL` dans Vercel
- Testez localement: `npx prisma db push`
- Vérifiez les règles firewall de Neon DB

**NextAuth errors**
- Générez nouvelle clé secrète
- Vérifiez `NEXTAUTH_URL` match votre domaine
- Pas de `http://` si c'est production

---

## 📞 Support

- Docs Vercel: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Neon DB: https://neon.tech/docs
- NextAuth: https://next-auth.js.org

**Besoin d'aide?** Consultez `DEPLOYMENT.md` pour plus de détails.
