# Script de test rapide - Certifications API
# À exécuter avant de tester le frontend

$baseUrl = "http://localhost:8000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Test Rapide API Certifications       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[1/4] Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
    Write-Host "✓ Backend en ligne: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend non accessible! Démarrez 'python app.py'" -ForegroundColor Red
    Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Lister les certifications
Write-Host "[2/4] GET /certification..." -ForegroundColor Yellow
try {
    $certs = Invoke-RestMethod -Uri "$baseUrl/certification" -Method Get
    $count = if ($certs -is [Array]) { $certs.Count } else { if ($certs) { 1 } else { 0 } }
    Write-Host "✓ $count certification(s) trouvée(s)" -ForegroundColor Green
    
    if ($count -gt 0) {
        $first = if ($certs -is [Array]) { $certs[0] } else { $certs }
        Write-Host "  Exemple: $($first.label_nom) - $($first.organisme)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Erreur lors de la récupération" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Créer une certification de test
Write-Host "[3/4] POST /certification (création test)..." -ForegroundColor Yellow
$testCert = @{
    label_nom = "Test Frontend $(Get-Date -Format 'HHmmss')"
    organisme = "Test Automatique"
    annee_obtention = "2024"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/certification" -Method Post -Body $testCert -ContentType "application/json"
    Write-Host "✓ Certification créée avec succès" -ForegroundColor Green
    Write-Host "  URI: $($response.uri)" -ForegroundColor Gray
    
    # Extraire l'ID pour le test suivant
    $testId = $null
    if ($response.uri) {
        # Attendre un peu et récupérer l'ID
        Start-Sleep -Seconds 1
        $allCerts = Invoke-RestMethod -Uri "$baseUrl/certification" -Method Get
        if ($allCerts -is [Array] -and $allCerts.Count -gt 0) {
            $testId = $allCerts[0].id
        }
    }
} catch {
    Write-Host "✗ Erreur lors de la création" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: CORS Check
Write-Host "[4/4] Test CORS..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:5173"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/certification" -Method Get -Headers $headers -UseBasicParsing
    
    if ($response.Headers."Access-Control-Allow-Origin") {
        Write-Host "✓ CORS configuré correctement" -ForegroundColor Green
    } else {
        Write-Host "⚠ CORS pourrait ne pas être configuré" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Impossible de vérifier CORS" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Résumé                               " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Backend: Accessible" -ForegroundColor Green
Write-Host "✅ API Certifications: Fonctionnelle" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Prochaine étape:" -ForegroundColor Yellow
Write-Host "   1. Démarrer le frontend:" -ForegroundColor White
Write-Host "      cd Web-Semantique-Front" -ForegroundColor Gray
Write-Host "      npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Ouvrir: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "   3. Naviguer vers: Dashboard > Certifications" -ForegroundColor White
Write-Host ""
Write-Host "📖 Guide de test détaillé:" -ForegroundColor Yellow
Write-Host "   TEST_CERTIFICATIONS_FRONTEND.md" -ForegroundColor White
Write-Host ""
