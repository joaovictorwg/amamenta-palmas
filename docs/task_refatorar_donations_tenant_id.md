# Task: Padronizar `tenant_id` no modulo de doacoes

## Contexto

O modulo `donator` foi ajustado para sempre receber `tenantId` nas operacoes sensiveis de leitura, alteracao e exclusao. O modulo `donation` ainda precisa ser refatorado com o mesmo padrao para impedir acesso cruzado entre hospitais/tenants.

Hoje, varias tabelas e repositories de doacoes operam apenas por `id`, `batchId`, `donorId` ou filtros operacionais. Isso permite que um usuario de um tenant acesse ou altere dados de outro tenant caso conheca um UUID valido.

## Objetivo

Garantir que toda operacao de criar, listar, buscar, atualizar, aprovar, reprovar, distribuir ou descartar dados do modulo `donation` seja escopada por `tenantId`, vindo exclusivamente de `request.user.tenantId`.

## Regras obrigatorias

- Nunca aceitar `tenantId` do body/query params para escopo de seguranca.
- O `tenantId` deve vir de `request.user.tenantId`.
- Se `request.user.tenantId` nao existir, lançar `BadRequestError("Hospital nao informado")` ou erro equivalente ja usado no projeto.
- Todo metodo de repository que leia ou altere dados deve receber `tenantId`.
- Toda query Drizzle de `findById`, `findMany`, `update`, `updateStatus`, `delete` ou equivalente deve filtrar por tenant.
- Toda insercao deve persistir `tenantId` na tabela principal quando a entidade pertencer ao modulo de doacoes.
- Nao confiar apenas em validacao no controller. O filtro precisa existir no repository/use case.
- Usar Drizzle para alterar schema/migrations. Nao escrever migration manual como fonte principal.
- Nao fazer joins desnecessarios quando uma coluna `tenant_id` direta resolver.

## Decisao tecnica recomendada

Adicionar `tenant_id` diretamente nas tabelas principais de doacoes:

- `raw_milk_collections`
- `pasteurization_batches`
- `pasteurized_milk_units`

Para a tabela de relacionamento `batch_raw_milk`, nao e obrigatorio adicionar `tenant_id` se todas as operacoes passarem por batch/raw milk ja escopados por tenant. Se o repository continuar expondo consultas diretas por `batchId` ou `rawMilkCollectionId`, adicionar `tenantId` nos metodos e validar via join.

## Arquivos de schema a alterar

### `amamenta-api/src/shared/database/schema/rawMilkCollections.schema.ts`

Adicionar:

- `tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" })`
- indice em `tenant_id`
- se fizer sentido para queries frequentes, indices compostos:
  - `(tenant_id, donor_id)`
  - `(tenant_id, triage_status)`
  - `(tenant_id, storage_status)`

### `amamenta-api/src/shared/database/schema/pasteurizationBatches.schema.ts`

Adicionar:

- `tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" })`
- indice em `tenant_id`
- se fizer sentido:
  - `(tenant_id, microbiology_status)`
  - `(tenant_id, operator_id)`

### `amamenta-api/src/shared/database/schema/pasteurizedMilkUnits.schema.ts`

Adicionar:

- `tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" })`
- indice em `tenant_id`
- se fizer sentido:
  - `(tenant_id, batch_id)`
  - `(tenant_id, stock_status)`

### Migration

Rodar:

```bash
pnpm db:generate
```

Depois revisar a migration gerada.

Se houver dados existentes, a migration precisa preencher `tenant_id` de forma segura antes de marcar a coluna como `NOT NULL`.

Sugestao de backfill:

- `raw_milk_collections.tenant_id`: obter a partir de `donators.tenant_id`, usando `raw_milk_collections.donor_id = donators.id`.
- `pasteurization_batches.tenant_id`: obter a partir das coletas associadas em `batch_raw_milk -> raw_milk_collections`.
- `pasteurized_milk_units.tenant_id`: obter a partir de `pasteurization_batches.tenant_id`.

Se o ambiente ainda nao tiver dados reais, a migration pode ser mais simples, mas isso deve ser confirmado antes de aplicar.

