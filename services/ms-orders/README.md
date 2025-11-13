# MS Orders - Microserviço de Pedidos

Microserviço responsável pelo gerenciamento de pedidos de créditos de carbono, utilizando SQL Server (Azure SQL) como banco de dados.

## 🚀 Tecnologias

- Node.js 20
- TypeScript
- Express.js
- Prisma ORM
- SQL Server (Azure SQL)
- Swagger/OpenAPI

## 📋 Pré-requisitos

- Node.js 20+
- npm ou yarn
- SQL Server (local ou Azure SQL)
- Docker (opcional, para rodar com Docker Compose)

## 🔧 Configuração

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do serviço:

**Para Azure SQL (recomendado):**
```env
PORT=8082
SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;encrypt=true;trustServerCertificate=false;connectionTimeout=30
```

**Para Azure SQL com autenticação SQL (usuário/senha):**
```env
PORT=8082
SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;user=seu-usuario;password=sua-senha-url-encoded;encrypt=true;trustServerCertificate=false;connectionTimeout=30
```

**⚠️ IMPORTANTE - Azure SQL:**
- Senhas com caracteres especiais (`@`, `#`, etc) devem estar **URL-encoded**
- Exemplo: `password@123` → `password%40123`
- Você precisa liberar os **Outbound IPs do App Service** no firewall do SQL Server
- Ou ativar **"Allow Azure services and resources to access this server"**
- Veja `AZURE_SQL_SETUP.md` para mais detalhes sobre Azure AD authentication

**Exemplo para SQL Server local:**
```env
SQLSERVER_URL=sqlserver://localhost:1433;database=green-yield-forge;user=sa;password=YourStrong@Passw0rd;encrypt=false
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Prisma

```bash
# Gerar o Prisma Client
npm run prisma:generate

# Executar migrations (cria as tabelas)
# Opção 1: Migration tradicional (recomendado para produção)
npm run prisma:migrate

# Opção 2: db push (mais rápido para desenvolvimento)
npx prisma db push
```

**ℹ️ Nota:** O serviço executa migrations automaticamente ao iniciar. Você só precisa executar manualmente na primeira vez ou quando criar novas migrations.

## 🗄️ Banco de Dados

O Prisma irá criar a tabela `orders` automaticamente. A estrutura é:

```sql
CREATE TABLE dbo.orders (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  projectId NVARCHAR(100) NOT NULL,
  batchId NVARCHAR(100) NOT NULL,
  buyerName NVARCHAR(200) NOT NULL,
  qtyTons FLOAT NOT NULL,
  total FLOAT NOT NULL,
  status NVARCHAR(50) NOT NULL,
  createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  processedAt DATETIME2 NULL
);
```

### Prisma Studio

Para visualizar e gerenciar os dados:
```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

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

O serviço estará disponível em `http://localhost:8082`

## 🐳 Executando com Docker

### Build da imagem
```bash
docker build -t ms-orders:latest .
```

### Executar container
```bash
docker run -p 8082:8082 \
  -e PORT=8082 \
  -e SQLSERVER_URL="sqlserver://sqlserver:1433;database=green-yield-forge;user=sa;password=YourStrong@Passw0rd;encrypt=false" \
  ms-orders:latest
```

### Docker Compose
Para rodar todos os serviços juntos, use o `docker-compose.yml` na raiz do projeto:
```bash
cd ../..
docker compose up
```

## 📚 Documentação Swagger

Após iniciar o serviço, acesse a documentação Swagger em:
- **Local**: http://localhost:8082/api-docs
- **Docker**: http://localhost:8082/api-docs

## 🧪 Testando a API

### Health Check
```bash
curl http://localhost:8082/healthz
```

### Listar pedidos
```bash
curl http://localhost:8082/orders
```

### Listar pedidos por projeto
```bash
curl "http://localhost:8082/orders?projectId=project-id"
```

### Listar pedidos por status
```bash
curl "http://localhost:8082/orders?status=PENDING"
```

### Criar um pedido
```bash
curl -X POST http://localhost:8082/orders \
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

### Buscar pedido por ID
```bash
curl http://localhost:8082/orders/{order-id}
```

### Atualizar pedido
```bash
curl -X PUT http://localhost:8082/orders/{order-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSED",
    "processedAt": "2024-01-01T00:00:00Z"
  }'
```

### Deletar pedido
```bash
curl -X DELETE http://localhost:8082/orders/{order-id}
```

## 📡 Endpoints

- `GET /healthz` - Health check
- `GET /orders` - Lista pedidos (query params: `projectId`, `status`)
- `POST /orders` - Cria pedido
- `GET /orders/:id` - Busca pedido por ID
- `PUT /orders/:id` - Atualiza pedido
- `DELETE /orders/:id` - Deleta pedido

## 🔍 Troubleshooting

### Erro de conexão com SQL Server
- Verifique se o SQL Server está rodando
- Confirme a connection string no `.env`
- Para Azure SQL, verifique se os IPs estão liberados no firewall
- Teste a conexão com: `npm run prisma:studio`

### Erro "Prisma Client not generated"
```bash
npm run prisma:generate
```

### Erro "Table does not exist"
```bash
npm run prisma:migrate
```

### Senha com caracteres especiais
- Use URL encoding: `@` → `%40`, `#` → `%23`, etc.
- Ferramenta online: https://www.urlencoder.org/

