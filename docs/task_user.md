[TASK] Implementação Completa da Gestão de Usuários
[IMPORTANTE]
Deve-se manter a entidade/tabela `donators` separada de `users`. O sistema pode ter doadores (donators) que não possuem conta de usuário. No futuro, será possível que um donator crie uma conta de usuário e faça o vínculo (campo a ser definido), mas neste momento, donators e users são entidades distintas e não relacionadas diretamente.


## Objetivo
Centralizar toda a gestão de usuários (admin, employee, super_admin) na tabela e módulo `users`, removendo redundâncias e seguindo o padrão de arquitetura do projeto. A entidade `donator` permanece separada e não deve ser tratada como user.

## Requisitos Funcionais
1. Listar usuários com filtro por `role` (admin, employee, super_admin) e por `tenantId` quando aplicável. Não incluir donators nesta listagem.
2. Buscar usuário por ID.
3. Atualizar dados do usuário (exceto senha, que terá fluxo próprio).
4. Garantir autenticação/autorização nas rotas.
5. Seguir padrões de validação, DTOs e schemas já existentes.
6. Donators não devem ser tratados como users. Toda lógica de donators permanece no módulo/entidade `donator`.

## Estrutura de Arquivos e Padrões

- **Schemas/DTOs:**
	- `src/modules/users/schemas/listUsers.schema.ts` — validação de query params para listagem (não incluir donator como opção de role).
	- `src/modules/users/schemas/updateUser.schema.ts` — validação do body para update.
	- `src/modules/users/schemas/getUserById.schema.ts` — validação de params para busca por id.

- **Use Cases:**
	- `src/modules/users/use-cases/listUsers.useCase.ts`
	- `src/modules/users/use-cases/getUserById.useCase.ts`
	- `src/modules/users/use-cases/updateUser.useCase.ts`

- **Controllers:**
	- `src/modules/users/controllers/listUsers.controller.ts`
	- `src/modules/users/controllers/getUserById.controller.ts`
	- `src/modules/users/controllers/updateUser.controller.ts`

- **Rotas:**
	- `src/modules/users/routes/users.routes.ts`
		- GET `/users?role=employee|admin|super_admin` — listagem com filtro (não aceitar donator)
		- GET `/users/:id` — busca por id
		- PATCH `/users/:id` — update de dados

- **Repository:**
	- `src/modules/users/repositories/user.repository.ts` — garantir métodos para listagem filtrada, busca por id e update (sem donator).

- **Testes:**
	- `src/modules/users/tests/listUsers.spec.ts`
	- `src/modules/users/tests/getUserById.spec.ts`
	- `src/modules/users/tests/updateUser.spec.ts`

- **Validação e Segurança:**
	- Usar middlewares de autenticação/autorização já presentes em `src/shared/middlewares/`.
	- Garantir que apenas usuários autorizados possam atualizar dados de outros usuários.
	- Para employee/admin, `tenantId` é obrigatório.

## Subtasks Técnicas

- [ ] Atualizar/expandir o schema de `users` na database se necessário (ex: adicionar campos extras de perfil).
- [ ] Criar/atualizar schemas de validação (listagem, update, get by id).
- [ ] Implementar use-cases:
	- [ ] `listUsers.useCase.ts` (filtro por role e tenantId)
	- [ ] `getUserById.useCase.ts`
	- [ ] `updateUser.useCase.ts`
- [ ] Implementar controllers:
	- [ ] `listUsers.controller.ts`
	- [ ] `getUserById.controller.ts`
	- [ ] `updateUser.controller.ts`
- [ ] Implementar rotas REST em `users.routes.ts`.
- [ ] Garantir autenticação/autorização nas rotas.
- [ ] Escrever testes unitários para use-cases e controllers.
- [ ] Atualizar documentação da API.

## Critérios de Aceitação
- É possível listar usuários filtrando por role (admin, employee, super_admin) e tenantId, sem incluir donators.
- É possível buscar usuário por id.
- É possível atualizar dados do usuário (exceto senha).
- Todas as operações respeitam as regras de permissão e validação.
- Testes cobrindo os principais fluxos.
- Donators continuam sendo gerenciados separadamente, sem relação direta com users neste momento.

---
Observação: Seguir o padrão de organização de pastas, nomenclatura e validação já utilizado nos outros módulos do projeto. Qualquer campo extra de perfil de funcionário deve ser adicionado diretamente em `users`.
 