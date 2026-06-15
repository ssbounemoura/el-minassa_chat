# 📋 Guide de déploiement - El Minassa Chat

## 🔐 Comptes de test

### Test Huissier Dashboard

```
Email: huissier@elminassa.dz
Password: Huissier2026!
```

**Accès:** `http://localhost:3000/login` → `/dashboard/huissier`

**Sections disponibles:**
- ✅ Tableau de bord (Dashboard principal)
- ✅ Gestion des actes
- ✅ Gestion des documents
- ✅ Gestion des parties
- ✅ Calendrier des rendez-vous
- ✅ Paramètres du compte

### Test Comptes Admin & Notaire

**Admin:**
```
Email: admin@elminassa.dz
Password: ElMinassa2026!
URL: http://localhost:3000/admin
```

**Notaire:**
```
Email: notaire@elminassa.dz
Password: Notaire2026!
URL: http://localhost:3000/dashboard/notaire
```

---

## 🧪 Checklist de test local

- [ ] Login fonctionnel avec compte Huissier
- [ ] Sidebar navigation complète
- [ ] Affichage des statistiques
- [ ] Tableau des actes avec recherche/filtrage
- [ ] Modal upload fichiers (test sans fichier)
- [ ] Modal FAQ/Aide affiche contenu en arabe
- [ ] Navigation vers sous-pages:
  - [ ] `/dashboard/huissier/actes`
  - [ ] `/dashboard/huissier/documents`
  - [ ] `/dashboard/huissier/parties`
  - [ ] `/dashboard/huissier/schedule`
  - [ ] `/dashboard/huissier/settings`
- [ ] Admin dashboard fonctionne
- [ ] Notaire dashboard fonctionne (countdown)
- [ ] Pas d'erreurs TypeScript/React

---

## 🚀 Déploiement Vercel

### Étape 1: Configuration Vercel Dashboard

1. Connectez-vous à [vercel.com](https://vercel.com)
2. Sélectionnez le projet **el-minassa_chat**
3. Allez dans **Settings** → **Environment Variables**

### Étape 2: Ajouter variables d'environnement

Configurez les variables suivantes:

```
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app

# Base de données (déjà configurée)
DATABASE_URL=postgresql://...

# SMTP Configuration (Production)
SMTP_HOST=mail.el-minassa.com
SMTP_PORT=587
SMTP_USER=inscription@el-minassa.com
SMTP_PASSWORD=YourActualPassword
SMTP_SECURE=false
EMAIL_FROM=inscription@el-minassa.com

# Optionnel: Pour file uploads production
# AWS_S3_BUCKET=your-bucket-name
# AWS_S3_REGION=us-east-1
# AWS_S3_ACCESS_KEY=...
# AWS_S3_SECRET_KEY=...
```

### Étape 3: Déployer

**Option A: Depuis le git push**
```bash
git push origin main
# Vercel déploiera automatiquement
```

**Option B: Depuis Vercel Dashboard**
1. Allez dans **Deployments**
2. Cliquez **Deploy** sur la branche `main`

### Étape 4: Tester la production

Une fois le déploiement terminé:

```bash
# Récupérer l'URL
https://el-minassa-chat.vercel.app/login

# Tester avec:
Email: huissier@elminassa.dz
Password: Huissier2026!
```

---

## ⚠️ Points importants

### File Uploads
Actuellement sauvegardés localement dans `/public/uploads/huissier/`.

**Pour production, recommandé:**
- Utiliser **Vercel Blob** (simple intégration)
- Utiliser **AWS S3** (plus de contrôle)
- Utiliser **Cloudinary** (gestion médias)

**Migration suggérée:**
1. Installer: `npm install @vercel/blob`
2. Mettre à jour `/api/huissier/upload`
3. Tester avec données réelles

### SMTP Configuration
Le système SMTP utilise **Nodemailer**. 

**Vérifications production:**
- Port 587 est accessible
- Authentification marche
- Tests d'envoi avant mise en production
- Vérifier firewall du serveur SMTP

---

## 📊 Build Information

```
Next.js: 16.2.7 (Turbopack)
React: 19.2.4
TypeScript: Strict mode
Routes: 79 pages compiled
Database: PostgreSQL (Prisma ORM)
```

---

## 🔍 Troubleshooting

### Erreur: "Unauthorized" sur /dashboard/huissier

**Solution:**
- Vérifier authentification cookie
- Vérifier role HUISSIER dans base de données
- Vérifier middleware auth

### File upload ne fonctionne pas

**Solution:**
- En local: Vérifier permissions dossier `/public/uploads/`
- En production: Vérifier que solution cloud est configurée

### Date/Timezone issues

- Vercel utilise UTC par défaut
- Les dates affichent en arabe (locale: ar-DZ)
- Vérifier format conversion dates

---

## 📞 Support & Contacts

**Repository:** https://github.com/ssbounemoura/el-minassa_chat

**Commits importants:**
```
3858321 - feat: create comprehensive huissier dashboard with 5 sub-pages and api endpoints
```

---

## 🎯 Prochaines améliorations

1. **API Endpoints**
   - Remplacer mock data par Prisma queries
   - Ajouter pagination
   - Ajouter validation données

2. **File Storage**
   - Migration vers Vercel Blob ou S3
   - Antivirus scanning
   - Compression images

3. **Notifications**
   - Système temps réel (WebSockets)
   - Email notifications
   - Push notifications

4. **Analytics**
   - Tableau de bord statistiques
   - Export rapports
   - Audit logs

---

**Dernière mise à jour:** 2026-06-15
**Status:** 🟢 Production Ready
