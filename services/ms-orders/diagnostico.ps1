# Script de Diagnóstico - MS Orders
Write-Host "`n🔍 DIAGNÓSTICO MS-ORDERS`n" -ForegroundColor Cyan

$errors = 0

# 1. Verificar .env
Write-Host "1. Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "   ✅ .env existe" -ForegroundColor Green
    $envContent = Get-Content .env -Raw
    if ($envContent -match "SQLSERVER_URL") {
        Write-Host "   ✅ SQLSERVER_URL encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SQLSERVER_URL não encontrado no .env!" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   ❌ .env não existe!" -ForegroundColor Red
    Write-Host "   💡 Crie o arquivo .env com:" -ForegroundColor Yellow
    Write-Host "      PORT=8082" -ForegroundColor Gray
    Write-Host "      SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;encrypt=true;trustServerCertificate=false;connectionTimeout=30" -ForegroundColor Gray
    $errors++
}

# 2. Verificar node_modules
Write-Host "`n2. Verificando dependências..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules não existe!" -ForegroundColor Red
    Write-Host "   💡 Execute: npm install" -ForegroundColor Yellow
    $errors++
}

# 3. Verificar Prisma Client
Write-Host "`n3. Verificando Prisma Client..." -ForegroundColor Yellow
if (Test-Path node_modules\.prisma) {
    Write-Host "   ✅ Prisma Client gerado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Prisma Client não gerado" -ForegroundColor Yellow
    Write-Host "   💡 Execute: npm run prisma:generate" -ForegroundColor Yellow
    $errors++
}

# 4. Verificar Prisma CLI
Write-Host "`n4. Verificando Prisma CLI..." -ForegroundColor Yellow
try {
    $prismaVersion = npx prisma --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Prisma CLI disponível" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Prisma CLI não encontrado" -ForegroundColor Yellow
        Write-Host "   💡 Execute: npm install" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Erro ao verificar Prisma CLI" -ForegroundColor Yellow
}

# 5. Verificar schema.prisma
Write-Host "`n5. Verificando schema do Prisma..." -ForegroundColor Yellow
if (Test-Path prisma\schema.prisma) {
    Write-Host "   ✅ schema.prisma existe" -ForegroundColor Green
} else {
    Write-Host "   ❌ schema.prisma não existe!" -ForegroundColor Red
    $errors++
}

# 6. Testar conexão (se tudo estiver OK até aqui)
if ($errors -eq 0) {
    Write-Host "`n6. Testando conexão com banco de dados..." -ForegroundColor Yellow
    Write-Host "   (Isso pode levar alguns segundos...)" -ForegroundColor Gray
    
    try {
        $result = npx prisma db pull --schema=prisma/schema.prisma 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Conexão com banco OK!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erro na conexão" -ForegroundColor Red
            Write-Host "   Mensagem: $($result -join ' ')" -ForegroundColor Gray
            Write-Host "   💡 Verifique:" -ForegroundColor Yellow
            Write-Host "      - Se o firewall do Azure SQL permite seu IP" -ForegroundColor Gray
            Write-Host "      - Se a connection string está correta" -ForegroundColor Gray
            Write-Host "      - Se o banco 'arqCLOUD' existe" -ForegroundColor Gray
            $errors++
        }
    } catch {
        Write-Host "   ⚠️  Não foi possível testar a conexão" -ForegroundColor Yellow
        Write-Host "   Erro: $_" -ForegroundColor Gray
    }
} else {
    Write-Host "`n6. Pulando teste de conexão (erros anteriores)" -ForegroundColor Yellow
}

# Resumo
Write-Host "`n" + ("="*50) -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "✅ DIAGNÓSTICO: Tudo OK!" -ForegroundColor Green
    Write-Host "   Você pode rodar: npm run dev" -ForegroundColor Gray
} else {
    Write-Host "❌ DIAGNÓSTICO: $errors problema(s) encontrado(s)" -ForegroundColor Red
    Write-Host "   Corrija os problemas acima antes de continuar" -ForegroundColor Yellow
}
Write-Host ("="*50) + "`n" -ForegroundColor Cyan

exit $errors

