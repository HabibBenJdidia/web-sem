# ========================================
# Guide d'Utilisation d'AISalhi
# ========================================

Write-Host "`n===================================" -ForegroundColor Cyan
Write-Host "  Tests AISalhi - Assistant IA" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8000"

# ========================================
# 1. HELP - Obtenir les informations sur AISalhi
# ========================================
Write-Host "`n[1] Test : Informations sur AISalhi" -ForegroundColor Yellow
Write-Host "GET $baseUrl/ai/help" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/help" -Method GET
    Write-Host "✓ Nom: " -ForegroundColor Green -NoNewline
    Write-Host $response.name
    Write-Host "✓ Description: " -ForegroundColor Green -NoNewline
    Write-Host $response.description
    Write-Host "✓ Capacités:" -ForegroundColor Green
    $response.capabilities | ForEach-Object { Write-Host "  - $_" }
} catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ========================================
# 2. ASK - Question Simple
# ========================================
Write-Host "`n[2] Test : Question Simple (Ask)" -ForegroundColor Yellow
Write-Host "POST $baseUrl/ai/ask" -ForegroundColor Gray

$askBody = @{
    question = "Bonjour AISalhi, peux-tu te présenter en une phrase?"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/ask" -Method POST -Body $askBody -ContentType "application/json"
    Write-Host "Question: Bonjour AISalhi, peux-tu te présenter en une phrase?" -ForegroundColor Cyan
    Write-Host "Réponse: " -ForegroundColor Green -NoNewline
    Write-Host $response.response
} catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ========================================
# 3. CHAT - Conversation Interactive
# ========================================
Write-Host "`n[3] Test : Chat Interactif" -ForegroundColor Yellow
Write-Host "POST $baseUrl/ai/chat" -ForegroundColor Gray

$chatBody = @{
    message = "Quelles sont les activités écologiques disponibles dans le système?"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/chat" -Method POST -Body $chatBody -ContentType "application/json"
    Write-Host "Message: Quelles sont les activités écologiques disponibles?" -ForegroundColor Cyan
    Write-Host "Réponse AISalhi:" -ForegroundColor Green
    Write-Host $response.response
} catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ========================================
# 4. SPARQL - Générer et Exécuter une Requête
# ========================================
Write-Host "`n[4] Test : Génération de Requête SPARQL" -ForegroundColor Yellow
Write-Host "POST $baseUrl/ai/sparql" -ForegroundColor Gray

$sparqlBody = @{
    query = @"
PREFIX eco: <http://example.org/eco-tourism#>
SELECT ?ville ?nom WHERE {
    ?ville a eco:Ville .
    ?ville eco:nom ?nom .
} LIMIT 5
"@
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/sparql" -Method POST -Body $sparqlBody -ContentType "application/json"
    Write-Host "✓ Requête exécutée avec succès" -ForegroundColor Green
    Write-Host "Résultats trouvés: " -NoNewline
    if ($response.results) {
        Write-Host $response.results.Count -ForegroundColor Cyan
        Write-Host "Premières villes:" -ForegroundColor Yellow
        $response.results | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - $($_.nom)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ========================================
# 5. RECOMMANDATIONS - Activités Personnalisées
# ========================================
Write-Host "`n[5] Test : Recommandations d'Activités" -ForegroundColor Yellow
Write-Host "POST $baseUrl/ai/recommend-activities" -ForegroundColor Gray

$recommendBody = @{
    age = 30
    nationalite = "TN"
    preferences = @("nature", "eco-friendly", "randonnée")
    budget = 150
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/recommend-activities" -Method POST -Body $recommendBody -ContentType "application/json"
    Write-Host "Profil: Tunisien, 30 ans, Budget: 150€" -ForegroundColor Cyan
    Write-Host "Préférences: nature, eco-friendly, randonnée" -ForegroundColor Cyan
    Write-Host "`nRecommandations AISalhi:" -ForegroundColor Green
    Write-Host $response.recommendations
} catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ========================================
# 6. QUESTION SUR LES DONNÉES
# ========================================
Write-Host "`n[6] Test : Question sur les Certifications" -ForegroundColor Yellow

$certQuestion = @{
    question = "Combien de certifications écologiques sont disponibles dans le système?"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/ask" -Method POST -Body $certQuestion -ContentType "application/json"
    Write-Host "Question: Combien de certifications écologiques disponibles?" -ForegroundColor Cyan
    Write-Host "Réponse: " -ForegroundColor Green -NoNewline
    Write-Host $response.response
} catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ========================================
# 7. QUESTION SUR LES ÉVÉNEMENTS
# ========================================
Write-Host "`n[7] Test : Question sur les Événements" -ForegroundColor Yellow

$eventQuestion = @{
    question = "Quels sont les événements écologiques prévus?"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/ask" -Method POST -Body $eventQuestion -ContentType "application/json"
    Write-Host "Question: Quels sont les événements écologiques prévus?" -ForegroundColor Cyan
    Write-Host "Réponse: " -ForegroundColor Green -NoNewline
    Write-Host $response.response
} catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# ========================================
# 8. RESET CHAT SESSION
# ========================================
Write-Host "`n[8] Test : Réinitialiser la Session" -ForegroundColor Yellow
Write-Host "POST $baseUrl/ai/reset" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/reset" -Method POST
    Write-Host "✓ Session réinitialisée: " -ForegroundColor Green -NoNewline
    Write-Host $response.message
} catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
}

# ========================================
# RÉSUMÉ
# ========================================
Write-Host "`n===================================" -ForegroundColor Cyan
Write-Host "  Tests Terminés" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

Write-Host "`n✓ Tous les endpoints AISalhi ont été testés!" -ForegroundColor Green
Write-Host "`nEndpoints disponibles:" -ForegroundColor Yellow
Write-Host "  1. GET  /ai/help                      - Informations sur AISalhi"
Write-Host "  2. POST /ai/ask                       - Question simple"
Write-Host "  3. POST /ai/chat                      - Chat interactif"
Write-Host "  4. POST /ai/sparql                    - Requêtes SPARQL"
Write-Host "  5. POST /ai/recommend-activities      - Recommandations"
Write-Host "  6. GET  /ai/eco-score/<type>/<uri>    - Score écologique"
Write-Host "  7. POST /ai/reset                     - Réinitialiser session"

Write-Host "`nDocumentation complète:" -ForegroundColor Yellow
Write-Host "  - AISALHI_README.md       (Guide complet)"
Write-Host "  - QUICKSTART_AISALHI.md   (Démarrage rapide)"
Write-Host "  - MIGRATION_AISALHI.md    (Migration depuis Gemini)"
Write-Host "  - CHANGEMENTS_AISALHI.md  (Résumé des changements)"

Write-Host "`n" -NoNewline
