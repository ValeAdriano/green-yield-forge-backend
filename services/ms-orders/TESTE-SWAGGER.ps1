# Script de Teste Rápido - Swagger MS Orders
Write-Host "`n🧪 TESTANDO SWAGGER MS-ORDERS`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8082"

# Teste 1: Servidor está rodando?
Write-Host "1. Testando se o servidor está rodando..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -UseBasicParsing -TimeoutSec 2
    Write-Host "   ✅ Servidor está rodando! (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Servidor NÃO está rodando!" -ForegroundColor Red
    Write-Host "   💡 Execute: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Teste 2: Health check
Write-Host "`n2. Testando health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/healthz" -UseBasicParsing
    Write-Host "   ✅ Health check OK" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Health check falhou" -ForegroundColor Yellow
}

# Teste 3: Swagger JSON
Write-Host "`n3. Testando Swagger JSON..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api-docs.json" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    $endpoints = if ($json.paths) { $json.paths.PSObject.Properties.Count } else { 0 }
    Write-Host "   ✅ Swagger JSON OK ($endpoints endpoints encontrados)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Swagger JSON não encontrado (404)" -ForegroundColor Red
}

# Teste 4: Swagger UI
Write-Host "`n4. Testando Swagger UI..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api-docs" -UseBasicParsing
    if ($response.Content -match "swagger" -or $response.Content -match "Swagger") {
        Write-Host "   ✅ Swagger UI está funcionando!" -ForegroundColor Green
        Write-Host "`n🌐 Abra no navegador: $baseUrl/api-docs" -ForegroundColor Cyan
        Write-Host "   Ou clique aqui: " -NoNewline -ForegroundColor Gray
        Write-Host "$baseUrl/api-docs" -ForegroundColor Blue -Underline
    } else {
        Write-Host "   ⚠️  Swagger UI retornou conteúdo inesperado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Swagger UI não encontrado (404)" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n✅ Teste completo!`n" -ForegroundColor Green

