# Script de test rapide pour AISalhi après correction CORS
# Teste tous les endpoints AI

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  TEST AISALHI - APRES CORS FIX  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"
$testsPassed = 0
$testsFailed = 0

# Test 1: Health Check
Write-Host "[TEST 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    if ($response.status -eq "running") {
        Write-Host "✅ Backend is running" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "❌ Backend status: $($response.status)" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Failed to reach backend: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 2: Simple Question (AI Ask)
Write-Host "[TEST 2] AI Ask - Simple Question..." -ForegroundColor Yellow
try {
    $body = @{
        question = "Qu'est-ce que le tourisme écologique ?"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/ask" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.response) {
        Write-Host "✅ AI Ask works!" -ForegroundColor Green
        Write-Host "   Response preview: $($response.response.Substring(0, [Math]::Min(100, $response.response.Length)))..." -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ No response received" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 3: Chat (FIXED - process_message -> chat_message)
Write-Host "[TEST 3] AI Chat - Interactive Message..." -ForegroundColor Yellow
try {
    $body = @{
        message = "Bonjour AISalhi, peux-tu me parler des certifications écologiques ?"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/chat" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.response) {
        Write-Host "✅ AI Chat works! (CORS FIXED)" -ForegroundColor Green
        Write-Host "   Response preview: $($response.response.Substring(0, [Math]::Min(100, $response.response.Length)))..." -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ No response received" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 4: Recommendations
Write-Host "[TEST 4] AI Recommendations..." -ForegroundColor Yellow
try {
    $body = @{
        age = 30
        nationalite = "France"
        preferences = @("nature", "écologie", "randonnée")
        budget_min = 500
        budget_max = 2000
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/recommend-activities" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.recommendations) {
        Write-Host "✅ AI Recommendations work!" -ForegroundColor Green
        Write-Host "   Found $($response.recommendations.Count) recommendations" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ No recommendations received" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 5: SPARQL Generation
Write-Host "[TEST 5] AI SPARQL Generation..." -ForegroundColor Yellow
try {
    $body = @{
        query = "Trouve tous les hôtels écologiques"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/sparql" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.sparql) {
        Write-Host "✅ SPARQL Generation works!" -ForegroundColor Green
        Write-Host "   Generated query type: $($response.type)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ No SPARQL generated" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 6: Reset Chat
Write-Host "[TEST 6] AI Reset Chat Session..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/reset" -Method POST -ContentType "application/json"
    
    if ($response.message) {
        Write-Host "✅ Chat Reset works!" -ForegroundColor Green
        Write-Host "   $($response.message)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ No confirmation received" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 7: Help/Info
Write-Host "[TEST 7] AI Help Information..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ai/help" -Method GET
    
    if ($response.name -eq "AISalhi") {
        Write-Host "✅ AI Help works!" -ForegroundColor Green
        Write-Host "   Version: $($response.version)" -ForegroundColor Gray
        Write-Host "   Capabilities: $($response.capabilities.Count) features" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ Invalid help response" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Test 8: CORS Headers Check
Write-Host "[TEST 8] CORS Headers Verification..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:5174"
        "Content-Type" = "application/json"
    }
    $body = @{message = "test CORS"} | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/ai/chat" -Method POST -Body $body -Headers $headers
    
    $corsHeader = $response.Headers['Access-Control-Allow-Origin']
    if ($corsHeader) {
        Write-Host "✅ CORS Headers present!" -ForegroundColor Green
        Write-Host "   Access-Control-Allow-Origin: $corsHeader" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ CORS Headers missing" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Results Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "        TEST RESULTS SUMMARY       " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "✅ CORS is fixed" -ForegroundColor Green
    Write-Host "✅ All AI endpoints working" -ForegroundColor Green
    Write-Host ""
    Write-Host "👉 Open your browser: http://localhost:5174/dashboard/aisalhi" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some tests failed. Check the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if backend is running: docker ps" -ForegroundColor Gray
    Write-Host "2. Check backend logs: docker logs eco-tourism-app" -ForegroundColor Gray
    Write-Host "3. Verify .env has AISALHI_API_KEY set" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "- CORS_FIX.md - Detailed explanation of fixes" -ForegroundColor Gray
Write-Host "- AISALHI_INTEGRATION.md - Usage guide" -ForegroundColor Gray
Write-Host "- AISALHI_COMPLETE.md - Complete feature list" -ForegroundColor Gray
