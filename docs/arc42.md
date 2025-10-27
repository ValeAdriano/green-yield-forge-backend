# Documentação ARC42 - Green Yield Forge Backend

## 1. Introdução e Objetivos

### 1.1 Requisitos
- Backend em Node.js + TypeScript
- Arquitetura de microserviços
- Integração com MongoDB Atlas e Azure SQL
- Padrão BFF (Backend for Frontend)
- Automação de CI/CD com GitHub Actions

### 1.2 Restrições
- Node.js 20
- TypeScript
- Express.js
- Banco de dados gerenciados (MongoDB Atlas e Azure SQL)

## 2. Decisões de Arquitetura

### 2.1 Padrão BFF
- **Decisão**: Implementar BFF como agregador de microserviços
- **Motivo**: Reduzir latência e número de chamadas do frontend
- **Consequências**: Aumenta complexidade, mas melhora UX

### 2.2 Separação de Dados
- **Decisão**: Projetos/lotes em MongoDB, Pedidos em Azure SQL
- **Motivo**: Otimizar para diferentes tipos de consulta
- **Consequências**: Necessário gerenciar múltiplas conexões

### 2.3 Functions HTTP
- **Decisão**: Usar Express para simular Azure Functions
- **Motivo**: Fácil migração futura
- **Consequências**: Mesma base tecnológica, baixa fricção

## 3. Qualidade

### 3.1 Disponibilidade
- Targets: 99.5%
- Estratégia: Health checks e retry policies

### 3.2 Performance
- Latência alvo: < 200ms para operações CRUD
- Estratégia: Índices nos bancos de dados

### 3.3 Segurança
- HTTPS obrigatório
- Validação de inputs
- Variáveis de ambiente para credenciais

## 4. Riscos

### 4.1 Alto Risco
1. **Falha de conexão com bancos**
   - Mitigação: Health checks e circuit breaker
2. **SQL Injection**
   - Mitigação: Validação e sanitização de inputs

### 4.2 Médio Risco
1. **Timeout em chamadas HTTP**
   - Mitigação: Timeouts configuráveis
2. **Dependência externa**
   - Mitigação: Cache e fallbacks

## 5. Implantação

### 5.1 Ambiente de Desenvolvimento
- 5 serviços Node.js rodando localmente
- Portas: 8080-8082, 8090-8091

### 5.2 Ambiente de Produção
- Imagens Docker no Docker Hub
- Deploy via GitHub Actions
- Containers orquestrados (Kubernetes/ACI)

## 6. Operação

### 6.1 Monitoramento
- Health endpoints em todos os serviços
- Logs estruturados
- Métricas de latência

### 6.2 Escalabilidade
- Horizontal scaling via containers
- Connection pooling
- Stateless services

