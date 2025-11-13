# Script para buildar e fazer push das imagens Docker para o Docker Hub
# Uso: .\build-and-push.ps1 <seu-usuario-dockerhub>

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUser,
    
    [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Buildando e fazendo push das imagens Docker ===" -ForegroundColor Green

# Define os serviços
$services = @(
    @{Name="bff"; Path="services/bff"},
    @{Name="ms-projects"; Path="services/ms-projects"},
    @{Name="ms-orders"; Path="services/ms-orders"}
)

foreach ($service in $services) {
    Write-Host "`n=== Buildando $($service.Name) ===" -ForegroundColor Cyan
    
    # Build da imagem
    docker build -t "$DockerHubUser/$($service.Name):$Tag" $service.Path
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build concluído: $DockerHubUser/$($service.Name):$Tag" -ForegroundColor Green
        
        # Push da imagem
        Write-Host "Fazendo push de $DockerHubUser/$($service.Name):$Tag..." -ForegroundColor Yellow
        docker push "$DockerHubUser/$($service.Name):$Tag"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Push concluído: $DockerHubUser/$($service.Name):$Tag" -ForegroundColor Green
        } else {
            Write-Host "✗ Erro ao fazer push: $DockerHubUser/$($service.Name):$Tag" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Erro ao buildar: $DockerHubUser/$($service.Name):$Tag" -ForegroundColor Red
    }
}

Write-Host "`n=== Processo concluído ===" -ForegroundColor Green

