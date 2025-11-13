# Guia Rápido: Push para Docker Hub

## Pré-requisitos

1. Conta no Docker Hub: https://hub.docker.com
2. Docker instalado e rodando
3. Login no Docker Hub: `docker login`

## Opção 1: Usar Script PowerShell (Windows)

```powershell
.\docker-push.ps1 -DockerUser "adrianovale" -Version "1.0.1"
```

## Opção 2: Comandos Manuais

### 1. Login no Docker Hub
```powershell
docker login
```

### 2. Build e Push de cada serviço

#### BFF
```powershell
docker build -t adrianovale/pjbl-bff:1.0.1 `
  -t adrianovale/pjbl-bff:latest `
  --build-arg SERVICE_PATH=services/bff `
  --build-arg START_CMD="node dist/index.js" `
  --build-arg HAS_BUILD=true `
  .

docker push adrianovale/pjbl-bff:1.0.1
docker push adrianovale/pjbl-bff:latest
```

#### ms-orders
```powershell
docker build -t adrianovale/pjbl-orders:1.0.1 `
  -t adrianovale/pjbl-orders:latest `
  --build-arg SERVICE_PATH=services/ms-orders `
  --build-arg START_CMD="node dist/index.js" `
  --build-arg HAS_BUILD=true `
  .

docker push adrianovale/pjbl-orders:1.0.1
docker push adrianovale/pjbl-orders:latest
```

#### ms-projects
```powershell
docker build -t adrianovale/pjbl-projects:1.0.1 `
  -t adrianovale/pjbl-projects:latest `
  --build-arg SERVICE_PATH=services/ms-projects `
  --build-arg START_CMD="node dist/index.js" `
  --build-arg HAS_BUILD=true `
  .

docker push adrianovale/pjbl-projects:1.0.1
docker push adrianovale/pjbl-projects:latest
```

## Verificar Imagens Publicadas

Após o push, verifique no Docker Hub:
- https://hub.docker.com/r/adrianovale/pjbl-bff
- https://hub.docker.com/r/adrianovale/pjbl-orders
- https://hub.docker.com/r/adrianovale/pjbl-projects

## Testar Imagem Localmente

```powershell
docker pull adrianovale/pjbl-projects:1.0.1
docker run -p 8080:8080 adrianovale/pjbl-projects:1.0.1
```

## CI/CD Automático

Os workflows do GitHub Actions estão configurados para fazer push automaticamente quando há push na branch `main`:
- `.github/workflows/docker-publish-bff.yml`
- `.github/workflows/docker-publish-ms-orders.yml`
- `.github/workflows/docker-publish-ms-projects.yml`

Certifique-se de configurar os secrets no GitHub:
- `DOCKERHUB_USER`: seu usuário do Docker Hub
- `DOCKERHUB_TOKEN`: seu token de acesso do Docker Hub

