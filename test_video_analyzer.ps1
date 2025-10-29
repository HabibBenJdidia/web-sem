# Test Video Analyzer - PowerShell Script
# Tests the video analyzer functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST ANALYSEUR VIDEO AI (AISALHI)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$API_BASE_URL = "http://localhost:8000"
$FRONTEND_URL = "http://localhost:5173"

# Function to test endpoint availability
function Test-EndpointAvailability {
    Write-Host "🔍 Test de disponibilité de l'endpoint..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE_URL/ai/analyze-video" -Method OPTIONS -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "✅ Endpoint disponible (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Endpoint non disponible" -ForegroundColor Red
        Write-Host "💡 Vérifiez que le backend est démarré avec: docker-compose up -d" -ForegroundColor Yellow
        return $false
    }
}

# Function to test with video file
function Test-VideoUpload {
    param (
        [string]$VideoPath = "test_video.webm"
    )
    
    Write-Host "`n🎥 Test d'upload et analyse vidéo..." -ForegroundColor Yellow
    
    if (-not (Test-Path $VideoPath)) {
        Write-Host "⚠️  Fichier vidéo non trouvé: $VideoPath" -ForegroundColor Yellow
        Write-Host "💡 Créez un fichier de test ou utilisez l'interface web pour tester" -ForegroundColor Cyan
        return
    }
    
    Write-Host "✅ Fichier trouvé: $VideoPath" -ForegroundColor Green
    $fileSize = (Get-Item $VideoPath).Length
    Write-Host "📊 Taille: $fileSize bytes" -ForegroundColor Cyan
    
    Write-Host "`n🚀 Envoi de la requête..." -ForegroundColor Yellow
    Write-Host "⏳ Analyse en cours (peut prendre 15-30 secondes)..." -ForegroundColor Cyan
    
    try {
        # Prepare multipart form data
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        # Read video file
        $videoBytes = [System.IO.File]::ReadAllBytes($VideoPath)
        
        # Build multipart body
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"video`"; filename=`"test_video.webm`"",
            "Content-Type: video/webm",
            "",
            [System.Text.Encoding]::Latin1.GetString($videoBytes),
            "--$boundary",
            "Content-Disposition: form-data; name=`"message`"",
            "",
            "Test d'analyse vidéo - Détecte l'ambiance et recommande des événements",
            "--$boundary--"
        )
        
        $body = $bodyLines -join $LF
        
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/ai/analyze-video" `
            -Method POST `
            -ContentType "multipart/form-data; boundary=$boundary" `
            -Body ([System.Text.Encoding]::Latin1.GetBytes($body)) `
            -TimeoutSec 60
        
        Write-Host "`n✅ SUCCÈS - Analyse terminée !" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        
        # Display vibe analysis
        if ($response.vibe_analysis) {
            Write-Host "`n🎭 ANALYSE DE L'AMBIANCE" -ForegroundColor Cyan
            Write-Host "----------------------------------------" -ForegroundColor Gray
            
            if ($response.vibe_analysis.mood) {
                Write-Host "  Ambiance: $($response.vibe_analysis.mood)" -ForegroundColor White
            }
            
            if ($response.vibe_analysis.keywords) {
                $keywords = $response.vibe_analysis.keywords -join ", "
                Write-Host "  Mots-clés: $keywords" -ForegroundColor White
            }
            
            if ($response.vibe_analysis.visual_description) {
                Write-Host "`n  Description visuelle:" -ForegroundColor White
                Write-Host "    $($response.vibe_analysis.visual_description)" -ForegroundColor Gray
            }
            
            if ($response.vibe_analysis.audio_description) {
                Write-Host "`n  Description audio:" -ForegroundColor White
                Write-Host "    $($response.vibe_analysis.audio_description)" -ForegroundColor Gray
            }
        }
        
        # Display event recommendations
        if ($response.event_recommendations -and $response.event_recommendations.Count -gt 0) {
            Write-Host "`n`n🎉 RECOMMANDATIONS D'ÉVÉNEMENTS" -ForegroundColor Cyan
            Write-Host "----------------------------------------" -ForegroundColor Gray
            
            $i = 1
            foreach ($event in $response.event_recommendations) {
                $eventName = if ($event.event_name) { $event.event_name } else { $event.name }
                Write-Host "`n  $i. $eventName" -ForegroundColor Yellow
                
                if ($event.event_type) {
                    Write-Host "     Type: $($event.event_type)" -ForegroundColor White
                }
                
                if ($event.match_score) {
                    Write-Host "     Score: $($event.match_score)%" -ForegroundColor Green
                }
                
                if ($event.description) {
                    Write-Host "     Description: $($event.description)" -ForegroundColor Gray
                }
                
                $reason = if ($event.why_similar) { $event.why_similar } else { $event.reason }
                if ($reason) {
                    Write-Host "     Pourquoi: $reason" -ForegroundColor Cyan
                }
                
                $i++
            }
        }
        
        # Display confidence score
        if ($response.confidence_score) {
            Write-Host "`n`n📊 NIVEAU DE CONFIANCE: $($response.confidence_score)%" -ForegroundColor Magenta
        }
        
        Write-Host "`n========================================" -ForegroundColor Green
        
    }
    catch {
        Write-Host "`n❌ ERREUR" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            try {
                $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
                Write-Host "Détails: $($errorJson.error)" -ForegroundColor Yellow
            }
            catch {
                Write-Host "Détails: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
            }
        }
    }
}

