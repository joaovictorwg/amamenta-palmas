# Plano de Desenvolvimento — Módulo de Doações (Banco de Leite)

Esse plano é focado especificamente no domínio:

* doações
* leite cru
* pasteurização
* rastreabilidade
* estoque

Objetivo:

* criar um MVP sólido
* simples o suficiente pra desenvolver rápido
* mas arquitetado corretamente

---

# Objetivo do módulo

O módulo deve permitir:

* registrar frascos de leite cru
* acompanhar validade
* realizar triagem
* organizar fila de pasteurização
* criar lotes
* gerar leite pasteurizado
* controlar estoque final
* manter rastreabilidade

---

# Estrutura final do módulo

```text id="fpfqwf"
donations
├ controllers
├ dtos
├ entities
├ enums
├ repositories
├ routes
├ schemas
├ useCases
└ utils
```

---

# Entidades do módulo

O módulo terá inicialmente:

---

# 1. raw_milk_collections

Representa:

> cada frasco individual coletado da doadora

---

# 2. pasteurization_batches

Representa:

> cada ciclo/processo da máquina

---

# 3. batch_raw_milk

Representa:

> quais frascos crus participaram do lote

(Tabela pivô simples)

---

# 4. pasteurized_milk_units

Representa:

> cada frasco final disponível no estoque

---

# FASE 1 — ENUMS E REGRAS DE DOMÍNIO

Antes de criar tabelas.

---

# Task 1 — Criar enums do domínio

## raw milk

```ts id="pjlwm1"
export enum RawMilkTriageStatus {
  PENDING,
  APPROVED,
  REJECTED,
}
```

---

```ts id="i3hvga"
export enum RawMilkStorageStatus {
  STORED,
  WAITING_BATCH,
  USED_IN_BATCH,
  EXPIRED,
  DISCARDED,
}
```

---

# pasteurization

```ts id="6v6we0"
export enum MicrobiologyStatus {
  PENDING,
  APPROVED,
  REJECTED,
}
```

---

# pasteurized milk

```ts id="0b6i4m"
export enum PasteurizedMilkStockStatus {
  AVAILABLE,
  DISTRIBUTED,
  EXPIRED,
  DISCARDED,
}
```

---

# Task 2 — Definir regras de negócio oficiais

Documentar:

---

## Regras leite cru

* validade:

```text id="6jvqla"
collection_date + 15 dias
```

* não pode entrar em lote se:

  * vencido
  * rejeitado
  * já utilizado

---

## Regras lote

* lote só aceita:

  * leite aprovado
  * leite válido

---

## Regras leite pasteurizado

* validade:

```text id="fx3bfm"
pasteurized_at + 6 meses
```

---

# FASE 2 — MODELAGEM DO BANCO

---

# Task 3 — Criar schema raw_milk_collections

## Campos

| campo           | tipo          |
| --------------- | ------------- |
| id              | uuid          |
| donor_id        | uuid          |
| visit_id        | uuid nullable |
| collection_date | timestamp     |
| received_at     | timestamp     |
| volume_ml       | integer       |
| expiration_date | timestamp     |
| triage_status   | enum          |
| storage_status  | enum          |
| discard_reason  | text nullable |
| observations    | text nullable |
| created_by      | uuid          |
| created_at      | timestamp     |
| updated_at      | timestamp     |

---

# Regras importantes

## expiration_date

Calculado automaticamente:

```text id="k9iqrp"
collection_date + 15 dias
```

---

# Índices importantes

```text id="mdfjlwm"
triage_status
storage_status
expiration_date
donor_id
```

---

# Task 4 — Criar schema pasteurization_batches

## Campos

| campo               | tipo          |
| ------------------- | ------------- |
| id                  | uuid          |
| batch_code          | varchar       |
| pasteurized_at      | timestamp     |
| operator_id         | uuid          |
| microbiology_status | enum          |
| observations        | text nullable |
| created_at          | timestamp     |
| updated_at          | timestamp     |

---

# Índices

```text id="elpkdz"
batch_code
microbiology_status
pasteurized_at
```

---

