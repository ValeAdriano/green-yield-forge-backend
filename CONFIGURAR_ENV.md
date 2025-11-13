# 🔧 Como Configurar o Arquivo .env

## ⚠️ IMPORTANTE

O arquivo `.env` na **raiz do projeto** é necessário para o Docker Compose funcionar.

## 📝 Variáveis Necessárias

O arquivo `.env` deve conter **AMBAS** as variáveis:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/green-yield-forge?retryWrites=true&w=majority

# Azure SQL Connection String (formato Prisma)
SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;user=usuario;password=senha;encrypt=true;trustServerCertificate=false;connectionTimeout=30
```

## 🔐 URL Encoding de Senhas

Se sua senha tiver caracteres especiais, use URL-encoding:

| Caractere | URL-Encoded |
|-----------|-------------|
| `@`       | `%40`       |
| `#`       | `%23`       |
| `$`       | `%24`       |
| `&`       | `%26`       |
| `+`       | `%2B`       |
| `=`       | `%3D`       |
| `?`       | `%3F`       |
| `/`       | `%2F`       |
| ` ` (espaço) | `%20`    |

### Exemplo:

**Senha original:** `MinhaSenha@123#456`

**Senha URL-encoded:** `MinhaSenha%40123%23456`

**Connection string completa:**
```env
MONGODB_URI=mongodb+srv://usuario:MinhaSenha%40123%23456@cluster.mongodb.net/green-yield-forge?retryWrites=true&w=majority
```

## 📍 Onde Criar o Arquivo

O arquivo `.env` deve estar na **raiz do projeto**, no mesmo nível do `docker-compose.yml`:

```
green-yield-forge-backend/
├── .env                    ← AQUI!
├── docker-compose.yml
├── services/
│   ├── bff/
│   ├── ms-projects/
│   └── ms-orders/
└── ...
```

## ✅ Verificar se Está Configurado

Execute este comando para verificar:

```powershell
# Verificar se o arquivo existe
Test-Path .env

# Ver conteúdo (sem mostrar senhas completas)
Get-Content .env | ForEach-Object {
    if ($_ -match "URI|URL") {
        $parts = $_ -split "="
        if ($parts.Length -eq 2) {
            $key = $parts[0]
            $value = $parts[1]
            if ($value.Length -gt 50) {
                $value = $value.Substring(0, 30) + "..."
            }
            Write-Host "$key=$value"
        } else {
            Write-Host $_
        }
    } else {
        Write-Host $_
    }
}
```

## 🚀 Depois de Configurar

1. **Salve o arquivo `.env`**
2. **Reinicie os containers:**
   ```powershell
   docker compose down
   docker compose up
   ```

## 🔍 Troubleshooting

### Erro: "MONGODB_URI variable is not set"
- Verifique se o arquivo `.env` existe na raiz
- Verifique se a linha `MONGODB_URI=...` está presente
- Verifique se não há espaços antes ou depois do `=`

### Erro: "Invalid scheme, expected connection string to start with mongodb://"
- Verifique se a connection string começa com `mongodb://` ou `mongodb+srv://`
- Verifique se não há aspas extras na connection string
- Verifique se a senha está URL-encoded corretamente

### Erro: "SQLSERVER_URL variable is not set"
- Verifique se o arquivo `.env` existe na raiz
- Verifique se a linha `SQLSERVER_URL=...` está presente
- Verifique se não há espaços antes ou depois do `=`

## 📚 Exemplo Completo

```env
# Porta do serviço (opcional, já definido no docker-compose.yml)
PORT=8082

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://admin:MinhaSenha%40123@cluster0.xxxxx.mongodb.net/green-yield-forge?retryWrites=true&w=majority

# Azure SQL Connection String (formato Prisma)
SQLSERVER_URL=sqlserver://green-yield-forge.database.windows.net:1433;database=arqCLOUD;user=admin;password=Senha%40123;encrypt=true;trustServerCertificate=false;connectionTimeout=30
```