# Function to check Docker containers
function Test-DockerContainers {
    Write-Host "`n🐳 Vérification des conteneurs Docker..." -ForegroundColor Yellow
    
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "web-sem"
        
        if ($containers) {
            Write-Host "✅ Conteneurs actifs:" -ForegroundColor Green
            $containers | ForEach-Object { Write-Host "   $_" -ForegroundColor Cyan }
        }
        else {
            Write-Host "⚠️  Aucun conteneur web-sem actif" -ForegroundColor Yellow
            Write-Host "💡 Démarrez avec: docker-compose up -d" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Host "❌ Docker n'est pas disponible ou non démarré" -ForegroundColor Red
    }
}

# Main execution
Write-Host "📋 TESTS PRÉLIMINAIRES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Gray

# Check Docker
Test-DockerContainers

# Check endpoint
Write-Host ""
$endpointAvailable = Test-EndpointAvailability

# Test video upload if endpoint is available
if ($endpointAvailable) {
    Test-VideoUpload
}

# Display manual test instructions
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📋 INSTRUCTIONS POUR TEST MANUEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""
Write-Host "1. Ouvrez $FRONTEND_URL/dashboard/video-analyzer" -ForegroundColor White
Write-Host "2. Autorisez l'accès à la caméra et au microphone" -ForegroundColor White
Write-Host "3. Enregistrez une vidéo courte (10-30 secondes)" -ForegroundColor White
Write-Host "4. Ajoutez un message optionnel" -ForegroundColor White
Write-Host "5. Cliquez sur 'Analyser avec l'IA'" -ForegroundColor White
Write-Host "6. Attendez les résultats (15-30 secondes)" -ForegroundColor White
Write-Host ""
Write-Host "💡 IDÉES DE TESTS:" -ForegroundColor Yellow
Write-Host "   ✨ Vidéo festive (musique, danse)" -ForegroundColor Cyan
Write-Host "   🌿 Vidéo calme (nature, paysage)" -ForegroundColor Cyan
Write-Host "   🏃 Vidéo d'activité (sport, randonnée)" -ForegroundColor Cyan
Write-Host "   🎨 Vidéo culturelle (art, exposition)" -ForegroundColor Cyan
Write-Host ""

# Offer to open browser
Write-Host "========================================" -ForegroundColor Cyan
$openBrowser = Read-Host "Voulez-vous ouvrir l'interface dans le navigateur? (O/N)"

if ($openBrowser -eq "O" -or $openBrowser -eq "o") {
    Write-Host "🌐 Ouverture du navigateur..." -ForegroundColor Green
    Start-Process "$FRONTEND_URL/dashboard/video-analyzer"
}

Write-Host "`n✅ Tests terminés!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
