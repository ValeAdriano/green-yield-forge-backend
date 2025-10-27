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
- ms-projects: 8081
- ms-orders: 8082
- ingest-credit: 8090
- receipt-hook: 8091

## Testes

Use o arquivo `requests.http` para testar a API localmente.

## Docker

Build e push das imagens:

```bash
# BFF
cd services/bff && docker build -t docker.io/USERNAME/pjbl-carbon-bff:1.0.0 .
docker push docker.io/USERNAME/pjbl-carbon-bff:1.0.0

# ms-projects
cd services/ms-projects && docker build -t docker.io/USERNAME/pjbl-carbon-ms-projects:1.0.0 .
docker push docker.io/USERNAME/pjbl-carbon-ms-projects:1.0.0

# ms-orders
cd services/ms-orders && docker build -t docker.io/USERNAME/pjbl-carbon-ms-orders:1.0.0 .
docker push docker.io/USERNAME/pjbl-carbon-ms-orders:1.0.0
```

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

