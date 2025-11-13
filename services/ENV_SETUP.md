# Configuração de Variáveis de Ambiente

Crie um arquivo `.env` em cada serviço baseado nos exemplos abaixo.

## services/ms-orders/.env

```env
# Porta do serviço
PORT=8082

# SQL Server Connection String (Azure SQL)
# Formato Prisma: sqlserver://server:port;database=dbname;encrypt=true;trustServerCertificate=false;connectionTimeout=30
# 
# Para Azure AD Authentication (recomendado para Azure):
# Use a connection string abaixo com Azure AD Default
SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;encrypt=true;trustServerCertificate=false;connectionTimeout=30

# Para usar Azure AD Default Authentication, você precisa estar autenticado no Azure CLI:
# az login
# 
# Para autenticação SQL tradicional (usuário/senha):
# SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;user=seu-usuario;password=sua-senha-url-encoded;encrypt=true;trustServerCertificate=false;connectionTimeout=30
# IMPORTANTE: Senhas com caracteres especiais (@, #, etc) devem estar URL-encoded
# Exemplo: password@123 deve ser password%40123
# 
# Para Azure SQL, você precisa:
# 1. Liberar os Outbound IPs do App Service no firewall do SQL Server
# 2. Ou ativar "Allow Azure services and resources to access this server"
# 3. Para Azure AD: estar autenticado via Azure CLI ou configurar Service Principal

# Exemplo de connection string local (SQL Server local):
# SQLSERVER_URL=sqlserver://localhost:1433;database=green-yield-forge;user=sa;password=YourStrong@Passw0rd;encrypt=false
```

## services/ms-projects/.env

```env
# Porta do serviço
PORT=8081

# MongoDB Connection String (MongoDB Atlas)
# IMPORTANTE: Senhas com caracteres especiais (@, #, etc) devem estar URL-encoded
# Exemplo: password@123 deve ser password%40123
# 
# Para MongoDB Atlas, você precisa:
# 1. Liberar os Outbound IPs do App Service no Network Access do Atlas
# 2. Configurar usuário e senha no Database Access
# 3. Usar a connection string fornecida pelo Atlas
MONGODB_URI=mongodb+srv://usuario:senha-url-encoded@cluster.mongodb.net/green-yield-forge?retryWrites=true&w=majority

# Exemplo de connection string local (MongoDB local):
# MONGODB_URI=mongodb://localhost:27017/green-yield-forge

# Nome do banco de dados (opcional, já está na URI)
DB_NAME=green-yield-forge
```

## services/bff/.env

```env
# Porta do serviço
PORT=8080

# URLs dos microserviços
# Quando rodando localmente, use localhost
# Quando rodando no Docker, use os nomes dos serviços (ms-projects, ms-orders)
MS_PROJECTS_BASE_URL=http://localhost:8081
MS_ORDERS_BASE_URL=http://localhost:8082

# URLs das funções (Azure Functions ou local)
FN_INGEST_URL=http://localhost:8090
FN_RECEIPT_URL=http://localhost:8091

# Exemplo para Docker Compose:
# MS_PROJECTS_BASE_URL=http://ms-projects:8081
# MS_ORDERS_BASE_URL=http://ms-orders:8082
```

## Como criar os arquivos

Execute os seguintes comandos na raiz do projeto:

```bash
# MS Orders
cat > services/ms-orders/.env << 'EOF'
PORT=8082
SQLSERVER_URL=sqlserver://seu-servidor.database.windows.net:1433;database=green-yield-forge;user=seu-usuario;password=sua-senha-url-encoded;encrypt=true
EOF

# MS Projects
cat > services/ms-projects/.env << 'EOF'
PORT=8081
MONGODB_URI=mongodb+srv://usuario:senha-url-encoded@cluster.mongodb.net/green-yield-forge?retryWrites=true&w=majority
DB_NAME=green-yield-forge
EOF

# BFF
cat > services/bff/.env << 'EOF'
PORT=8080
MS_PROJECTS_BASE_URL=http://localhost:8081
MS_ORDERS_BASE_URL=http://localhost:8082
FN_INGEST_URL=http://localhost:8090
FN_RECEIPT_URL=http://localhost:8091
EOF
```

**Lembre-se de substituir os valores de exemplo pelos seus valores reais!**

