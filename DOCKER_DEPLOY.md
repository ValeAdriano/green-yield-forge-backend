# Deploy das Imagens Docker no Docker Hub

Este documento contém instruções para buildar e publicar as imagens Docker dos microservices e BFF no Docker Hub.

## Pré-requisitos

1. Ter o Docker instalado e rodando
2. Ter uma conta no [Docker Hub](https://hub.docker.com/)
3. Estar autenticado no Docker Hub: `docker login`

## Serviços

- **BFF** (Backend for Frontend) - Porta 8080
- **ms-projects** (Microservice de Projetos) - Porta 8081
- **ms-orders** (Microservice de Pedidos) - Porta 8082

## Métodos de Deploy

### Método 1: Script PowerShell (Windows)

```powershell
# Execute com seu usuário do Docker Hub
.\build-and-push.ps1 seu-usuario-dockerhub

# Ou com uma tag específica
.\build-and-push.ps1 seu-usuario-dockerhub v1.0.0
```

### Método 2: Script Bash (Linux/Mac)

```bash
# Dar permissão de execução (apenas na primeira vez)
chmod +x build-and-push.sh

# Execute com seu usuário do Docker Hub
./build-and-push.sh seu-usuario-dockerhub

# Ou com uma tag específica
./build-and-push.sh seu-usuario-dockerhub v1.0.0
```

### Método 3: Manual

Se preferir fazer manualmente, siga os comandos abaixo:

#### Build das Imagens

```bash
# BFF
docker build -t seu-usuario-dockerhub/bff:latest services/bff

# MS Projects
docker build -t seu-usuario-dockerhub/ms-projects:latest services/ms-projects

# MS Orders
docker build -t seu-usuario-dockerhub/ms-orders:latest services/ms-orders
```

#### Push das Imagens

```bash
# BFF
docker push seu-usuario-dockerhub/bff:latest

# MS Projects
docker push seu-usuario-dockerhub/ms-projects:latest

# MS Orders
docker push seu-usuario-dockerhub/ms-orders:latest
```

## Verificação

Após o push, você pode verificar as imagens no Docker Hub:

1. Acesse: https://hub.docker.com/u/seu-usuario-dockerhub
2. Verifique se as 3 imagens estão listadas:
   - `bff`
   - `ms-projects`
   - `ms-orders`

## Tags e Versionamento

É recomendado usar tags semânticas para versionamento:

```bash
# Versão específica
docker build -t seu-usuario-dockerhub/bff:1.0.0 services/bff

# Versão com commit hash
docker build -t seu-usuario-dockerhub/bff:abc1234 services/bff

# Tag múltiplas versões
docker tag seu-usuario-dockerhub/bff:latest seu-usuario-dockerhub/bff:1.0.0
docker push seu-usuario-dockerhub/bff:1.0.0
```

## Pull e Execução Local

Após fazer o push, você pode fazer pull e executar as imagens:

```bash
# Pull das imagens
docker pull seu-usuario-dockerhub/bff:latest
docker pull seu-usuario-dockerhub/ms-projects:latest
docker pull seu-usuario-dockerhub/ms-orders:latest

# Executar localmente
docker run -p 8080:8080 seu-usuario-dockerhub/bff:latest
docker run -p 8081:8081 seu-usuario-dockerhub/ms-projects:latest
docker run -p 8082:8082 seu-usuario-dockerhub/ms-orders:latest
```

## Dockerfiles

Todos os serviços usam um Dockerfile multi-stage para otimizar o tamanho das imagens:

- **Stage 1 (Builder)**: Compila TypeScript para JavaScript
- **Stage 2 (Runtime)**: Copia apenas os arquivos necessários para produção

## Troubleshooting

### Erro: "no space left on device"
Limpe imagens e containers não utilizados:
```bash
docker system prune -a
```

### Erro: "unauthorized: authentication required"
Faça login novamente:
```bash
docker login
```

### Build falha ao copiar arquivos
Certifique-se de que o `.dockerignore` está configurado corretamente no diretório do serviço.

