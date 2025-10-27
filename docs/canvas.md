# Software Architecture Canvas - Green Yield Forge Backend

## Propósito e Objetivos
Sistema de gestão de créditos de carbono com arquitetura de microserviços, permitindo cadastro de projetos, lotes e processamento de pedidos.

## Stakeholders
- Desenvolvedores
- Analistas de negócio
- Operadores de infraestrutura

## Contexto de Negócio
- Marketplace de créditos de carbono
- Rastreabilidade de projetos florestais
- Integração com processos de pagamento

## Requisitos
- CRUD de projetos e lotes
- Processamento de pedidos
- Eventos de ingestão e pagamento
- API RESTful documentada

## Decisões Arquiteturais
- **Padrão**: Microserviços + BFF
- **Linguagem**: Node.js + TypeScript
- **HTTP**: Express.js
- **Dados**: MongoDB + Azure SQL
- **Deploy**: Docker + GitHub Actions

## Constrangimentos
- Node.js 20
- TypeScript obrigatório
- Bancos gerenciados
- RESTful

## Componentes
- BFF (aggregator/proxy)
- MS-Projects (MongoDB)
- MS-Orders (Azure SQL)
- Functions (ingest, receipt)

## Comunicação
- HTTP/REST
- JSON
- Axios para chamadas internas

## Qualidade
- Performance: < 200ms
- Disponibilidade: 99.5%
- Escalabilidade: Horizontal
- Segurança: HTTPS + validação

## Evolução
- Migração para Azure Functions
- Adicionar cache (Redis)
- Implementar eventos assíncronos (Event Grid)

