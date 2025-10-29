# Script de test pour les endpoints Certification et Evenement
# PowerShell

$baseUrl = "http://localhost:8000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test des Endpoints API - Certifications & Événements" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Créer une certification
Write-Host "[1/8] Test: Créer une certification..." -ForegroundColor Yellow
$certBody = @{
    label_nom = "Écolabel Test"
    organisme = "Commission Test"
    annee_obtention = "2024"
} | ConvertTo-Json

try {
    $certResponse = Invoke-RestMethod -Uri "$baseUrl/certification" -Method Post -Body $certBody -ContentType "application/json"
    Write-Host "✓ Certification créée avec succès" -ForegroundColor Green
    Write-Host "  URI: $($certResponse.uri)" -ForegroundColor Gray
    $certId = $certResponse.uri -replace '.*#CertificationEco_', '' -replace '.*_', ''
} catch {
    Write-Host "✗ Erreur lors de la création de la certification" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 2: Lister toutes les certifications
Write-Host "[2/8] Test: Lister toutes les certifications..." -ForegroundColor Yellow
try {
    $allCerts = Invoke-RestMethod -Uri "$baseUrl/certification" -Method Get
    $certCount = if ($allCerts -is [Array]) { $allCerts.Count } else { 1 }
    Write-Host "✓ $certCount certification(s) trouvée(s)" -ForegroundColor Green
    
    # Afficher le premier
    if ($certCount -gt 0) {
        $firstCert = if ($allCerts -is [Array]) { $allCerts[0] } else { $allCerts }
        Write-Host "  Exemple: ID=$($firstCert.id), Label=$($firstCert.label_nom)" -ForegroundColor Gray
        $testCertId = $firstCert.id
    }
} catch {
    Write-Host "✗ Erreur lors de la récupération des certifications" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 3: Obtenir une certification par ID
if ($testCertId) {
    Write-Host "[3/8] Test: Obtenir la certification par ID $testCertId..." -ForegroundColor Yellow
    try {
        $cert = Invoke-RestMethod -Uri "$baseUrl/certification/id/$testCertId" -Method Get
        Write-Host "✓ Certification récupérée: $($cert.label_nom)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur lors de la récupération" -ForegroundColor Red
    }
} else {
    Write-Host "[3/8] Test: Ignoré (pas d'ID disponible)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Test 4: Créer un événement
Write-Host "[4/8] Test: Créer un événement..." -ForegroundColor Yellow
$eventBody = @{
    nom = "Festival Éco Test"
    event_date = "2025-12-25"
    event_duree_heures = 6
    event_prix = 50.0
    a_lieu_dans = "http://example.org/eco-tourism#Ville_Tunis"
} | ConvertTo-Json

try {
    $eventResponse = Invoke-RestMethod -Uri "$baseUrl/evenement" -Method Post -Body $eventBody -ContentType "application/json"
    Write-Host "✓ Événement créé avec succès" -ForegroundColor Green
    Write-Host "  URI: $($eventResponse.uri)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Erreur lors de la création de l'événement" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 5: Lister tous les événements
Write-Host "[5/8] Test: Lister tous les événements..." -ForegroundColor Yellow
try {
    $allEvents = Invoke-RestMethod -Uri "$baseUrl/evenement" -Method Get
    $eventCount = if ($allEvents -is [Array]) { $allEvents.Count } else { 1 }
    Write-Host "✓ $eventCount événement(s) trouvé(s)" -ForegroundColor Green
    
    # Afficher le premier
    if ($eventCount -gt 0) {
        $firstEvent = if ($allEvents -is [Array]) { $allEvents[0] } else { $allEvents }
        Write-Host "  Exemple: ID=$($firstEvent.id), Nom=$($firstEvent.nom), Date=$($firstEvent.event_date)" -ForegroundColor Gray
        $testEventId = $firstEvent.id
    }
} catch {
    Write-Host "✗ Erreur lors de la récupération des événements" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 6: Obtenir un événement par ID
if ($testEventId) {
    Write-Host "[6/8] Test: Obtenir l'événement par ID $testEventId..." -ForegroundColor Yellow
    try {
        $event = Invoke-RestMethod -Uri "$baseUrl/evenement/id/$testEventId" -Method Get
        Write-Host "✓ Événement récupéré: $($event.nom)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur lors de la récupération" -ForegroundColor Red
    }
} else {
    Write-Host "[6/8] Test: Ignoré (pas d'ID disponible)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Test 7: Mettre à jour un événement
if ($testEventId) {
    Write-Host "[7/8] Test: Mettre à jour l'événement $testEventId..." -ForegroundColor Yellow
    $updateBody = @{
        nom = "Festival Éco Test - MODIFIÉ"
        event_date = "2025-12-26"
        event_duree_heures = 8
        event_prix = 60.0
        a_lieu_dans = "http://example.org/eco-tourism#Ville_Tunis"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/evenement/id/$testEventId" -Method Put -Body $updateBody -ContentType "application/json"
        Write-Host "✓ Événement mis à jour avec succès" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur lors de la mise à jour" -ForegroundColor Red
    }
} else {
    Write-Host "[7/8] Test: Ignoré (pas d'ID disponible)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Test 8: Health check
Write-Host "[8/8] Test: Health check de l'API..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✓ API Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ L'API ne répond pas" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests terminés!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour nettoyer les données de test:" -ForegroundColor Yellow
if ($testCertId) {
    Write-Host "  Invoke-RestMethod -Uri '$baseUrl/certification/id/$testCertId' -Method Delete" -ForegroundColor Gray
}
if ($testEventId) {
    Write-Host "  Invoke-RestMethod -Uri '$baseUrl/evenement/id/$testEventId' -Method Delete" -ForegroundColor Gray
}
