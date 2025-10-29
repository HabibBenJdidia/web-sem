# Script de test complet pour Evenement et CertificationEco
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST CRUD - EVENEMENT & CERTIFICATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$base = "http://localhost:8000"

# ============================================
# TESTS EVENEMENT
# ============================================
Write-Host "`n[EVENEMENT] Tests CRUD complets" -ForegroundColor Yellow
Write-Host "----------------------------------------`n" -ForegroundColor Yellow

# 1. CREATE Evenement
Write-Host "1. CREATE - Créer un événement" -ForegroundColor Green
$eventBody = @{
    nom = "Festival Eco-Tourisme 2025"
    event_date = "2025-06-15"
    event_duree_heures = 48
    event_prix = 25.0
    a_lieu_dans = "http://example.org/eco-tourism#Ville_Tunis"
} | ConvertTo-Json

$createResponse = Invoke-WebRequest -Uri "$base/evenement" -Method POST -Body $eventBody -ContentType "application/json"
$createdEvent = $createResponse.Content | ConvertFrom-Json
Write-Host "   Statut: $($createResponse.StatusCode)" -ForegroundColor White
Write-Host "   URI créée: $($createdEvent.uri)" -ForegroundColor White
$eventUri = $createdEvent.uri

# 2. READ ALL Evenements
Write-Host "`n2. READ ALL - Lister tous les événements" -ForegroundColor Green
$allEvents = Invoke-WebRequest -Uri "$base/evenement" -UseBasicParsing | ConvertFrom-Json
Write-Host "   Nombre d'événements: $(if ($allEvents -is [array]) { $allEvents.Count } else { 1 })" -ForegroundColor White

# 3. READ ONE Evenement
Write-Host "`n3. READ ONE - Récupérer un événement spécifique" -ForegroundColor Green
$oneEvent = Invoke-WebRequest -Uri "$base/evenement/$eventUri" -UseBasicParsing | ConvertFrom-Json
Write-Host "   Événement récupéré: $($oneEvent.Count) propriétés" -ForegroundColor White

# 4. UPDATE Evenement
Write-Host "`n4. UPDATE - Modifier l'événement" -ForegroundColor Green
$updateBody = @{
    nom = "Festival Eco-Tourisme 2025 - MODIFIÉ"
    event_date = "2025-06-20"
    event_duree_heures = 72
    event_prix = 30.0
} | ConvertTo-Json

$updateResponse = Invoke-WebRequest -Uri "$base/evenement/$eventUri" -Method PUT -Body $updateBody -ContentType "application/json"
Write-Host "   Statut: $($updateResponse.StatusCode)" -ForegroundColor White
Write-Host "   Résultat: $($updateResponse.Content)" -ForegroundColor White

# 5. DELETE Evenement
Write-Host "`n5. DELETE - Supprimer l'événement" -ForegroundColor Green
$deleteResponse = Invoke-WebRequest -Uri "$base/evenement/$eventUri" -Method DELETE
Write-Host "   Statut: $($deleteResponse.StatusCode)" -ForegroundColor White
Write-Host "   Résultat: $($deleteResponse.Content)" -ForegroundColor White

# Vérification après suppression
Write-Host "`n6. VERIFICATION - Vérifier la suppression" -ForegroundColor Green
$finalEvents = Invoke-WebRequest -Uri "$base/evenement" -UseBasicParsing | ConvertFrom-Json
Write-Host "   Nombre d'événements après suppression: $(if ($finalEvents -is [array]) { $finalEvents.Count } else { if ($finalEvents) { 1 } else { 0 } })" -ForegroundColor White

# ============================================
# TESTS CERTIFICATION ECO
# ============================================
Write-Host "`n`n[CERTIFICATION ECO] Tests CRUD complets" -ForegroundColor Yellow
Write-Host "----------------------------------------`n" -ForegroundColor Yellow

# 1. CREATE Certification
Write-Host "1. CREATE - Créer une certification" -ForegroundColor Green
$certBody = @{
    label_nom = "Ecolabel Européen"
    organisme = "Commission Européenne"
    annee_obtention = "2024-01-15"
} | ConvertTo-Json

$createCertResponse = Invoke-WebRequest -Uri "$base/certification" -Method POST -Body $certBody -ContentType "application/json"
$createdCert = $createCertResponse.Content | ConvertFrom-Json
Write-Host "   Statut: $($createCertResponse.StatusCode)" -ForegroundColor White
Write-Host "   URI créée: $($createdCert.uri)" -ForegroundColor White
$certUri = $createdCert.uri

# 2. READ ALL Certifications
Write-Host "`n2. READ ALL - Lister toutes les certifications" -ForegroundColor Green
$allCerts = Invoke-WebRequest -Uri "$base/certification" -UseBasicParsing | ConvertFrom-Json
Write-Host "   Nombre de certifications: $(if ($allCerts -is [array]) { $allCerts.Count } else { 1 })" -ForegroundColor White

# 3. READ ONE Certification
Write-Host "`n3. READ ONE - Récupérer une certification spécifique" -ForegroundColor Green
$oneCert = Invoke-WebRequest -Uri "$base/certification/$certUri" -UseBasicParsing | ConvertFrom-Json
Write-Host "   Certification récupérée: $($oneCert.Count) propriétés" -ForegroundColor White

# 4. UPDATE Certification
Write-Host "`n4. UPDATE - Modifier la certification" -ForegroundColor Green
$updateCertBody = @{
    label_nom = "Ecolabel Européen Premium"
    organisme = "Commission Européenne - Département Environnement"
    annee_obtention = "2024-06-01"
} | ConvertTo-Json

$updateCertResponse = Invoke-WebRequest -Uri "$base/certification/$certUri" -Method PUT -Body $updateCertBody -ContentType "application/json"
Write-Host "   Statut: $($updateCertResponse.StatusCode)" -ForegroundColor White
Write-Host "   Résultat: $($updateCertResponse.Content)" -ForegroundColor White

# 5. DELETE Certification
Write-Host "`n5. DELETE - Supprimer la certification" -ForegroundColor Green
$deleteCertResponse = Invoke-WebRequest -Uri "$base/certification/$certUri" -Method DELETE
Write-Host "   Statut: $($deleteCertResponse.StatusCode)" -ForegroundColor White
Write-Host "   Résultat: $($deleteCertResponse.Content)" -ForegroundColor White

# Vérification après suppression
Write-Host "`n6. VERIFICATION - Vérifier la suppression" -ForegroundColor Green
$finalCerts = Invoke-WebRequest -Uri "$base/certification" -UseBasicParsing | ConvertFrom-Json
Write-Host "   Nombre de certifications après suppression: $(if ($finalCerts -is [array]) { $finalCerts.Count } else { if ($finalCerts) { 1 } else { 0 } })" -ForegroundColor White

# ============================================
# RÉSUMÉ FINAL
# ============================================
Write-Host "`n`n========================================" -ForegroundColor Cyan
Write-Host "RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ EVENEMENT - CRUD complet testé" -ForegroundColor Green
Write-Host "✅ CERTIFICATION ECO - CRUD complet testé" -ForegroundColor Green
Write-Host "`nTous les tests sont terminés !`n" -ForegroundColor Yellow