# Task 5 — Criar schema batch_raw_milk

(Tabela pivô simples)

## Campos

| campo                  | tipo |
| ---------------------- | ---- |
| batch_id               | uuid |
| raw_milk_collection_id | uuid |

---

# Constraints IMPORTANTES

## unique

```text id="5uhj6k"
(batch_id, raw_milk_collection_id)
```

---

# Objetivo

Garantir rastreabilidade:

* quais frascos entraram em qual lote

---

# Task 6 — Criar schema pasteurized_milk_units

## Campos

| campo           | tipo               |
| --------------- | ------------------ |
| id              | uuid               |
| batch_id        | uuid               |
| volume_ml       | integer            |
| expiration_date | timestamp          |
| stock_status    | enum               |
| distributed_at  | timestamp nullable |
| discard_reason  | text nullable      |
| created_at      | timestamp          |
| updated_at      | timestamp          |

---

# Regras

## expiration_date

Calculado:

```text id="3egzv9"
pasteurized_at + 6 meses
```

---

# FASE 3 — REPOSITORIES

---

# Task 7 — Criar repositories

## raw milk

```text id="gngkqq"
create
findById
findMany
update
updateStatus
```

---

## batches

```text id="35ghc0"
create
findById
findMany
```

---

## pasteurized milk

```text id="gkfy4m"
create
findById
findMany
updateStatus
```

---

# FASE 4 — USE CASES

Aqui fica a lógica real.

---

# Task 8 — CreateRawMilkCollectionUseCase

## Responsabilidades

* validar dados
* calcular validade
* salvar coleta

---

# Regras

## NÃO permitir:

```text id="1mj3ls"
collection_date > hoje
```

---

# Task 9 — ApproveRawMilkUseCase

## Responsabilidades

* aprovar triagem
* alterar status

---

# Fluxo

```text id="p6c1jd"
PENDING -> APPROVED
```

---

# Task 10 — RejectRawMilkUseCase

## Responsabilidades

* rejeitar leite
* registrar motivo

---

# Fluxo

```text id="j9sl2l"
PENDING -> REJECTED
```

---

# Task 11 — CreatePasteurizationBatchUseCase

Esse é o use case MAIS importante.

---

# Responsabilidades

* validar frascos
* criar lote
* vincular frascos
* atualizar status

---

# Validações IMPORTANTES

## Todos os frascos devem:

* existir
* estar aprovados
* não vencidos
* não utilizados

---

# Fluxo

```text id="pcj3bp"
APPROVED
→ USED_IN_BATCH
```

---

# Task 12 — ApproveBatchMicrobiologyUseCase

## Responsabilidades

* aprovar microbiologia
* liberar produção final

---

# Task 13 — RejectBatchMicrobiologyUseCase

## Responsabilidades

* reprovar lote
* bloquear distribuição

---

# Task 14 — CreatePasteurizedMilkUnitUseCase

## Responsabilidades

* criar frasco final
* calcular validade
* disponibilizar estoque

---

# Task 15 — DistributePasteurizedMilkUseCase

## Responsabilidades

* marcar distribuição
* registrar data

---

# Validações

NÃO permitir:

* vencido
* descartado

---

# FASE 5 — CONTROLLERS

---

# Task 16 — RawMilkControllers

## Endpoints

```http id="2isjlwm"
POST /raw-milk
GET /raw-milk
GET /raw-milk/:id
PATCH /raw-milk/:id
PATCH /raw-milk/:id/approve
PATCH /raw-milk/:id/reject
```

---

# Task 17 — PasteurizationBatchControllers

## Endpoints

```http id="9wvkqx"
POST /pasteurization-batches
GET /pasteurization-batches
GET /pasteurization-batches/:id
PATCH /pasteurization-batches/:id/approve
PATCH /pasteurization-batches/:id/reject
```

---

# DTO criação lote

```json id="c8q1g9"
{
  "rawMilkIds": [
    "uuid1",
    "uuid2"
  ]
}
```

---

# Task 18 — PasteurizedMilkControllers

## Endpoints

