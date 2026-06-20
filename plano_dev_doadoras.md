🗄️ Task 1 — Core de Dados (Modelagem, Enums e Repositórios)
Objetivo
Construir a fundação do módulo:

modules/donators
Esta task define:

contratos do domínio;

modelagem relacional;

enums sanitários;

acesso a dados;

consultas otimizadas;

estrutura para evolução futura.

Esta etapa não implementa endpoints nem regras completas de negócio.

O objetivo é disponibilizar uma base segura para as próximas tasks.

Arquitetura Obrigatória
Seguir estrutura:

modules/
└── donators
    ├── enums/
    ├── schemas/
    ├── repositories/
    │   ├── contracts/
    │   └── drizzle/
    ├── entities/
    ├── useCases/
    └── controllers/
Regras:

ORM: Drizzle

Banco: PostgreSQL

Validação: Zod

Datas: UTC

IDs: UUID

Sem regras de domínio dentro dos repositories

1. Implementar Enums de Domínio
Objetivo
Eliminar strings mágicas e centralizar regras sanitárias.

Criar:

modules/donators/enums
Criar versões:

TypeScript

PostgreSQL ENUM

DonatorStatus
enum DonatorStatus {
  PENDING_EXAMS,
  ACTIVE,
  INACTIVE
}
Regras
Status | Descrição -- | -- PENDING_EXAMS | padrão inicial ACTIVE | apta para coleta INACTIVE | suspensa
Regra de validade
Calcular:

validUntil = examDate + 6 meses
Persistir valor calculado.

Constraints
CHECK(valid_until >= exam_date)
Índices
Criar:

INDEX(donator_id)
INDEX(valid_until)
INDEX(exam_date)
Auditoria
createdAt
updatedAt
Critérios de aceite
histórico múltiplo funcionando;

validade persistida.

3. Implementar Repositórios
Criar:

repositories/contracts
repositories/drizzle
DonatorRepository
Interface
create(data)
findMany(
filters,
pagination
)


findById(id)


updateStatus(
id,
status
)


updateLastCollectionDate(
id,
date
)

Regras
findMany
Implementar filtros dinâmicos.

Exemplo:

if (city)
where.push(
ilike(...)
)
Retorno obrigatório:

{
data: [],
meta: {
page,
limit,
total,
totalPages
}
}
findById
Realizar:

LEFT JOIN
clinical_history
Retornar perfil consolidado.

Critérios de aceite
paginação padrão;

filtros dinâmicos;

joins funcionando.

DonatorClinicalHistoryRepository
Interface
createOrUpdate(
donorId,
data
)
Regra
Implementar:

UPSERT
Fluxo:

INSERT
↓ conflito
UPDATE
Base:

donator_id
Critérios de aceite
UPSERT funcionando.

DonatorExamsRepository
Interface
create(data)

findLatestByDonatorId(
donorId
)


findExpiredExams()

Regras
findLatestByDonatorId
Ordenação:

ORDER BY created_at DESC
LIMIT 1
findExpiredExams
Retornar:

valid_until < NOW()
Uso:

dashboard
cron
alertas
Critérios de aceite
busca do último exame;

query de vencimento.

Tratamento de Erros
Não utilizar:

try/catch genérico
Utilizar exceções globais.

NotFoundError
Exemplos:

doadora inexistente
histórico inexistente
BadRequestError
Exemplos:

data inválida
retroação de exame
ConflictError
Exemplo:

telefone duplicado
Fluxo:

buscar telefone
↓
validar
↓
inserir
ou

capturar unique violation
↓
mapear erro
Observações Técnicas
Evitar:

lógica no repository;

queries dentro do useCase;

joins desnecessários;

enum como string livre.

Preparar o módulo para suportar futuramente:

integrações WhatsApp;

cadastro externo;

histórico de visitas;

dashboard operacional.

