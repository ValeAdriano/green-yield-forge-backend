# 🚀 Guia Rápido - Como Testar

## Opção 1: Docker Compose (Recomendado - Mais Fácil)

Esta é a forma mais simples para rodar os serviços. **Nota:** Os bancos de dados (MongoDB e SQL Server) devem estar configurados no Azure.

### Passo 1: Configurar Connection Strings

Crie um arquivo `.env` na raiz do projeto com as connection strings do Azure:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/green-yield-forge

# Azure SQL
SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;user=usuario;password=senha;encrypt=true
```

### Passo 2: Verificar se o Docker está rodando
```powershell
docker --version
docker compose version
```

### Passo 3: Rodar tudo de uma vez
```powershell
# Na raiz do projeto
docker compose up
```

Isso vai:
- ✅ Buildar todas as imagens
- ✅ Subir todos os microserviços
- ✅ Conectar aos bancos no Azure (MongoDB Atlas e Azure SQL)
- ✅ Configurar a rede entre os serviços

### Passo 3: Testar os serviços

Aguarde alguns segundos para tudo inicializar, depois acesse:

- **BFF Swagger**: http://localhost:8080/api-docs
- **MS Projects Swagger**: http://localhost:8081/api-docs
- **MS Orders Swagger**: http://localhost:8082/api-docs

### Passo 4: Testar Health Check
```powershell
# BFF
curl http://localhost:8080/healthz

# MS Projects
curl http://localhost:8081/healthz

# MS Orders
curl http://localhost:8082/healthz
```

### Para parar tudo:
```powershell
docker compose down
```

---

## Opção 2: Rodar Localmente (Desenvolvimento)

Se preferir rodar localmente sem Docker, siga estes passos:

### Pré-requisitos
- Node.js 20+ instalado
- MongoDB rodando (local ou Atlas)
- SQL Server rodando (local ou Azure SQL)

### Passo 1: Criar arquivos .env

Crie os arquivos `.env` em cada serviço (veja `services/ENV_SETUP.md` para exemplos):

**services/ms-orders/.env**
```env
PORT=8082
SQLSERVER_URL=sqlserver://localhost:1433;database=green-yield-forge;user=sa;password=YourStrong@Passw0rd;encrypt=false
```

**services/ms-projects/.env**
```env
PORT=8081
MONGODB_URI=mongodb://localhost:27017/green-yield-forge
DB_NAME=green-yield-forge
```

**services/bff/.env**
```env
PORT=8080
MS_PROJECTS_BASE_URL=http://localhost:8081
MS_ORDERS_BASE_URL=http://localhost:8082
FN_INGEST_URL=http://localhost:8090
FN_RECEIPT_URL=http://localhost:8091
```

### Passo 2: Instalar dependências e configurar Prisma

**MS Orders:**
```powershell
cd services/ms-orders
npm install
npm run prisma:generate
npm run prisma:migrate
```

**MS Projects:**
```powershell
cd ../ms-projects
npm install
npm run prisma:generate
```

**BFF:**
```powershell
cd ../bff
npm install
```

### Passo 3: Rodar os serviços

Abra **3 terminais separados**:

**Terminal 1 - MS Orders:**
```powershell
cd services/ms-orders
npm run dev
```

**Terminal 2 - MS Projects:**
```powershell
cd services/ms-projects
npm run dev
```

**Terminal 3 - BFF:**
```powershell
cd services/bff
npm run dev
```

### Passo 4: Testar

Acesse os Swaggers:
- http://localhost:8080/api-docs (BFF)
- http://localhost:8081/api-docs (MS Projects)
- http://localhost:8082/api-docs (MS Orders)

---

## 🧪 Testes Rápidos

### 1. Criar um Projeto
```powershell
curl -X POST http://localhost:8081/projects `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Projeto Teste\",\"location\":\"Brasil\"}'
```

### 2. Listar Projetos
```powershell
curl http://localhost:8081/projects
```

### 3. Criar um Pedido
```powershell
curl -X POST http://localhost:8082/orders `
  -H "Content-Type: application/json" `
  -d '{\"projectId\":\"project-id\",\"batchId\":\"batch-id\",\"buyerName\":\"Teste\",\"qtyTons\":100,\"total\":5000,\"status\":\"PENDING\"}'
```

### 4. Agregar dados via BFF
```powershell
curl http://localhost:8080/aggregate/project/{project-id}
```

---

## ⚠️ Troubleshooting

### Erro: "Cannot connect to database"
- **Docker Compose**: Aguarde alguns segundos para os bancos inicializarem
- **Local**: Verifique se MongoDB e SQL Server estão rodando

### Erro: "Prisma Client not generated"
```powershell
cd services/ms-orders
npm run prisma:generate

cd ../ms-projects
npm run prisma:generate
```

### Erro: "Port already in use"
- Altere a porta no arquivo `.env` do serviço
- Ou pare o processo que está usando a porta

### Erro: "Table does not exist" (SQL Server)
```powershell
cd services/ms-orders
npm run prisma:migrate
```

---

## 📚 Documentação Completa

- **BFF**: `services/bff/README.md`
- **MS Projects**: `services/ms-projects/README.md`
- **MS Orders**: `services/ms-orders/README.md`
- **Variáveis de Ambiente**: `services/ENV_SETUP.md`

