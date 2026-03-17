# Create Donator Module

### CreateDonator UseCase

**Endpoint:**
`POST /donators`

**Body Example:**
{
"id": "uuid",
"name": "Maria Silva",
"phone": "63999999999",
"address": "Palmas - TO",
"status": "active",
"createdAt": "2026-03-14T18:00:00Z"
}

### Module Structure

donator
├ controllers
│ └ create-donator.controller.ts
│
├ use-cases
│ └ create-donator.usecase.ts
│
├ repositories
│ ├ donator.repository.ts
│ └ drizzle-donator.repository.ts
│
├ routes
│ └ donator.routes.ts
│
├ schemas
│ └ create-donator.schema.ts
│
└ entities
└ donator.entity.ts

### Responsabilities

| layer        | responsabilidade    |
| ------------ | ------------------- |
| entities     | modelo do domínio   |
| schemas      | validação HTTP      |
| controllers  | entrada HTTP        |
| use-cases    | regra de negócio    |
| repositories | acesso ao banco     |
| routes       | registrar endpoints |

### Exectution Flow

Ao chamar o endpoint:
`POST /donators`

**Fluxo Interno:**
route
↓
controller
↓
use-case
↓
repository
↓
database

**Visualmente:**
HTTP
↓
Route
↓
Controller
↓
UseCase
↓
Repository
↓
Database

## Passo a Passo

### Passo 1 - Criar entidade do Domínio

Arquivo:
`modules/donator/entities/donator.entity.ts`

A entidade do Domínio deve permancer inalterada mesmo com mudanças em infraestrutura (Drizze, PostgreSQL, API...). É um definição fixa do que a entidade **Donator** deve ter.

### Passo 2 - Criar esquema de requisição

Arquivo:
`modules/donator/schemas/create-donator.schema.ts`

O esquema é responsável por válidar o corpo da requisição

### Passo 3 - Definir contrato do repositorio

`modules/donator/schemas/create-donator.schema.ts`

Define o contrato da entidade, qualquer implementação deve respeitar o que é definido no contrato

### Passo 4 - Implementar o UseCase

`modules/donator/use-cases/create-donator.usecase.ts`

---

## Lidando com ERROS ESPERADOS

Nesta aplicação vamos evitar utilizar Try Catch. Até porque os erros de API normalmente são esperados.

Por exemplo, quando o usuário tenta deletar um donator passando o ID errado, devemos retornar um erro NotFound 404, é um erro
que nós já esperamos que aconteça.

No diretório shared/errors temos os erros conhecidos da nossa aplicação já declarados, devemos utilizar estes tipos de erros e evitar criar novas tipagens de erro diretamente na implementação seja de rotas, controllers, useCases.

### Onde lançar (throw) ERRORS

A regra é:
| erro | camada |
| ---------------- | ---------- |
| Validation | rota (Zod) |
| Regra de negócio | UseCase |
| Autorização | middleware |
| Banco | repository |

Portanto, como falado anteriormente, aquele erro de **donator** not found by ID é um erro esperado e é um erro de regra de negócio, afinal, a regra é que só podemos deletar um donator passando um ID para identificar ele no banco.

### Padronização de Erros

Sempre que precisarmos de um novo erro personalizado, vamos criar essa nova tipagem de erro no diretório src/shared/errors
errors
├── AppError.ts
├── NotFoundError.ts
├── ValidationError.ts
└── UnauthorizedError.ts

E para encapsular todos esses erros, temos o arquivo **AppError.ts**

---

📘 Módulo: Donator (Padrão Arquitetural)

Este módulo serve como referência base para construção dos demais módulos da aplicação.

Ele segue princípios de:

Separação de responsabilidades

Código limpo (Clean Code)

Arquitetura em camadas (inspirada em Clean Architecture)

📂 Estrutura do módulo
📦donator
┣ 📂controllers
┣ 📂dtos
┣ 📂entities
┣ 📂repositories
┣ 📂routes
┣ 📂schemas
┗ 📂useCases
🧠 Visão geral do fluxo
ROUTE → CONTROLLER → USECASE → REPOSITORY → DATABASE

Exemplo prático:

GET /donators?page=1

→ validação (Zod)
→ controller chama useCase
→ useCase aplica regra de negócio
→ repository busca no banco
→ retorna resposta padronizada
📦 Camadas explicadas

1. 📂 routes

Responsável por:

Definir endpoints

Aplicar validação com Zod

Chamar controllers

Exemplo
fastify.get("/donators", {
schema: getDonatorsSchema,
}, getDonatorsController); 2. 📂 schemas (Zod)