## Repositories a refatorar

### Raw milk

Arquivos:

- `amamenta-api/src/modules/donation/repositories/rawmilkCollection/rawMilkCollection.repository.ts`
- `amamenta-api/src/modules/donation/repositories/rawmilkCollection/drizzleRawMilkCollection.repository.ts`

Alterar contratos:

```ts
create(data, tenantId)
findById(id, tenantId)
findMany(params, tenantId)
update(id, tenantId, data)
updateStatus(id, tenantId, triageStatus?, storageStatus?, rejectReason?)
```

Todas as queries devem incluir:

```ts
eq(rawMilkCollections.tenantId, tenantId)
```

No `create`, persistir `tenantId`.

### Pasteurization batch

Arquivos:

- `amamenta-api/src/modules/donation/repositories/pasteurizedBach/pasteurizedBatch.repository.ts`
- `amamenta-api/src/modules/donation/repositories/pasteurizedBach/drizzlePasteurizationBatch.repository.ts`

Alterar contratos:

```ts
create(data, tenantId, tx?)
findById(id, tenantId, tx?)
findMany(params, tenantId, tx?)
update(id, tenantId, data, tx?)
updateStatus(id, tenantId, microbiologyStatus)
```

Todas as queries devem filtrar por `pasteurizationBatches.tenantId`.

No `create`, persistir `tenantId`.

### Pasteurized milk unit

Arquivos:

- `amamenta-api/src/modules/donation/repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository.ts`
- `amamenta-api/src/modules/donation/repositories/pasteurizedMilkUnit/drizzlePasteurizedMilkUnit.repository.ts`

Alterar contratos:

```ts
create(data, tenantId, tx?)
findById(id, tenantId, tx?)
findMany(params, tenantId, tx?)
updateStatus(id, tenantId, stockStatus, tx?, recipientIdentifier?)
update(id, tenantId, data, tx?)
```

Todas as queries devem filtrar por `pasteurizedMilkUnits.tenantId`.

No `create`, persistir `tenantId`.

### Batch raw milk relationship

Arquivos:

- `amamenta-api/src/modules/donation/repositories/batchRawMilk/batchRawMilk.repository.ts`
- `amamenta-api/src/modules/donation/repositories/batchRawMilk/drizzleBatchRawMilk.repository.ts`

Opcoes:

1. Preferencial: adicionar `tenantId` nos metodos e validar por join com `pasteurization_batches` ou `raw_milk_collections`.
2. Alternativa: adicionar `tenant_id` direto em `batch_raw_milk`, se isso simplificar queries e auditoria.

Contratos sugeridos:

```ts
create(data, tenantId, tx?)
createMany(data, tenantId, tx?)
findByBatchId(batchId, tenantId, tx?)
findByRawMilkCollectionId(rawMilkCollectionId, tenantId, tx?)
```

## Use cases a refatorar

### Raw milk

Arquivos:

- `amamenta-api/src/modules/donation/use-cases/rawMilkCollection/createRawMilkCollection.usecase.ts`
- `amamenta-api/src/modules/donation/use-cases/rawMilkCollection/approveRawMilk.usecase.ts`
- `amamenta-api/src/modules/donation/use-cases/rawMilkCollection/insertRawMilk.usecase.ts`
- `amamenta-api/src/modules/donation/use-cases/rawMilkCollection/triageRawMilkBatch.usecase.ts`

Regras:

- Todo input deve receber `tenantId`.
- Toda chamada a repository deve passar `tenantId`.
- Em `createRawMilkCollection`, validar doadora usando `DonatorRepository.findById(donorId, tenantId)`.
- Em triagem/aprovacao/rejeicao, update por id precisa passar tenant.

### Pasteurization batch

Arquivos:

- `amamenta-api/src/modules/donation/use-cases/PasteurizationBatch/createPasteurizationBatch.usecase.ts`
- `amamenta-api/src/modules/donation/use-cases/PasteurizationBatch/approveBatchMicrobiology.usecase.ts`
- `amamenta-api/src/modules/donation/use-cases/PasteurizationBatch/rejectBatchMicrobiology.usecase.ts`

