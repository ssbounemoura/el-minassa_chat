# Dashboard Notaire - Guide d'utilisation

## Vue d'ensemble

Le dashboard notaire est un système complet conçu pour les notaires algériens afin de gérer leurs actes, clients et documents en conformité avec la loi algérienne.

## Fonctionnalités principales

### 1. **Gestion des Actes Notariés**
- Créer et gérer les actes notariés (vente, donation, mariage, succession, etc.)
- Suivre l'état de chaque acte (en cours, signé, enregistré, archivé)
- Ajouter les parties (signataires) à chaque acte
- Suivre les dates importantes et les signatures

### 2. **Types d'Actes Pris en Charge**
- 🏠 **Actes de vente** - Vente d'immeubles et biens mobiliers
- 🎁 **Actes de donation** - Donations et libéralités
- 💍 **Actes de mariage** - Contrats de mariage et conditions
- 📋 **Actes de succession** - Distribution des successions et testaments
- 🏦 **Actes d'hypothèque** - Hypothèques et nantissements
- 📄 **Actes de location** - Contrats de location et baux

### 3. **Registre Notarial**
- Enregistrement automatique des actes selon les numéros de registre
- Suivi de l'historique complet des actes enregistrés
- Gestion des statuts légaux (enregistré, transcrit, retiré, annulé)
- Calcul des frais et taxes d'enregistrement

### 4. **Système d'Aide Intégré**
- **Procédures** - Guide étape par étape des procédures notariales
- **Conseils juridiques** - Informations légales et jurisprudence
- **Tarification** - Grille de tarification et calcul des frais
- **Modèles de documents** - Noms de modèles d'actes
- **Délais légaux** - Dates limites et délais importants
- **Cas particuliers** - Procédures spéciales pour des situations exceptionnelles

### 5. **Gestion des Clients**
- Créer et gérer les fiches clients
- Historique des transactions avec chaque client
- Contacts et informations de communication
- Suivi des documents associés

### 6. **Traçabilité et Audit**
- Historique complet de chaque acte avec dates et modifications
- Signatures numériques et contrôle de légalité
- Archivage sécurisé des documents

## Routes API

### Actes Notariés
```
GET  /api/notaire/actes              - Récupérer la liste des actes
POST /api/notaire/actes              - Créer un nouvel acte
GET  /api/notaire/actes/[id]         - Récupérer les détails d'un acte
PATCH /api/notaire/actes/[id]        - Mettre à jour un acte
DELETE /api/notaire/actes/[id]       - Supprimer un acte
```

### Parties (Signataires)
```
POST /api/notaire/parties            - Ajouter une partie à un acte
GET  /api/notaire/parties            - Récupérer les parties d'un acte
```

### Registre
```
POST /api/notaire/registre           - Enregistrer un acte
GET  /api/notaire/registre           - Récupérer les informations d'enregistrement
```

### Aide
```
GET  /api/notaire/aides              - Récupérer les aides/conseils
POST /api/notaire/aides              - Créer une aide personnalisée
```

## Pages Disponibles

### Dashboard Principal
**Route:** `/dashboard/notaire`
- Vue d'ensemble des statistiques
- Tableau de bord avec les actes récents
- Liens rapides vers les différents modules

### Gestion des Actes
**Route:** `/dashboard/notaire/actes`
- Liste complète des actes avec filtres
- Options de recherche et tri
- Création rapide de nouveaux actes

### Créer un Acte
**Route:** `/dashboard/notaire/nouveau-acte`
- Assistant étape par étape pour créer un acte
- Validation des données
- Confirmation avant sauvegarde

### Détails d'un Acte
**Route:** `/dashboard/notaire/actes/[id]`
- Vue complète d'un acte
- Gestion des parties (signataires)
- Enregistrement au registre
- Historique et modifications

### Registre Notarial
**Route:** `/dashboard/notaire/registre`
- Affichage du registre complet
- Recherche et filtrage des actes enregistrés
- Exportation de rapports

### Système d'Aide
**Route:** `/dashboard/notaire/aide`
- Base de connaissances intégrée
- Conseils juridiques
- Procédures guidées
- Modèles et templates

## Configuration Prisma

Pour utiliser ce dashboard, vous devez migrer votre base de données avec les nouveaux modèles:

```bash
npx prisma migrate dev --name add_notaire_models
```

Les modèles suivants seront créés:
- `ActeNotarie` - Actes notariés
- `RegistreNotariae` - Registre d'enregistrement
- `Partie` - Parties/Signataires
- `AideNotaire` - Aides et conseils
- `TemplateActe` - Modèles d'actes

## Accès au Dashboard

Les utilisateurs avec le rôle `NOTAIRE` accèdent directement au dashboard:
```
/dashboard/notaire
```

## Statuts des Actes

| Statut | Description |
|--------|-------------|
| EN_COURS | Acte en préparation |
| SIGNE | Acte signé par les parties |
| ENREGISTRE | Acte enregistré au registre |
| ARCHIVE | Acte archivé et clôturé |

## Conformité Légale

Ce dashboard est conçu en conformité avec:
- 📋 Code du notariat algérien
- ⚖️ Loi sur les transactions électroniques
- 🏛️ Réglementations d'enregistrement foncier
- 📝 Directives d'authentification

## Conseils d'Utilisation

### ✓ Bonnes pratiques
- Vérifier les identités de tous les signataires
- Maintenir des registres complets et à jour
- Utiliser les modèles fournis pour la cohérence
- Faire un suivi régulier des délais légaux
- Documenter toutes les modifications d'actes

### ⚠️ Points d'attention
- Conserver les signatures numériques avec soin
- Ne pas modifier les actes enregistrés
- Respecter les délais de conservation (25 ans minimum)
- Vérifier la légalité des actes avant signature
- Consulter les autorités en cas de doute

## Support et Assistance

Pour les questions sur le fonctionnement du dashboard ou les procédures notariales, consultez le système d'aide intégré via:
**Route:** `/dashboard/notaire/aide`

## Informations de Contact

Pour les problèmes techniques ou suggestions d'amélioration, contactez le support.

---

**Dernière mise à jour:** Juin 2026
**Version:** 1.0
