# Script de Teste e Diagnóstico Docker
Write-Host "`n🔍 DIAGNÓSTICO DOCKER COMPOSE`n" -ForegroundColor Cyan

$errors = 0

# 1. Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    $composeVersion = docker compose version 2>&1
    Write-Host "   ✅ Docker: $dockerVersion" -ForegroundColor Green
    Write-Host "   ✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker não encontrado!" -ForegroundColor Red
    $errors++
}

# 2. Verificar arquivo .env
Write-Host "`n2. Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "   ✅ .env existe" -ForegroundColor Green
    $envContent = Get-Content .env -Raw
    if ($envContent -match "MONGODB_URI") {
        Write-Host "   ✅ MONGODB_URI encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MONGODB_URI não encontrado" -ForegroundColor Red
        $errors++
    }
    if ($envContent -match "SQLSERVER_URL") {
        Write-Host "   ✅ SQLSERVER_URL encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SQLSERVER_URL não encontrado" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   ❌ .env não existe!" -ForegroundColor Red
    Write-Host "   💡 Crie o arquivo .env na raiz do projeto" -ForegroundColor Yellow
    $errors++
}

# 3. Verificar portas
Write-Host "`n3. Verificando portas..." -ForegroundColor Yellow
$ports = @(8080, 8081, 8082)
foreach ($port in $ports) {
    $inUse = netstat -ano | findstr ":$port " | Select-Object -First 1
    if ($inUse) {
        Write-Host "   ⚠️  Porta $port está em uso" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Porta $port disponível" -ForegroundColor Green
    }
}

# 4. Verificar docker-compose.yml
Write-Host "`n4. Verificando docker-compose.yml..." -ForegroundColor Yellow
try {
    docker compose config > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ docker-compose.yml válido" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erro no docker-compose.yml" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "   ❌ Erro ao validar docker-compose.yml" -ForegroundColor Red
    $errors++
}

# 5. Verificar se containers estão rodando
Write-Host "`n5. Verificando containers..." -ForegroundColor Yellow
$containers = docker compose ps --format json 2>&1 | ConvertFrom-Json
if ($containers) {
    foreach ($container in $containers) {
        $status = $container.State
        $name = $container.Service
        if ($status -eq "running") {
            Write-Host "   ✅ $name está rodando" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $name está $status" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ℹ️  Nenhum container rodando" -ForegroundColor Gray
}

# Resumo
Write-Host "`n" + ("="*50) -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "✅ DIAGNÓSTICO: Tudo OK!" -ForegroundColor Green
    Write-Host "   Você pode rodar: docker compose up" -ForegroundColor Gray
} else {
    Write-Host "❌ DIAGNÓSTICO: $errors problema(s) encontrado(s)" -ForegroundColor Red
    Write-Host "   Corrija os problemas acima antes de continuar" -ForegroundColor Yellow
}
Write-Host ("="*50) + "`n" -ForegroundColor Cyan

exit $errors