```http id="m9f4wj"
POST /pasteurized-milk
GET /pasteurized-milk
GET /pasteurized-milk/:id
PATCH /pasteurized-milk/:id/distribute
PATCH /pasteurized-milk/:id/discard
```

---

# FASE 6 — QUERY E DASHBOARD SUPPORT

---

# Task 19 — Filtros leite cru

## Filtros

* status
* validade
* doadora
* período
* vencidos

---

# Task 20 — Filtros lote

## Filtros

* microbiologia
* período
* operador

---

# Task 21 — Filtros leite pasteurizado

## Filtros

* disponível
* vencido
* distribuído

---

# FASE 7 — MÉTRICAS

---

# Task 22 — Metrics queries

## Métricas

---

## leite cru

* total armazenado
* vencendo
* descartado

---

## pasteurização

* quantidade de lotes
* taxa aprovação

---

## estoque final

* disponível
* distribuído
* vencido

---

# FASE 8 — MELHORIAS FUTURAS (NÃO IMPLEMENTAR AGORA)

Essas coisas DEVEM esperar.

---

# NÃO fazer agora

* automação de validade
* fila inteligente
* otimização de lote
* QR code
* eventos/auditoria completa
* fracionamento parcial
* notificações automáticas
* workflow complexo

---




🛠️ Ajustes Técnicos e Refinamentos para o seu Plano1. Correção no Schema raw_milk_collections (Task 3)A coluna expiration_date está mapeada como calculada a partir de collection_date + 15 dias.O ajuste: Pela RDC 171 da Anvisa, o leite cru congelado em ambiente domiciliar dura 15 dias a partir da primeira coleta/ordenha. Porém, o congelador doméstico não tem o mesmo poder de congelamento do hospital. Se a mãe demorar os 7 dias limite para entregar, o hospital só terá mais 8 dias para pasteurizar.Ação: O campo expiration_date deve ser gerado via trigger ou código obrigatoriamente somando 15 dias em cima da collection_date. Certifique-se de que o backend valide se received_at é menor que expiration_date no momento da recepção.2. Adição de Constraint em batch_raw_milk (Task 5)A tabela pivô impede que o mesmo frasco entre no mesmo lote. Mas precisamos impedir que ele entre em lotes diferentes.Ação: Adicione uma constraint de UNIQUE apenas na coluna raw_milk_collection_id. Como um frasco de leite cru é despejado por inteiro na máquina (você optou por não fazer fracionamento parcial agora, o que está correto), ele só pode existir uma única vez nessa tabela.3. Vinculação Automática na Task 12 e 14 (ApproveBatchMicrobiologyUseCase)Na Task 12, o lote é aprovado. Na Task 14, cria-se a unidade pasteurizada. No fluxo real do hospital, assim que o laudo da microbiologia sai como APPROVED, a máquina é aberta e o leite é envasado imediatamente.Ação: Una a Task 12 e a Task 14 no mesmo caso de uso ou faça a Task 12 disparar a Task 14 automaticamente. Quando o lote for aprovado, o sistema deve exigir o volume_final_ml e a quantidade de frascos gerados, criando os registros de pasteurized_milk_units na mesma transação do banco (ACID Transaction).4. O "Efeito Cascata" na Reprovação do Lote (Task 13)Se o exame de microbiologia der REJECTED na Task 13, o que acontece com as unidades físicas de leite?Ação: O caso de uso RejectBatchMicrobiologyUseCase deve atualizar o microbiology_status do lote para REJECTED e, em cascata, criar os registros de pasteurized_milk_units já com o status DISCARDED e discard_reason: "Falha na análise microbiológica do lote". Isso evita que leite contaminado fique "solto" no sistema esperando descarte manual.5. Controle de Saída Simplificado na Task 18No endpoint PATCH /pasteurized-milk/:id/distribute, adicione no corpo (body) da requisição um campo simples:"recipient_identifier": string (nullable) (pode ser o ID ou prontuário do bebê receptor). Mesmo sendo um MVP, salvar para qual leito/bebê o frasco foi garante o ciclo completo da rastreabilidade reversa que os hospitais exigem.6. Endpoint de Triagem em Lote (Task 16 - UX/DX)Hoje você colocou PATCH /raw-milk/:id/approve. Imagine o funcionário do hospital recebendo uma caixa térmica com 15 frascos da mesma mãe e tendo que clicar em aprovar 15 vezes, abrindo 15 requisições HTTP.Sugestão de Endpoint: Adicione um POST /raw-milk/triage que aceita um array de IDs e o status:json{
  "rawMilkIds": ["uuid1", "uuid2", "uuid3"],
  "status": "APPROVED"
}
Use o código com cuidado.


