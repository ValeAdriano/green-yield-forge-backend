# MS Projects - Microserviço de Projetos

Microserviço responsável pelo gerenciamento de projetos e lotes de créditos de carbono, utilizando MongoDB (Atlas) como banco de dados.

## 🚀 Tecnologias

- Node.js 20
- TypeScript
- Express.js
- Prisma ORM
- MongoDB (Atlas)
- Swagger/OpenAPI
- Zod (validação)

## 📋 Pré-requisitos

- Node.js 20+
- npm ou yarn
- MongoDB (local ou MongoDB Atlas)
- Docker (opcional, para rodar com Docker Compose)

## 🔧 Configuração

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do serviço:

```env
PORT=8081
MONGODB_URI=mongodb+srv://usuario:senha-url-encoded@cluster.mongodb.net/green-yield-forge?retryWrites=true&w=majority
DB_NAME=green-yield-forge
```

**⚠️ IMPORTANTE - MongoDB Atlas:**
- Senhas com caracteres especiais (`@`, `#`, etc) devem estar **URL-encoded**
- Exemplo: `password@123` → `password%40123`
- Você precisa liberar os **Outbound IPs do App Service** no Network Access do Atlas
- Configure usuário e senha no Database Access do Atlas

**Exemplo para MongoDB local:**
```env
MONGODB_URI=mongodb://localhost:27017/green-yield-forge
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Prisma

```bash
# Gerar o Prisma Client
npm run prisma:generate
```

**Nota:** MongoDB não requer migrations como SQL Server. O Prisma criará as coleções automaticamente quando você inserir dados.

### Prisma Studio

Para visualizar e gerenciar os dados:
```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

## 🗄️ Banco de Dados

O Prisma irá criar as coleções `projects` e `batches` automaticamente quando você inserir dados.

### Estrutura das Coleções

**Projects:**
```typescript
{
  id: string (ObjectId)
  name: string
  location: string
  hectares?: number
  description?: string
  certifier?: string
  createdAt: DateTime
}
```

**Batches:**
```typescript
{
  id: string (ObjectId)
  projectId: string (ObjectId)
  tonsCO2: number
  pricePerTon: number
  status: "AVAILABLE" | "RESERVED" | "SOLD"
  createdAt: DateTime
}
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

O serviço estará disponível em `http://localhost:8081`

## 🐳 Executando com Docker

### Build da imagem
```bash
docker build -t ms-projects:latest .
```

### Executar container
```bash
docker run -p 8081:8081 \
  -e PORT=8081 \
  -e MONGODB_URI="mongodb://mongodb:27017/green-yield-forge" \
  ms-projects:latest
```

### Docker Compose
Para rodar todos os serviços juntos, use o `docker-compose.yml` na raiz do projeto:
```bash
cd ../..
docker compose up
```

## 📚 Documentação Swagger

Após iniciar o serviço, acesse a documentação Swagger em:
- **Local**: http://localhost:8081/api-docs
- **Docker**: http://localhost:8081/api-docs

## 🧪 Testando a API

### Health Check
```bash
curl http://localhost:8081/healthz
```

### Listar projetos
```bash
curl http://localhost:8081/projects
```

### Listar projetos com paginação
```bash
curl "http://localhost:8081/projects?page=1&pageSize=10"
```

### Buscar projetos por nome
```bash
curl "http://localhost:8081/projects?search=floresta"
```

### Criar um projeto
```bash
curl -X POST http://localhost:8081/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projeto Reflorestamento Amazônia",
    "location": "Amazonas, Brasil",
    "hectares": 1000,
    "description": "Projeto de reflorestamento na Amazônia",
    "certifier": "VCS"
  }'
```

### Buscar projeto por ID
```bash
curl http://localhost:8081/projects/{project-id}
```

### Atualizar projeto
```bash
curl -X PUT http://localhost:8081/projects/{project-id} \
  -H "Content-Type: application/json" \
  -d '{
    "hectares": 1500,
    "description": "Descrição atualizada"
  }'
```

### Deletar projeto
```bash
curl -X DELETE http://localhost:8081/projects/{project-id}
```

### Listar lotes
```bash
curl http://localhost:8081/batches
```

### Listar lotes por projeto
```bash
curl "http://localhost:8081/batches?projectId=project-id"
```

### Listar lotes por status
```bash
curl "http://localhost:8081/batches?status=AVAILABLE"
```

### Criar um lote
```bash
curl -X POST http://localhost:8081/batches \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-id",
    "tonsCO2": 500,
    "pricePerTon": 50,
    "status": "AVAILABLE"
  }'
```

### Buscar lote por ID
```bash
curl http://localhost:8081/batches/{batch-id}
```

### Atualizar lote
```bash
curl -X PUT http://localhost:8081/batches/{batch-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESERVED"
  }'
```

### Deletar lote
```bash
curl -X DELETE http://localhost:8081/batches/{batch-id}
```

## 📡 Endpoints

### Projects
- `GET /projects` - Lista projetos (query params: `page`, `pageSize`, `search`)
- `POST /projects` - Cria projeto
- `GET /projects/:id` - Busca projeto por ID
- `PUT /projects/:id` - Atualiza projeto
- `DELETE /projects/:id` - Deleta projeto

### Batches
- `GET /batches` - Lista lotes (query params: `projectId`, `status`, `page`, `pageSize`)
- `POST /batches` - Cria lote
- `GET /batches/:id` - Busca lote por ID
- `PUT /batches/:id` - Atualiza lote
- `DELETE /batches/:id` - Deleta lote

## 🔍 Troubleshooting

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme a connection string no `.env`
- Para MongoDB Atlas, verifique se os IPs estão liberados no Network Access
- Teste a conexão com: `npm run prisma:studio`

### Erro "Prisma Client not generated"
```bash
npm run prisma:generate
```

### Senha com caracteres especiais
- Use URL encoding: `@` → `%40`, `#` → `%23`, etc.
- Ferramenta online: https://www.urlencoder.org/

### Erro de validação Zod
- Verifique os dados enviados na requisição
- Consulte a documentação Swagger para ver os campos obrigatórios
