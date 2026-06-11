#!/usr/bin/env pwsh

# Script de déploiement El-Minassa sur Vercel
# Usage: ./deploy.ps1

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     El-Minassa Chat Platform - Déploiement        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifications préalables
Write-Host "🔍 Vérifications préalables..." -ForegroundColor Yellow

# Vérifier Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js détecté" -ForegroundColor Green

# Vérifier npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm n'est pas installé" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm détecté" -ForegroundColor Green

# Vérifier Vercel CLI
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Vercel CLI n'est pas installé" -ForegroundColor Yellow
    Write-Host "Installation de Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installé" -ForegroundColor Green
}
Write-Host "✅ Vercel CLI détecté" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
}
Write-Host "✅ Dépendances OK" -ForegroundColor Green

Write-Host ""
Write-Host "🔨 Build du projet..." -ForegroundColor Yellow

# Build du projet
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build réussi" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Déploiement sur Vercel..." -ForegroundColor Yellow
Write-Host ""

# Déploiement
vercel deploy --prod

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         Déploiement terminé avec succès! 🎉        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Vérifiez votre projet sur: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  2. Configurez votre domaine personnalisé" -ForegroundColor White
Write-Host "  3. Ajoutez les variables d'environnement si ce n'est pas fait" -ForegroundColor White
Write-Host "  4. Exécutez les migrations: npx prisma migrate deploy" -ForegroundColor White
Write-Host ""