👩‍🍼 Task 2: Operações Essenciais (Cadastro Rápido e Listagem)
Contexto para o Dev Backend: Esta etapa foca na entrada da doadora no sistema e na listagem dessas doadoras para a equipe do hospital. O segredo aqui é garantir que o cadastro inicial (seja feito pelo hospital ou pelo WhatsApp/Landing Page) seja o mais simples possível para não perder a conversão da doadora, deixando as burocracias de exames para depois.
1. Validação de Entrada (Zod Schemas)
O Zod será utilizado para validar os dados da requisição antes que eles cheguem no Controller ou UseCase, disparando um erro de validação automático se algo estiver errado
.
Crie o arquivo create-donator.schema.ts com os campos obrigatórios básicos exigidos na primeira interação
:
export const createDonatorSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10), // Usado para busca no WhatsApp
  address: z.string().min(3),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  // Campos opcionais no primeiro momento
  referencePoint: z.string().optional(),
  birthDate: z.string().optional(),
  babyName: z.string().optional(),
  homeCollection: z.boolean().optional(),
});
2. Endpoints e Controladores
Você precisará registrar três rotas principais no arquivo donators.routes.ts
:
POST /donators
Descrição: Recebe o payload validado pelo Zod e inicia o cadastro.
UseCase (CreateDonatorUseCase):
Validação de Negócio: Verificar se o phone já existe no banco. Se sim, lançar um ConflictError("Telefone já cadastrado")
. Não use try/catch genérico
.
Ação: Inserir a doadora no banco definindo o campo status obrigatoriamente como PENDING_EXAMS (pois ela ainda não possui exames cadastrados e não pode doar leite cru)
.
GET /donators
Descrição: Rota para a listagem da tabela principal do frontend e suporte ao Dashboard.
Filtros (Query Params): O controller deve extrair e passar para o repository parâmetros dinâmicos como ?status=ACTIVE, ?pendingExams=true, ou ?city=Palmas
.
Padronização de Resposta (Crucial): O retorno DEVE seguir o padrão de paginação do sistema. Não retorne um array puro
:
GET /donators/:id
Descrição: Retorna o perfil completo (Visão 360º) para a tela de Detalhes da Doadora.
UseCase (GetDonatorProfileUseCase):
Buscar os dados básicos da doadora pelo ID. Se não existir, lançar NotFoundError("Doadora não encontrada")
.
Fazer um JOIN ou buscar as informações da tabela donator_clinical_histories (se existirem)
.
Buscar apenas o registro mais recente da tabela donator_exams e embutir no objeto de resposta
.
Retornar a DonatorEntity completa formatada para o frontend
.
3. Regras de Arquitetura e Tratamento de Erros
Lembre-se da regra de responsabilidade: A rota aciona o Zod, o Zod valida os tipos, a rota chama o Controller, o Controller repassa os dados para o UseCase e retorna a resposta
. Toda a lógica de verificação de duplicidade de telefone e regras de status deve estar dentro do UseCase, e não no Controller
.
Utilize sempre as classes de erro centralizadas em shared/errors (como BadRequestError, NotFoundError, ConflictError) para que o Error Handler Global consiga capturar e formatar a resposta adequadamente sem expor a stack trace
.


🔬 Task 3: Histórico Clínico e Segurança Sanitária (Exames)
Contexto para o Dev Backend: Após o cadastro rápido inicial (feito na Task 2), a doadora passa por uma triagem clínica e coleta de sangue. O laboratório do hospital preencherá essas informações depois. O foco desta task é salvar esses dados e automatizar a liberação ou bloqueio da doadora com base no resultado e validade desses exames.
1. Validação de Entrada (Zod Schemas)
Crie dois schemas separados para lidar com essas requisições.
updateClinicalHistorySchema (Permite atualização parcial/opcional):
registerDonatorExamsSchema (Tudo é obrigatório, pois é uma bateria de exames completa):
2. Endpoints e Controladores
Você precisará registrar estas duas rotas no arquivo donators.routes.ts:
PATCH /donators/:id/clinical-history
Descrição: Atualiza a ficha médica da doadora.
UseCase (UpdateDonatorClinicalHistoryUseCase):
Validar se a doadora existe pelo ID (lançar NotFoundError se não).
Chamar o método createOrUpdate no repositório. O Drizzle deve fazer um Upsert (inserir se não houver histórico atrelado ao donatorId, ou atualizar se já existir).
POST /donators/:id/exams
Descrição: Salva os exames e define se a doadora está liberada para doar.
UseCase (RegisterDonatorExamsUseCase):
Verificar se a doadora existe.
Matemática da Validade: O sistema deve calcular no momento da inserção: validUntil = examDate + 6 meses
.
Salvar o registro na tabela donator_exams.
Efeito Colateral (Mudança de Status): Avaliar os resultados enviados. Se TODOS os exames (vdrl, hbsag, ftaabs, hiv) vierem como NON_REACTIVE, chame o repositório e atualize o status da doadora na tabela principal para ACTIVE
.
Se QUALQUER exame for REACTIVE ou UNAVAILABLE, atualize o status da doadora para PENDING_EXAMS
.
3. Regras de Negócio Críticas (Cross-Module)
Atenção Dev: Esta task tem impacto direto no Módulo de Doações (entrada de leite cru). O bloqueio de coleta não acontece na listagem, acontece no recebimento físico do frasco.
No caso de uso CreateRawMilkCollectionUseCase (que será feito no módulo de doações), o desenvolvedor deverá fazer uma validação cruzada
.
Antes de aceitar um frasco de leite, o código buscará os exames da doadora. O fluxo lógico deve ser:
Isso impede totalmente que um frasco de leite cru entre no laboratório se os exames estiverem vencidos
.

