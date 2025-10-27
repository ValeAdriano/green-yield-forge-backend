# Entregável AVA - Green Yield Forge Backend

## Informações da Equipe

**Alunos:**
- Adriano Vale
- Davi Hoffmann
- Leonardo Branco
- Vicente Freiberger
- Pedro Freiberger

## Links do Projeto

### GitHub
- Repositório Principal: https://github.com/[USER]/green-yield-forge-backend

### Estrutura dos Serviços
- BFF: https://github.com/[USER]/green-yield-forge-backend/tree/main/services/bff
- MS-Projects: https://github.com/[USER]/green-yield-forge-backend/tree/main/services/ms-projects
- MS-Orders: https://github.com/[USER]/green-yield-forge-backend/tree/main/services/ms-orders

### Estrutura das Functions
- ingest-credit: https://github.com/[USER]/green-yield-forge-backend/tree/main/functions/ingest-credit
- receipt-hook: https://github.com/[USER]/green-yield-forge-backend/tree/main/functions/receipt-hook

## Docker Hub

### Imagens Publicadas
1. BFF: `docker.io/[USER]/pjbl-carbon-bff:TAG`
2. MS-Projects: `docker.io/[USER]/pjbl-carbon-ms-projects:TAG`
3. MS-Orders: `docker.io/[USER]/pjbl-carbon-ms-orders:TAG`

## OpenAPI Specs

### Caminhos dos Arquivos OpenAPI
1. BFF: `services/bff/docs/openapi.yaml`
2. MS-Projects: `services/ms-projects/docs/openapi.yaml`
3. MS-Orders: `services/ms-orders/docs/openapi.yaml`

### Acesso aos Especs
```bash
# Serviços locais
http://localhost:8080/docs/openapi.yaml  # BFF
http://localhost:8081/docs/openapi.yaml  # MS-Projects
http://localhost:8082/docs/openapi.yaml  # MS-Orders
```

## Arquitetura

### Diagramas
- C4 Diagrams: `docs/c4.md`
- ARC42: `docs/arc42.md`
- Canvas: `docs/canvas.md`

## Portas dos Serviços

| Serviço | Porta | Database |
|---------|-------|----------|
| BFF | 8080 | - |
| MS-Projects | 8081 | MongoDB Atlas |
| MS-Orders | 8082 | Azure SQL |
| ingest-credit | 8090 | - |
| receipt-hook | 8091 | - |

## Como Executar Localmente

### Pré-requisitos
- Node.js 20+
- npm
- MongoDB Atlas (conexão)
- Azure SQL (conexão)

### Setup
1. Clone o repositório
2. Configure os arquivos `.env` baseados nos `.env.example`
3. Instale as dependências:
```bash
cd services/ms-projects && npm i && npm run build
cd ../ms-orders && npm i && npm run build
cd ../bff && npm i && npm run build
cd ../../functions/ingest-credit && npm i && npm run build
cd ../receipt-hook && npm i && npm run build
```

4. Execute os serviços (terminais separados):
```bash
# Terminal 1
cd services/ms-projects && npm start

# Terminal 2
cd services/ms-orders && npm start

# Terminal 3
cd functions/ingest-credit && npm start

# Terminal 4
cd functions/receipt-hook && npm start

# Terminal 5
cd services/bff && npm start
```

## Testes

Use o arquivo `requests.http` na raiz do projeto para testar a API.

## Status do Projeto
✅ Estrutura criada
✅ Código implementado
✅ Dockerfiles configurados
✅ CI/CD configurado
✅ Documentação completa
✅ OpenAPI specs criados