Regras:

- Todo input deve receber `tenantId`.
- Ao criar lote, todos os `rawMilkIds` devem pertencer ao mesmo `tenantId`.
- Ao aprovar/rejeitar, buscar o batch com `findById(batchId, tenantId)`.
- Ao criar unidades pasteurizadas, persistir `tenantId`.
- Ao consultar relacoes `batch_raw_milk`, passar `tenantId`.

### Pasteurized milk unit

Arquivos:

- `amamenta-api/src/modules/donation/use-cases/PasteurizedMilkUnit/createPasteurizedMilkUnit.usecase.ts`
- `amamenta-api/src/modules/donation/use-cases/PasteurizedMilkUnit/distributePasteurizedMilk.usecase.ts`

Regras:

- Todo input deve receber `tenantId`.
- Criacao manual de unidade deve validar que o batch pertence ao tenant antes de criar a unidade.
- Distribuicao deve buscar e atualizar por `id + tenantId`.

## Controllers a refatorar

Arquivos:

- `amamenta-api/src/modules/donation/controllers/rawMilk.controller.ts`
- `amamenta-api/src/modules/donation/controllers/pasteurizationBatch.controller.ts`
- `amamenta-api/src/modules/donation/controllers/pasteurizedMilk.controller.ts`

Criar helper local ou compartilhado:

```ts
function getRequestTenantId(request: FastifyRequest): string {
  const requestUser = request as FastifyRequest & {
    user?: { tenantId: string | null };
  };

  if (!requestUser.user?.tenantId) {
    throw new BadRequestError("Hospital nao informado");
  }

  return requestUser.user.tenantId;
}
```

Em todos os controllers:

- extrair `tenantId` no inicio;
- passar para o use case/repository;
- nunca aceitar `tenantId` vindo do body/query.

## Schemas Zod

Arquivos:

- `amamenta-api/src/modules/donation/schemas/rawMilk.schema.ts`
- `amamenta-api/src/modules/donation/schemas/pasteurizationBatch.schema.ts`
- `amamenta-api/src/modules/donation/schemas/pasteurizedMilk.schema.ts`

Regras:

- Nao adicionar `tenantId` aos schemas publicos de body/query.
- `tenantId` e informacao de sessao, nao payload do cliente.

## Rotas e autenticacao

Verificar se as rotas de doacoes usam middleware de autenticacao antes de depender de `request.user`.

Arquivos:

- `amamenta-api/src/modules/donation/routes/rawMilk.routes.ts`
- `amamenta-api/src/modules/donation/routes/pasteurizationBatch.routes.ts`
- `amamenta-api/src/modules/donation/routes/pasteurizedMilk.routes.ts`
- `amamenta-api/src/app/routes.ts`

Se o projeto nao aplica `authenticate` globalmente, adicionar o middleware nas rotas de doacoes ou no registro do modulo, seguindo o padrao ja usado no repo.

## Criterios de aceite

- Nenhuma query de leitura/alteracao em `donation` deve buscar apenas por `id` sem tenant.
- Nenhum create em tabela principal de doacao deve deixar `tenant_id` vazio.
- Um usuario de tenant A nao consegue:
  - listar leite cru do tenant B;
  - buscar leite cru do tenant B por id;
  - atualizar leite cru do tenant B por id;
  - criar lote com leite cru de tenant B;
  - buscar lote do tenant B;
  - aprovar/rejeitar lote do tenant B;
  - buscar unidade pasteurizada do tenant B;
  - distribuir/descartar unidade do tenant B.
- `pnpm db:generate` gera migration coerente com `tenant_id`.
- TypeScript compila no recorte alterado.

## Checklist de busca final

Depois da refatoracao, rodar:

```bash
rg "findById\\(|findMany\\(|update\\(|updateStatus\\(|delete\\(" src/modules/donation -n
rg "tenantId|tenant_id" src/modules/donation src/shared/database/schema -n
```

Revisar manualmente cada resultado para garantir que nao sobrou operacao sem tenant.
