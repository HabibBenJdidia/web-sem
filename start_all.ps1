# Script de démarrage automatique - Backend + Frontend
# Usage: .\start_all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Démarrage Eco-Tourism Application    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
$frontendPath = Join-Path $rootPath "Web-Semantique-Front"

# Vérifier si Python est installé
Write-Host "[1/5] Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier si Node.js est installé
Write-Host "[2/5] Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  ✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier si le dossier frontend existe
Write-Host "[3/5] Vérification du dossier frontend..." -ForegroundColor Yellow
if (Test-Path $frontendPath) {
    Write-Host "  ✓ Dossier frontend trouvé" -ForegroundColor Green
} else {
    Write-Host "  ✗ Dossier frontend introuvable: $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "[4/5] Démarrage du Backend..." -ForegroundColor Yellow
Write-Host "  → Flask sur http://localhost:8000" -ForegroundColor Gray

# Démarrer le backend dans une nouvelle fenêtre PowerShell
$backendScript = @"
cd '$rootPath'
python app.py
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

Write-Host "  ✓ Backend démarré dans une nouvelle fenêtre" -ForegroundColor Green
Start-Sleep -Seconds 3

Write-Host "[5/5] Démarrage du Frontend..." -ForegroundColor Yellow
Write-Host "  → Vite sur http://localhost:5173" -ForegroundColor Gray

# Démarrer le frontend dans une nouvelle fenêtre PowerShell
$frontendScript = @"
cd '$frontendPath'
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host "  ✓ Frontend démarré dans une nouvelle fenêtre" -ForegroundColor Green
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Application démarrée avec succès !   " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Attendre que les serveurs démarrent (30 secondes)" -ForegroundColor White
Write-Host "   2. Ouvrir http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "   3. Se connecter et explorer les nouvelles pages" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Pour arrêter:" -ForegroundColor Yellow
Write-Host "   Fermez les deux fenêtres PowerShell ouvertes" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   QUICK_START.md" -ForegroundColor White
Write-Host ""

# Attendre 5 secondes puis ouvrir le navigateur
Write-Host "Ouverture du navigateur dans 5 secondes..." -ForegroundColor Gray
Start-Sleep -Seconds 5

try {
    Start-Process "http://localhost:5173"
    Write-Host "✓ Navigateur ouvert" -ForegroundColor Green
} catch {
    Write-Host "⚠ Impossible d'ouvrir le navigateur automatiquement" -ForegroundColor Yellow
    Write-Host "  Ouvrez manuellement: http://localhost:5173" -ForegroundColor White
}

Write-Host ""
Write-Host "✨ Bon développement !" -ForegroundColor Cyan
Write-Host ""