Responsável por:

Validar entrada da requisição

👉 Aqui tratamos erros de validação

Exemplo
z.object({
page: z.number().min(1),
limit: z.number().max(100),
}); 3. 📂 controllers

Responsável por:

Receber request

Chamar useCase

Retornar response

👉 Controller NÃO tem regra de negócio

Exemplo
export async function getDonatorsController(req, reply) {
const result = await getDonatorsUseCase.execute(req.query);
return reply.send(result);
} 4. 📂 useCases

Responsável por:

Regras de negócio

Orquestração da aplicação

👉 Aqui é o coração do sistema

Exemplo
if (!donator) {
throw new NotFoundError("Donator not found");
} 5. 📂 repositories

Responsável por:

Acesso ao banco

Queries

Paginação e filtros

👉 NÃO tem regra de negócio

6. 📂 entities

Representa:

Estrutura do domínio (Donator)

7. 📂 dtos

Responsável por:

Tipar entrada e saída da aplicação

📘 PADRÕES IMPORTANTES
✅ Paginação padrão

Sempre retornar:

{
data: [],
meta: {
page,
limit,
total,
totalPages
}
}
✅ DTOs

Separação:

RequestDTO → entrada

ResponseDTO → saída

Exemplo
export interface GetDonatorsRequestDTO {
page: number;
limit: number;
name?: string;
}
✅ Reutilização inteligente

Use DTOs comuns:

PaginationParams
PaginationMeta

Evite:

type Request
type Data
🚨 Lidando com ERROS ESPERADOS

Nesta aplicação evitamos usar try/catch desnecessário.

Erros de API são esperados, não exceções raras.

Exemplos de erros esperados

Donator não encontrado → 404

Dados inválidos → 400

Conflito → 409

📂 shared/errors

Todos os erros devem ser centralizados:

NotFoundError
BadRequestError
ConflictError
UnauthorizedError
📌 Onde lançar (throw) erros
Tipo de erro Camada
Validação Schema (Zod)
Regra de negócio UseCase
Autorização Middleware
Banco de dados Repository
💡 Exemplos práticos
❌ ERRADO
if (!id) {
throw new Error("Invalid ID");
}
✅ CERTO
throw new BadRequestError("Invalid ID");
🌍 Error Handler Global

Deve ser registrado no app:

app.setErrorHandler(errorHandler);
Exemplo de handler
export function errorHandler(error, req, reply) {
if (error instanceof AppError) {
return reply.status(error.statusCode).send({
message: error.message,
});
}

return reply.status(500).send({
message: "Internal server error",
});
}
🔍 Filtros e Query dinâmica

No repository usamos filtros dinâmicos:

if (name) {
filters.push(ilike(donators.name, `%${name}%`));
}
⚠️ Boas práticas importantes
❌ NÃO fazer

Regra de negócio no controller

Query no useCase

Validação fora do Zod

Usar any

Criar erro custom em qualquer lugar

✅ SEMPRE fazer

Tipar tudo (DTOs)

Padronizar resposta

Separar responsabilidades

Reutilizar o que faz sentido

🧠 Decisões arquiteturais adotadas

Arquitetura modular

Separação por responsabilidade

Tipagem forte (TypeScript)

Validação com Zod

ORM: Drizzle

Error handling centralizado

🎯 Resumo final

Se você seguir esse padrão:

Seu código fica previsível

Fácil de escalar

Fácil de onboardar novos devs

Evita bugs estruturais

# Testes

ESTRUTURA:
src
┣ modules
┃ ┗ donators
┃ ┣ useCases
┃ ┃ ┣ createDonator.ts
┃ ┃ ┗ createDonator.spec.ts 👈 unit
┃ ┣ repositories
┃ ┃ ┗ donator.repository.spec.ts 👈 integration
┃ ┣ routes
┃ ┃ ┗ donator.e2e.spec.ts 👈 e2e

### 1. Unit Tests (base do sistema)

Testam regras de negócio isoladas

Foco: useCases

Exemplo no seu projeto:

criar doadora

validar regra de doação

verificar status

✔ rápido
✔ sem banco
✔ sem HTTP

### 2. Integration Tests

Testam integração entre camadas
Foco:

repository + banco

useCase + repository

Exemplo:

buscar doadora no banco

paginação funcionando

### 3. E2E (End-to-End)

Testa o fluxo completo

Foco:

rota → controller → useCase → banco

Exemplo:

POST /donators

✔ simula cliente real
✔ usa Fastify + request

### Setup testes:

npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
