# 🔧 Troubleshooting Docker

## Problemas Comuns

### 1. MS-Projects não sobe

**Sintomas:**
- Container não inicia
- Erro no build
- Container inicia mas para imediatamente

**Soluções:**

#### Verificar logs:
```powershell
docker compose logs ms-projects
```

#### Rebuild forçado:
```powershell
docker compose build --no-cache ms-projects
docker compose up ms-projects
```

#### Verificar se o build funciona localmente:
```powershell
cd services/ms-projects
npm install
npm run build
```

### 2. MS-Orders não está acessível

**Sintomas:**
- Container está rodando mas não responde
- Erro 404 ao acessar
- Timeout de conexão

**Soluções:**

#### Verificar se o container está rodando:
```powershell
docker compose ps
```

#### Verificar logs:
```powershell
docker compose logs ms-orders
```

#### Verificar se a porta está correta:
```powershell
netstat -ano | findstr :8082
```

#### Testar conexão:
```powershell
curl http://localhost:8082/healthz
```

### 3. Erro de conexão com banco de dados

**Sintomas:**
- Container inicia mas falha ao conectar
- Erro P1001 (Can't reach database server)

**Soluções:**

#### Verificar variáveis de ambiente:
```powershell
docker compose config | Select-String -Pattern "MONGODB_URI|SQLSERVER_URL"
```

#### Verificar se o arquivo .env existe:
```powershell
Test-Path .env
Get-Content .env
```

#### Testar connection string localmente:
```powershell
# MS Projects
cd services/ms-projects
npx prisma db pull

# MS Orders
cd services/ms-orders
npx prisma db pull
```

### 4. Build falha

**Sintomas:**
- Erro ao fazer build da imagem
- Erro de dependências

**Soluções:**

#### Limpar e rebuild:
```powershell
docker compose down
docker system prune -f
docker compose build --no-cache
```

#### Verificar Dockerfile:
- Certifique-se de que todos os arquivos necessários estão sendo copiados
- Verifique se os scripts de build estão corretos

## Comandos Úteis

### Ver status dos containers:
```powershell
docker compose ps
```

### Ver logs em tempo real:
```powershell
docker compose logs -f ms-projects
docker compose logs -f ms-orders
docker compose logs -f bff
```

### Rebuild específico:
```powershell
docker compose build --no-cache ms-projects
docker compose build --no-cache ms-orders
```

### Parar e limpar tudo:
```powershell
docker compose down
docker system prune -a
```

### Testar build local antes do Docker:
```powershell
# MS Projects
cd services/ms-projects
npm install
npm run build
npm start

# MS Orders
cd services/ms-orders
npm install
npm run build
npm start
```

## Checklist de Verificação

Antes de rodar `docker compose up`, verifique:

- [ ] Arquivo `.env` existe na raiz com `MONGODB_URI` e `SQLSERVER_URL`
- [ ] Connection strings estão corretas e URL-encoded
- [ ] Firewall do Azure permite conexões
- [ ] Docker está rodando
- [ ] Portas 8080, 8081, 8082 não estão em uso
- [ ] Build local funciona (`npm run build`)

## Teste Rápido

Execute este script para verificar tudo:

```powershell
Write-Host "🔍 Verificando Docker Compose...`n" -ForegroundColor Cyan

# 1. Verificar Docker
Write-Host "1. Docker..." -ForegroundColor Yellow
docker --version
docker compose version

# 2. Verificar arquivo .env
Write-Host "`n2. Arquivo .env..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "   ✅ .env existe" -ForegroundColor Green
    $envContent = Get-Content .env -Raw
    if ($envContent -match "MONGODB_URI") {
        Write-Host "   ✅ MONGODB_URI encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MONGODB_URI não encontrado" -ForegroundColor Red
    }
    if ($envContent -match "SQLSERVER_URL") {
        Write-Host "   ✅ SQLSERVER_URL encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SQLSERVER_URL não encontrado" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ .env não existe!" -ForegroundColor Red
}

# 3. Verificar portas
Write-Host "`n3. Portas..." -ForegroundColor Yellow
$ports = @(8080, 8081, 8082)
foreach ($port in $ports) {
    $inUse = netstat -ano | findstr ":$port " | Select-Object -First 1
    if ($inUse) {
        Write-Host "   ⚠️  Porta $port está em uso" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Porta $port disponível" -ForegroundColor Green
    }
}

# 4. Testar build
Write-Host "`n4. Testando build do docker-compose..." -ForegroundColor Yellow
docker compose config > $null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ docker-compose.yml válido" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro no docker-compose.yml" -ForegroundColor Red
}

Write-Host "`n✅ Verificação completa!`n" -ForegroundColor Green
```

