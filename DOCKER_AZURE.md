# 🐳 Docker Compose com Azure

Este projeto usa Docker Compose para rodar os serviços localmente, mas conecta diretamente aos bancos de dados no Azure (MongoDB Atlas e Azure SQL).

## ⚙️ Configuração

### Opção 1: Variáveis de Ambiente no docker-compose.yml

Edite o `docker-compose.yml` e adicione as connection strings diretamente:

```yaml
ms-projects:
  environment:
    - PORT=8081
    - MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/green-yield-forge

ms-orders:
  environment:
    - PORT=8082
    - SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;user=usuario;password=senha;encrypt=true
```

### Opção 2: Arquivo .env na raiz

Crie um arquivo `.env` na raiz do projeto:

```env
# MS Projects - MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/green-yield-forge

# MS Orders - Azure SQL
SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;user=usuario;password=senha;encrypt=true
```

E atualize o `docker-compose.yml`:

```yaml
ms-projects:
  env_file:
    - .env

ms-orders:
  env_file:
    - .env
```

### Opção 3: Variáveis de Ambiente do Sistema

Configure as variáveis no seu sistema e o Docker Compose vai pegá-las automaticamente.

## 🚀 Executando

```bash
docker compose up
```

## ⚠️ Importante

### Firewall do Azure

Certifique-se de que:

1. **MongoDB Atlas**: Seu IP está liberado no Network Access
2. **Azure SQL**: Seu IP está liberado no firewall do SQL Server
   - Ou ative "Allow Azure services and resources to access this server"

### Connection Strings

- **MongoDB**: Use a connection string completa do MongoDB Atlas
- **Azure SQL**: Use o formato Prisma: `sqlserver://servidor:porta;database=nome;user=usuario;password=senha;encrypt=true`
- **Senhas**: Se tiver caracteres especiais, use URL-encoding (`@` → `%40`)

## 📝 Exemplo Completo

```yaml
version: '3.8'

services:
  ms-projects:
    build:
      context: ./services/ms-projects
    ports:
      - "8081:8081"
    environment:
      - PORT=8081
      - MONGODB_URI=mongodb+srv://user:pass%40word@cluster.mongodb.net/green-yield-forge

  ms-orders:
    build:
      context: ./services/ms-orders
    ports:
      - "8082:8082"
    environment:
      - PORT=8082
      - SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;user=admin;password=Senha%40123;encrypt=true
```

