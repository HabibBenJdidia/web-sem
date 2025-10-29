# Test rapide des pages front-office
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  TEST PAGES FRONT-OFFICE" -ForegroundColor Cyan
Write-Host "  Certifications & Evenements" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le backend est accessible
Write-Host "[1/4] Verification du backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -ErrorAction Stop
    Write-Host "  OK Backend actif" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR Le backend n'est pas accessible!" -ForegroundColor Red
    Write-Host "  Demarrez le backend avec: python app.py" -ForegroundColor Yellow
    exit 1
}

# Vérifier les certifications
Write-Host ""
Write-Host "[2/4] Verification des certifications..." -ForegroundColor Yellow
try {
    $certs = Invoke-RestMethod -Uri "http://localhost:8000/certification" -Method Get -ErrorAction Stop
    $certCount = $certs.Count
    Write-Host "  OK $certCount certification(s) trouvee(s)" -ForegroundColor Green
    
    if ($certCount -gt 0) {
        Write-Host "  Exemple:" -ForegroundColor Cyan
        $firstCert = $certs[0]
        Write-Host "    - ID: $($firstCert.id)" -ForegroundColor White
        Write-Host "    - Nom: $($firstCert.nom)" -ForegroundColor White
        Write-Host "    - Organisme: $($firstCert.organisme_certificateur)" -ForegroundColor White
    }
} catch {
    Write-Host "  ERREUR Impossible de charger les certifications" -ForegroundColor Red
}

# Vérifier les événements
Write-Host ""
Write-Host "[3/4] Verification des evenements..." -ForegroundColor Yellow
try {
    $events = Invoke-RestMethod -Uri "http://localhost:8000/evenement" -Method Get -ErrorAction Stop
    $eventCount = $events.Count
    Write-Host "  OK $eventCount evenement(s) trouve(s)" -ForegroundColor Green
    
    if ($eventCount -gt 0) {
        Write-Host "  Exemple:" -ForegroundColor Cyan
        $firstEvent = $events[0]
        Write-Host "    - ID: $($firstEvent.id)" -ForegroundColor White
        Write-Host "    - Nom: $($firstEvent.nom)" -ForegroundColor White
        Write-Host "    - Date: $($firstEvent.event_date)" -ForegroundColor White
        Write-Host "    - Prix: $($firstEvent.event_prix) EUR" -ForegroundColor White
    }
} catch {
    Write-Host "  ERREUR Impossible de charger les evenements" -ForegroundColor Red
}

# Vérifier les villes
Write-Host ""
Write-Host "[4/4] Verification des villes..." -ForegroundColor Yellow
try {
    $villes = Invoke-RestMethod -Uri "http://localhost:8000/ville" -Method Get -ErrorAction Stop
    
    # Parser les villes (format SPARQL)
    $villesMap = @{}
    foreach ($row in $villes) {
        $uri = $row.s.value
        $predicate = $row.p.value.Split('#')[1]
        $value = $row.o.value
        
        if (-not $villesMap.ContainsKey($uri)) {
            $villesMap[$uri] = @{ uri = $uri; nom = $null }
        }
        
        if ($predicate -eq 'nom') {
            $villesMap[$uri].nom = $value
        }
    }
    
    $villesList = $villesMap.Values | Where-Object { $_.nom -ne $null }
    $villeCount = $villesList.Count
    
    Write-Host "  OK $villeCount ville(s) trouvee(s)" -ForegroundColor Green
    
    if ($villeCount -gt 0) {
        Write-Host "  Villes disponibles:" -ForegroundColor Cyan
        foreach ($ville in $villesList | Select-Object -First 5) {
            Write-Host "    - $($ville.nom)" -ForegroundColor White
        }
        if ($villeCount -gt 5) {
            Write-Host "    ... et $($villeCount - 5) autre(s)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  ERREUR Impossible de charger les villes" -ForegroundColor Red
}

# Résumé
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  RESUME" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pages front-office disponibles a :" -ForegroundColor Yellow
Write-Host "  http://localhost:5173/public/certifications" -ForegroundColor Green
Write-Host "  http://localhost:5173/public/evenements" -ForegroundColor Green
Write-Host ""
Write-Host "Navigation :" -ForegroundColor Yellow
Write-Host "  1. Ouvrez http://localhost:5173" -ForegroundColor White
Write-Host "  2. Cliquez sur 'Certifications' dans le menu" -ForegroundColor White
Write-Host "  3. Ou cliquez sur 'Evenements' dans le menu" -ForegroundColor White
Write-Host ""
Write-Host "Fonctionnalites :" -ForegroundColor Yellow
Write-Host "  - Recherche par nom" -ForegroundColor White
Write-Host "  - Filtres (type, ville, date)" -ForegroundColor White
Write-Host "  - Statistiques en temps reel" -ForegroundColor White
Write-Host "  - Design responsive" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  TEST TERMINE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
