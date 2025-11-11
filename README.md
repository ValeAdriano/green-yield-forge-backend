# Green Yield Forge - Backend

Backend completo para o sistema de gestão de créditos de carbono com arquitetura de microserviços.

## Estrutura do Projeto

```
green-yield-forge-backend/
├── services/
│   ├── bff/                 # Backend for Frontend (aggregator/proxy)
│   ├── ms-projects/         # Microserviço de Projetos (MongoDB Atlas)
│   └── ms-orders/           # Microserviço de Pedidos (Azure SQL)
├── functions/
│   ├── ingest-credit/       # Função de ingestão de créditos
│   └── receipt-hook/        # Webhook de pagamento
├── docs/                    # Documentação arquitetural
├── .github/workflows/       # CI/CD pipelines
└── requests.http            # Testes de API

```

## Tecnologias

- Node.js 20
- TypeScript
- Express.js
- MongoDB Atlas
- Azure SQL Database
- Docker

## Instalação e Execução

### Requisitos

- Node.js 20+
- Docker (opcional)
- MongoDB Atlas
- Azure SQL Database

### Setup Local

1. Configure as variáveis de ambiente:

```bash
# Para cada serviço, copie e edite o .env.example
cd services/ms-projects && cp .env.example .env
cd ../ms-orders && cp .env.example .env
cd ../bff && cp .env.example .env
cd ../../functions/ingest-credit && cp .env.example .env
cd ../receipt-hook && cp .env.example .env
```

2. Instale as dependências e faça build:

```bash
# ms-projects
cd services/ms-projects && npm i && npm run build

# ms-orders
cd ../ms-orders && npm i && npm run build

# bff
cd ../bff && npm i && npm run build

# functions
cd ../../functions/ingest-credit && npm i && npm run build
cd ../receipt-hook && npm i && npm run build
```

3. Execute os serviços (em terminais separados):

```bash
# Terminal 1 - ms-projects
cd services/ms-projects && npm start

# Terminal 2 - ms-orders
cd services/ms-orders && npm start

# Terminal 3 - ingest-credit
cd functions/ingest-credit && npm start

# Terminal 4 - receipt-hook
cd functions/receipt-hook && npm start

# Terminal 5 - BFF
cd services/bff && npm start
```

### Desenvolvimento

Para rodar em modo desenvolvimento (com hot-reload):

```bash
npm run dev
```

## Portas

- BFF: 8080
- ms-projects: 8080
- ms-orders: 8080
- ingest-credit: 8090
- receipt-hook: 8091

> **Nota:** Todos os serviços agora usam PORT=8080 por padrão (configurável via variável de ambiente).

## Testes

Use o arquivo `requests.http` para testar a API localmente.

## Build & Deploy com Dockerfile único

Este projeto utiliza um **Dockerfile único na raiz** que pode buildar qualquer serviço Node.js (TypeScript/JavaScript) através de build-args. Isso padroniza o processo de build e reduz duplicação.

### Build & Push

#### BFF
```bash
docker build -t adrianovale/arqcloud-bff:1.0.0 \
  --build-arg SERVICE_PATH=services/bff \
  --build-arg START_CMD="node dist/index.js" \
  --build-arg HAS_BUILD=true \
  .

docker push adrianovale/arqcloud-bff:1.0.0
```

#### ms-orders
```bash
docker build -t adrianovale/arqcloud-ms-orders:1.0.0 \
  --build-arg SERVICE_PATH=services/ms-orders \
  --build-arg START_CMD="node dist/index.js" \
  --build-arg HAS_BUILD=true \
  .

docker push adrianovale/arqcloud-ms-orders:1.0.0
```

#### ms-projects
```bash
docker build -t adrianovale/arqcloud-ms-projects:1.0.0 \
  --build-arg SERVICE_PATH=services/ms-projects \
  --build-arg START_CMD="node dist/index.js" \
  --build-arg HAS_BUILD=true \
  .

docker push adrianovale/arqcloud-ms-projects:1.0.0
```

### Parâmetros do Dockerfile

- `SERVICE_PATH`: Caminho relativo ao serviço (ex: `services/bff`)
- `START_CMD`: Comando para iniciar o serviço (padrão: `node dist/index.js`)
- `HAS_BUILD`: Se `true`, executa `tsc` ou `npm run build` durante o build (padrão: `true`)

### Deploy no Azure

Ao configurar no **Azure Web App for Containers** ou **Azure Container Apps**:

1. **App Settings:**
   - `WEBSITES_PORT=8080` (obrigatório para Azure Web App)
   - `PORT=8080` (opcional, mas recomendado)

2. **Imagens Docker:**
   - BFF: `adrianovale/arqcloud-bff:latest`
   - ms-orders: `adrianovale/arqcloud-ms-orders:latest`
   - ms-projects: `adrianovale/arqcloud-ms-projects:latest`

3. **Health Check:**
   - Todos os serviços expõem o endpoint `GET /healthz` que retorna `200 OK`
   - O Dockerfile inclui um HEALTHCHECK automático configurado para este endpoint

### Dockerfiles Antigos

> **Nota:** Os Dockerfiles individuais em `services/*/Dockerfile` foram mantidos para compatibilidade, mas estão **deprecados**. Use o Dockerfile único da raiz a partir de agora.

### CI/CD

Os workflows do GitHub Actions (`.github/workflows/docker-publish-*.yml`) estão configurados para buildar e publicar automaticamente cada serviço usando o Dockerfile único quando há push na branch `main`.

## Documentação

- [C4 Diagrams](./docs/c4.md)
- [ARC42](./docs/arc42.md)
- [Architecture Canvas](./docs/canvas.md)
- [OpenAPI Specs](./services/*/docs/openapi.yaml)

## Autores

- Adriano Vale
- Davi Hoffmann
- Leonardo Branco
- Vicente Freiberger
- Pedro Freiberger

