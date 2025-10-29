# Script pour créer des villes de test

$baseUrl = "http://localhost:8000"

Write-Host "Creation de villes de test..." -ForegroundColor Yellow
Write-Host ""

# Ville 1: Tunis
$body1 = '{"nom":"Tunis","pays":"Tunisie","climat":"Mediterraneen"}'
try {
    Invoke-RestMethod -Uri "$baseUrl/ville" -Method Post -Body $body1 -ContentType "application/json" | Out-Null
    Write-Host "OK Tunis creee" -ForegroundColor Green
} catch { Write-Host "Erreur Tunis" -ForegroundColor Red }

# Ville 2: Sousse
$body2 = '{"nom":"Sousse","pays":"Tunisie","climat":"Mediterraneen"}'
try {
    Invoke-RestMethod -Uri "$baseUrl/ville" -Method Post -Body $body2 -ContentType "application/json" | Out-Null
    Write-Host "OK Sousse creee" -ForegroundColor Green
} catch { Write-Host "Erreur Sousse" -ForegroundColor Red }

# Ville 3: Sfax
$body3 = '{"nom":"Sfax","pays":"Tunisie","climat":"Mediterraneen"}'
try {
    Invoke-RestMethod -Uri "$baseUrl/ville" -Method Post -Body $body3 -ContentType "application/json" | Out-Null
    Write-Host "OK Sfax creee" -ForegroundColor Green
} catch { Write-Host "Erreur Sfax" -ForegroundColor Red }

# Ville 4: Hammamet
$body4 = '{"nom":"Hammamet","pays":"Tunisie","climat":"Mediterraneen"}'
try {
    Invoke-RestMethod -Uri "$baseUrl/ville" -Method Post -Body $body4 -ContentType "application/json" | Out-Null
    Write-Host "OK Hammamet creee" -ForegroundColor Green
} catch { Write-Host "Erreur Hammamet" -ForegroundColor Red }

# Ville 5: Djerba
$body5 = '{"nom":"Djerba","pays":"Tunisie","climat":"Mediterraneen"}'
try {
    Invoke-RestMethod -Uri "$baseUrl/ville" -Method Post -Body $body5 -ContentType "application/json" | Out-Null
    Write-Host "OK Djerba creee" -ForegroundColor Green
} catch { Write-Host "Erreur Djerba" -ForegroundColor Red }

Write-Host ""
Write-Host "Verification..." -ForegroundColor Yellow
$allVilles = Invoke-RestMethod -Uri "$baseUrl/ville" -Method Get
Write-Host "Total villes:" $allVilles.Count -ForegroundColor Cyan
Write-Host ""
Write-Host "Termine ! Rafraichissez la page du frontend." -ForegroundColor Green