1. Implementação Completa dos Repositórios

Métodos de persistência para batch_raw_milk (tabela pivô) ainda não implementados.
Garantir constraints e regras de unicidade conforme plano (ex: um frasco só pode estar em um lote).
Métodos de updateStatus e update para entidades principais.
2. Use Cases Faltantes ou Incompletos

Vincular frascos ao lote (persistir na batch_raw_milk) ao criar lote.
Atualizar status dos frascos para USED_IN_BATCH ao criar lote.
Implementar RejectBatchMicrobiologyUseCase com lógica de efeito cascata (criar unidades pasteurizadas descartadas automaticamente).
Implementar CreatePasteurizedMilkUnitUseCase (caso precise ser separado).
Implementar DistributePasteurizedMilkUseCase (marcar distribuição, registrar data e recipient_identifier).
Implementar endpoint de triagem em lote (POST /raw-milk/triage).
3. Controllers e Rotas

Garantir que todos endpoints do plano estejam criados e conectados aos use-cases.
Adicionar endpoint de triagem em lote.
Adicionar PATCH /pasteurized-milk/:id/distribute com recipient_identifier.
4. Validações e Regras de Negócio

Validar regras de validade (collection_date + 15 dias, pasteurized_at + 6 meses).
Validar que frascos não estejam vencidos, rejeitados ou já utilizados antes de entrar em lote.
Validar constraints de unicidade na batch_raw_milk.
5. Testes

Testar todos os fluxos principais: criação, aprovação, rejeição, distribuição.
Testar regras de negócio e constraints.
6. Ajustes Técnicos do Plano

Garantir cálculo automático de expiration_date.
Garantir transação ACID ao aprovar lote e criar unidades pasteurizadas.
Implementar cascade discard na rejeição do lote.
Se quiser, posso detalhar um checklist de arquivos ou tarefas específicas para cada item!

1. Repositórios
 Implementar métodos de persistência para batch_raw_milk (tabela pivô), garantindo constraints de unicidade (um frasco só pode estar em um lote).
 Garantir métodos updateStatus e update para entidades principais (raw milk, batches, pasteurized milk).
2. Use Cases
 Vincular frascos ao lote (persistir na batch_raw_milk) ao criar lote.
 Atualizar status dos frascos para USED_IN_BATCH ao criar lote.
 Implementar RejectBatchMicrobiologyUseCase com lógica de efeito cascata (criar unidades pasteurizadas descartadas automaticamente).
 Implementar CreatePasteurizedMilkUnitUseCase (caso precise ser separado).
 Implementar DistributePasteurizedMilkUseCase (marcar distribuição, registrar data e recipient_identifier).
 Implementar endpoint de triagem em lote (POST /raw-milk/triage).
3. Controllers e Rotas
 Garantir que todos endpoints do plano estejam criados e conectados aos use-cases.
 Adicionar endpoint de triagem em lote (POST /raw-milk/triage).
 Adicionar PATCH /pasteurized-milk/:id/distribute com recipient_identifier.
4. Validações e Regras de Negócio
 Validar regras de validade (collection_date + 15 dias, pasteurized_at + 6 meses).
 Validar que frascos não estejam vencidos, rejeitados ou já utilizados antes de entrar em lote.
 Validar constraints de unicidade na batch_raw_milk.
 Garantir cálculo automático de expiration_date.
 Garantir transação ACID ao aprovar lote e criar unidades pasteurizadas.
 Implementar cascade discard na rejeição do lote.