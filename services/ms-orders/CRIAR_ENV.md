# 📝 Como Criar o Arquivo .env

## Método 1: Copiar do exemplo

```powershell
cd services/ms-orders
Copy-Item .env.example .env
```

## Método 2: Criar manualmente

Crie um arquivo chamado `.env` na pasta `services/ms-orders/` com o seguinte conteúdo:

```env
# Porta do serviço
PORT=8082

# SQL Server Connection String (Azure SQL)
SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;encrypt=true;trustServerCertificate=false;connectionTimeout=30
```

## Método 3: Usando PowerShell

Execute este comando na pasta `services/ms-orders/`:

```powershell
@"
# Porta do serviço
PORT=8082

# SQL Server Connection String (Azure SQL)
SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;encrypt=true;trustServerCertificate=false;connectionTimeout=30
"@ | Out-File -FilePath .env -Encoding utf8
```

## Verificar se foi criado

```powershell
Test-Path .env
Get-Content .env
```

Se retornar `True` e mostrar o conteúdo, está tudo certo!

## Próximos passos

Depois de criar o `.env`:

1. Instale as dependências (se ainda não fez):
```powershell
npm install
```

2. Gere o Prisma Client:
```powershell
npm run prisma:generate
```

3. Inicie o servidor:
```powershell
npm run dev
```

## ⚠️ Importante

- O arquivo `.env` não deve ser commitado no Git (já está no .gitignore)
- Se precisar usar autenticação SQL com usuário/senha, adicione na connection string:
  ```
  SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;user=seu-usuario;password=sua-senha-url-encoded;encrypt=true;trustServerCertificate=false;connectionTimeout=30
  ```
- Lembre-se de URL-encode a senha se tiver caracteres especiais

