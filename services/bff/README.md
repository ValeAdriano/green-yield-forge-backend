# BFF - Backend for Frontend

API agregadora que orquestra chamadas aos microserviços de projetos, pedidos e funções serverless.

## 🚀 Tecnologias

- Node.js 20
- TypeScript
- Express.js
- Swagger/OpenAPI
- Axios

## 📋 Pré-requisitos

- Node.js 20+
- npm ou yarn
- Docker (opcional, para rodar com Docker Compose)

## 🔧 Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```env
PORT=8080
MS_PROJECTS_BASE_URL=http://localhost:8081
MS_ORDERS_BASE_URL=http://localhost:8082
FN_INGEST_URL=http://localhost:8090
FN_RECEIPT_URL=http://localhost:8091
```

3. Instale as dependências:
```bash
npm install
```

## 🏃 Executando Localmente

### Modo Desenvolvimento (com hot-reload)
```bash
npm run dev
```

### Modo Produção
```bash
npm run build
npm start
```

O serviço estará disponível em `http://localhost:8080`

## 🐳 Executando com Docker

### Build da imagem
```bash
docker build -t bff:latest .
```

### Executar container
```bash
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e MS_PROJECTS_BASE_URL=http://ms-projects:8081 \
  -e MS_ORDERS_BASE_URL=http://ms-orders:8082 \
  -e FN_INGEST_URL=http://localhost:8090 \
  -e FN_RECEIPT_URL=http://localhost:8091 \
  bff:latest
```

### Docker Compose
Para rodar todos os serviços juntos, use o `docker-compose.yml` na raiz do projeto:
```bash
cd ../..
docker compose up
```

## 📚 Documentação Swagger

Após iniciar o serviço, acesse a documentação Swagger em:
- **Local**: http://localhost:8080/api-docs
- **Docker**: http://localhost:8080/api-docs

## 🧪 Testando a API

### Health Check
```bash
curl http://localhost:8080/healthz
```

### Agregar dados de um projeto
```bash
curl http://localhost:8080/aggregate/project/{projectId}
```

### Listar projetos
```bash
curl http://localhost:8080/projects
```

### Criar um projeto
```bash
curl -X POST http://localhost:8080/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projeto Teste",
    "location": "Brasil"
  }'
```

### Listar pedidos
```bash
curl http://localhost:8080/orders
```

### Criar um pedido
```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-id",
    "batchId": "batch-id",
    "buyerName": "Comprador Teste",
    "qtyTons": 100,
    "total": 5000,
    "status": "PENDING"
  }'
```

## 📡 Endpoints

### Health
- `GET /healthz` - Health check

### Aggregate
- `GET /aggregate/project/:id` - Agrega dados de projeto, lotes e pedidos

### Projects (proxied to MS Projects)
- `GET /projects` - Lista projetos
- `POST /projects` - Cria projeto
- `GET /projects/:id` - Busca projeto por ID
- `PUT /projects/:id` - Atualiza projeto
- `DELETE /projects/:id` - Deleta projeto

### Batches (proxied to MS Projects)
- `GET /batches` - Lista lotes
- `POST /batches` - Cria lote
- `GET /batches/:id` - Busca lote por ID
- `PUT /batches/:id` - Atualiza lote
- `DELETE /batches/:id` - Deleta lote

### Orders (proxied to MS Orders)
- `GET /orders` - Lista pedidos
- `POST /orders` - Cria pedido
- `GET /orders/:id` - Busca pedido por ID
- `PUT /orders/:id` - Atualiza pedido
- `DELETE /orders/:id` - Deleta pedido

### Events
- `POST /events/ingest` - Dispara evento de ingestão
- `POST /events/receipt` - Dispara evento de recebimento

## 🔍 Troubleshooting

### Erro de conexão com microserviços
- Verifique se os microserviços estão rodando
- Confirme as URLs nas variáveis de ambiente
- Se estiver usando Docker Compose, use os nomes dos serviços (ex: `ms-projects:8081`)

### Porta já em uso
- Altere a porta no arquivo `.env` ou use `PORT=8081 npm start`

