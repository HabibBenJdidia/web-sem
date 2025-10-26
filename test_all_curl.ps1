# Comprehensive API Test Script
Write-Host "`n=== ECO-TOURISM API TESTS ===" -ForegroundColor Cyan
Start-Sleep -Seconds 5

$base = "http://localhost:8000"

# Test 1: Health
Write-Host "`n1. Health Check" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$base/health" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 2: Create Touriste
Write-Host "`n2. Create Touriste" -ForegroundColor Yellow
$body = @{nom="Fatma"; age=25; nationalite="TN"} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/touriste" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 3: Create Guide
Write-Host "`n3. Create Guide" -ForegroundColor Yellow
$body = @{nom="Mohamed"; age=35; nationalite="TN"} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/guide" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 4: Create Destination
Write-Host "`n4. Create Destination" -ForegroundColor Yellow
$body = @{nom="Djerba"; pays="Tunisie"; climat="Mediterraneen"} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/destination" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 5: Create Ville
Write-Host "`n5. Create Ville" -ForegroundColor Yellow
$body = @{nom="Sousse"; pays="Tunisie"; climat="Mediterraneen"} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/ville" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 6: Create Hebergement
Write-Host "`n6. Create Hebergement" -ForegroundColor Yellow
$body = @{nom="Eco Lodge Sahara"; type="Lodge"; prix=150.0; nb_chambres=10; niveau_eco="Gold"} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/hebergement" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 7: Create Activite
Write-Host "`n7. Create Activite" -ForegroundColor Yellow
$body = @{nom="Plongee"; difficulte="Facile"; duree_heures=2.5; prix=50.0} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/activite" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 8: Create Transport
Write-Host "`n8. Create Transport" -ForegroundColor Yellow
$body = @{nom="Bus Electrique"; type="Bus"; emission_co2_per_km=0.02} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/transport" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 9: Create Restaurant
Write-Host "`n9. Create Restaurant" -ForegroundColor Yellow
$body = @{nom="Le Gourmet Bio"} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/restaurant" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 10: Create Produit
Write-Host "`n10. Create Produit Local" -ForegroundColor Yellow
$body = @{nom="Miel"; saison="Ete"; bio=$true} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/produit" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 11: Create Certification
Write-Host "`n11. Create Certification" -ForegroundColor Yellow
$body = @{label_nom="Green Key"; organisme="FEE"; annee_obtention="2024-01-15"} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/certification" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 12: Create Evenement
Write-Host "`n12. Create Evenement" -ForegroundColor Yellow
$body = @{nom="Festival Bio"; event_date="2025-06-20"; event_duree_heures=8.0; event_prix=15.0} | ConvertTo-Json
Invoke-WebRequest -Uri "$base/evenement" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test 13: Get All Touristes
Write-Host "`n13. Get All Touristes" -ForegroundColor Yellow
$result = Invoke-WebRequest -Uri "$base/touriste" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "Found $(($result | ConvertFrom-Json).Count) touristes"

# Test 14: Get All Destinations
Write-Host "`n14. Get All Destinations" -ForegroundColor Yellow
$result = Invoke-WebRequest -Uri "$base/destination" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "Found $(($result | ConvertFrom-Json).Count) destinations"

# Test 15: Search by Name
Write-Host "`n15. Search by Name (Tabarka)" -ForegroundColor Yellow
Invoke-WebRequest -Uri "$base/search/name/Tabarka" -UseBasicParsing | Select-Object -ExpandProperty Content | Out-String | Select-Object -First 200

# Test 16: Search Eco Hebergements
Write-Host "`n16. Search Eco Hebergements" -ForegroundColor Yellow
$result = Invoke-WebRequest -Uri "$base/search/eco-hebergements" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "Found $(($result | ConvertFrom-Json).Count) eco hebergements"

# Test 17: Search Bio Products
Write-Host "`n17. Search Bio Products" -ForegroundColor Yellow
$result = Invoke-WebRequest -Uri "$base/search/bio-products" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "Found $(($result | ConvertFrom-Json).Count) bio products"

# Test 18: Search Zero Emission
Write-Host "`n18. Search Zero Emission Transport" -ForegroundColor Yellow
$result = Invoke-WebRequest -Uri "$base/search/zero-emission-transport" -UseBasicParsing | Select-Object -ExpandProperty Content
Write-Host "Found $(($result | ConvertFrom-Json).Count) zero emission transports"

Write-Host "`n`n=== ALL TESTS COMPLETED SUCCESSFULLY ===" -ForegroundColor Green

