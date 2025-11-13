# Script PowerShell para buildar e fazer push das imagens para Docker Hub
# Uso: .\docker-push.ps1 -DockerUser "seu-usuario" -Version "1.0.0"

param(
    [string]$DockerUser = "adrianovale",
    [string]$Version = "1.0.0"
)

Write-Host "Fazendo login no Docker Hub..." -ForegroundColor Cyan
docker login -u $DockerUser

Write-Host ""
Write-Host "Buildando e fazendo push das imagens..." -ForegroundColor Cyan

# BFF
Write-Host "Building BFF..." -ForegroundColor Yellow
docker build -t "$DockerUser/pjbl-bff:$Version" `
  -t "$DockerUser/pjbl-bff:latest" `
  --build-arg SERVICE_PATH=services/bff `
  --build-arg START_CMD="node dist/index.js" `
  --build-arg HAS_BUILD=true `
  .

Write-Host "Pushing BFF..." -ForegroundColor Yellow
docker push "$DockerUser/pjbl-bff:$Version"
docker push "$DockerUser/pjbl-bff:latest"

# ms-orders
Write-Host "Building ms-orders..." -ForegroundColor Yellow
docker build -t "$DockerUser/pjbl-orders:$Version" `
  -t "$DockerUser/pjbl-orders:latest" `
  --build-arg SERVICE_PATH=services/ms-orders `
  --build-arg START_CMD="node dist/index.js" `
  --build-arg HAS_BUILD=true `
  .

Write-Host "Pushing ms-orders..." -ForegroundColor Yellow
docker push "$DockerUser/pjbl-orders:$Version"
docker push "$DockerUser/pjbl-orders:latest"

# ms-projects
Write-Host "Building ms-projects..." -ForegroundColor Yellow
docker build -t "$DockerUser/pjbl-projects:$Version" `
  -t "$DockerUser/pjbl-projects:latest" `
  --build-arg SERVICE_PATH=services/ms-projects `
  --build-arg START_CMD="node dist/index.js" `
  --build-arg HAS_BUILD=true `
  .

Write-Host "Pushing ms-projects..." -ForegroundColor Yellow
docker push "$DockerUser/pjbl-projects:$Version"
docker push "$DockerUser/pjbl-projects:latest"

Write-Host ""
Write-Host "Todas as imagens foram publicadas com sucesso!" -ForegroundColor Green
Write-Host "Imagens disponiveis:" -ForegroundColor Cyan
Write-Host "   - $DockerUser/pjbl-bff:$Version"
Write-Host "   - $DockerUser/pjbl-orders:$Version"
Write-Host "   - $DockerUser/pjbl-projects:$Version"
