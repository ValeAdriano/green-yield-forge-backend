# MS-Projects - Microserviço de Projetos e Lotes

Microserviço Node.js + TypeScript para gerenciamento de projetos e lotes de créditos de carbono usando MongoDB Atlas.

## 🚀 Funcionalidades

- ✅ CRUD completo de Projetos
- ✅ CRUD completo de Lotes
- ✅ Paginação e busca
- ✅ Validação com Zod
- ✅ Documentação Swagger/OpenAPI
- ✅ Health check
- ✅ Logging com Morgan
- ✅ Suporte a MongoDB Atlas

## 📋 Pré-requisitos

- Node.js 20+
- MongoDB Atlas (conexão configurada)

## 🔧 Instalação

```bash
cd services/ms-projects
npm install
```

## ⚙️ Configuração

Copie o arquivo `.env.example` para `.env` e configure:

```bash
PORT=8081
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/pjbl?retryWrites=true&w=majority
DB_NAME=pjbl
```

## 🏃 Execução

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm run build
npm start
```

## 📚 Documentação Swagger

Após iniciar o serviço, acesse a documentação interativa:

```
http://localhost:8081/api-docs
```

## 🔌 Endpoints

### Health Check
- `GET /healthz` - Status do serviço

### Projetos
- `GET /projects` - Listar projetos (paginado)
- `POST /projects` - Criar projeto
- `GET /projects/:id` - Buscar projeto por ID
- `PUT /projects/:id` - Atualizar projeto
- `DELETE /projects/:id` - Deletar projeto

### Lotes
- `GET /batches` - Listar lotes (paginado)
- `POST /batches` - Criar lote
- `GET /batches/:id` - Buscar lote por ID
- `PUT /batches/:id` - Atualizar lote
- `DELETE /batches/:id` - Deletar lote

## 📦 Docker

```bash
# Build da imagem
docker build -t ms-projects:1.0.0 .

# Executar container
docker run -p 8081:8081 --env-file .env ms-projects:1.0.0
```

## 🧪 Testes

Use o arquivo `MS_PROJECTS_REQUESTS.http` na raiz do projeto para testar os endpoints.

### Exemplo de Criação de Projeto

```json
POST http://localhost:8081/projects
Content-Type: application/json

{
  "name": "Fazenda Aurora",
  "location": "PR",
  "hectares": 200,
  "description": "Projeto de reflorestamento",
  "certifier": "Verra"
}
```

### Exemplo de Criação de Lote

```json
POST http://localhost:8081/batches
Content-Type: application/json

{
  "projectId": "<id-do-projeto>",
  "tonsCO2": 40,
  "pricePerTon": 15,
  "status": "AVAILABLE"
}
```

## 🏗️ Tecnologias

- Node.js 20
- TypeScript
- Express.js
- MongoDB (Atlas)
- Zod (validação)
- Swagger/OpenAPI
- Morgan (logging)