📄 Task 4: Geração de Documento Oficial (Exportação PDF)
Contexto para o Dev Backend: O objetivo desta task é gerar um arquivo PDF pronto para impressão que seja uma réplica exata do documento físico "HOSPITAL E MATERNIDADE DONA REGINA - CADASTRO DE DOADORA"
. O sistema pegará os dados estruturados do banco de dados e os "carimbará" visualmente no formato do formulário.
1. Rota e Controlador (ExportDonatorController)
Endpoint: GET /donators/:id/export
Validação (Zod): Apenas validar se o id passado nos parâmetros da rota é um UUID válido.
Comportamento HTTP: O controlador NÃO deve retornar um JSON padrão. Ele precisa configurar os Headers da resposta para enviar um arquivo binário:
Content-Type: application/pdf
Content-Disposition: attachment; filename="cadastro-doadora-{nome}.pdf"
2. Regras de Negócio e Mapeamento (ExportDonatorDocumentUseCase)
A complexidade desta task não está na regra de negócio em si, mas no mapeamento preciso (Parser) dos dados do banco para o layout visual.
Passo A: Buscar Dados. O UseCase deve primeiramente reaproveitar a lógica do GetDonatorProfileUseCase para buscar a visão 360º da doadora (Dados Básicos + Histórico Clínico + Exames). Se a doadora não existir, lançar NotFoundError.
Passo B: Mapeamento de Campos (Data Parser). O desenvolvedor precisará injetar os dados nos campos exatos mapeados a partir do formulário físico. Exemplos do que deve ser mapeado:
Dados Pessoais: Nome, Data de Nascimento, Nome do Bebê, Profissão, Estado Civil, Endereço completo, e se a coleta será domiciliar ou exclusiva
.
Mapeamento de Enums para Checkboxes: Onde o formulário tem caixas de marcação ( ), o backend deve preencher com um ( X ) com base nos dados.
Exemplo: Se o prenatalType === 'PUBLIC', marcar ( X ) Rede Pública
. Se deliveryType === 'CESAREAN', marcar ( X ) Cesáreo
.
Histórico de Saúde: Transformar booleanos em marcações para Tabagismo, Etilismo, uso de Drogas/Medicamentos e Transfusão Sanguínea nos últimos 5 anos
.
Exames (Crucial): Mapear os resultados do banco para as caixas de VDRL, HbsAg, FTAabs e HIV. Por exemplo, se o VDRL for NON_REACTIVE no banco, marcar visualmente a opção ( X ) Não Reagente no PDF
. Incluir também os percentuais numéricos de Hb(%) e Ht(%)
.
3. Escolha Técnica (Sugestão de Implementação)
(Nota: A escolha da biblioteca técnica não está definida nos requisitos iniciais, mas recomendo a seguinte abordagem para o desenvolvedor)
Tecnologia: Para gerar o PDF de forma escalável no Node.js/Fastify, a melhor estratégia é criar um template HTML base que imite a ficha do hospital e utilizar uma biblioteca como Puppeteer ou pdf-creator-node (que usa o html-pdf por baixo dos panos) para compilar esse HTML em um Buffer PDF.
Estrutura de Arquivos:
Criar um diretório modules/donators/templates/.
Armazenar o arquivo donator-form.hbs ou .html contendo o layout estático do hospital com as variáveis de substituição (ex: {{nome}}, {{telefone}}).
