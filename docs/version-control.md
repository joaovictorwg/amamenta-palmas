Fluxo de realização de tasks:

1- cria branch a partir da develop seguindo o padrão:
[feature/bugfix/hotfix/chore]/[numero da task]-nome-descritivo-da-task
ex: feature/1-create-donator-crud-rest-api

2 - Commite suas alterações no seguitne padrão:
[feat/fix]: descrição das suas alterações

ex: `feat: implement donator module with CRUD operations

- Create donator schema and database table
- Implement create, read, update, and delete use cases
- Add controllers for handling HTTP requests
- Set up routes for donator endpoints
- Introduce error handling with custom error classes
- Add unit and integration tests for donator functionality
- Update documentation to reflect new module structure and usage`

3 - Atualize a versão do projeto no package.json:
versão base 1.0.0
se bugfix -> 1.0.1
se feature -> 1.1.0
se release -> 2.0.0

4 - rode um pnpm install para garantir que seu package.json e pnpm-lock.json estejam atualizados

5 - commite as atualizações de versão

6 - faça o push da sua branch

7 - abra uma pull request no github fazendo o merge da sua branch na develop 




chat to desenvolvendo um sistema pro banco de leite da minha cidade, eles tem uma necessidade de gerenciamento e acompanhamento do leite doado. Eles tem o seguinte fluxo: mãe cadastra como doadora, mãe coleta doação, mãe marca visita para coleta do leite em no maximo 7 dias para que haja tempo habil do preparo do leite, hospital visita a mãe e coleta o leite, o leite cru com validade de 15 dias a partir do momento da coleta então é analisado em busca de sujidades, se tive sujidades descarta, se não entra na fila para pasteurização, tem um certo gargalo, a maquina para pasteurização é pequena então poucos litros por vez, quando tem espaço o leite é pasteurizado, agora ele dura 6 meses e fica disponivel para ser ingerido. Esse é o fluxo completo. Eles fazem tudo manualmente e não salvam as informações em um lugar centralizado. O sistema que estamos fazendo é de gerenciamento de doadoras, doações e visitas. QUero sua ajuda para documentar em esse fluxo e também me ajudar a planejar a entidade doações que existira no banco de dados e no back end com todos os campos que precisa ter, ou se cria duas entidades separadas um leite cru e um leite pasteurizado, pode ajudar? 


Para solucionar o problema de gargalo e garantir a rastreabilidade exigida pela Vigilância Sanitária (Anvisa), o ideal é separar em duas entidades ligadas por relacionamento, em vez de tentar colocar tudo em uma única tabela "Doações".
Como o leite cru passa por análises, descartes parciais e fracionamento para encher a máquina de pasteurização, uma única linha no banco de dados ficaria confusa e cheia de campos nulos.
Abaixo está a documentação do fluxo atual e a modelagem detalhada do banco de dados.
------------------------------
## 📋 1. Mapeamento e Documentação do Fluxo (As-Is)

   1. Cadastro: Mãe se cadastra $\rightarrow$ Passa por triagem (exames) $\rightarrow$ Status: Ativa.
   2. Coleta Domiciliar: Mãe retira o leite em casa $\rightarrow$ Guarda no congelador $\rightarrow$ Dispara cronômetro de 15 dias de validade (Cru).
   3. Agendamento: Mãe solicita visita em até 7 dias pós-coleta $\rightarrow$ Sistema gera rota de coleta.
   4. Recolhimento: Equipe do hospital busca o leite congelado $\rightarrow$ Transporta em caixa térmica com termômetro.
   5. Recepção e Triagem (Gargalo 1): Leite chega ao BLH $\rightarrow$ Inspeção visual (sujidade/cor/cheiro) e acidez.
   * Falhou: Status mudado para Descartado (registra-se o motivo).
      * Aprovou: Status mudado para Aguardando Pasteurização.
   6. Processamento (Gargalo 2): Volumes de potes de leite cru aprovados são combinados (ou fracionados) para atingir a capacidade exata da máquina $\rightarrow$ Processo de Pasteurização.
   7. Estocagem: Leite pasteurizado ganha nova validade (6 meses) $\rightarrow$ Status: Disponível para Consumo.

------------------------------
## 🗄️ 2. Arquitetura do Banco de Dados (Entidades)
Para resolver o gargalo da máquina pequena, criaremos a entidade ColetaLeiteCru (o que vem da casa da mãe) e a entidade LotePasteurizacao (o que entra na máquina).
## Entidade 1: ColetaLeiteCru
Representa cada frasco individual que o hospital recolhe na casa da mãe.

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID / Int | Identificador único do frasco. |
| doadora_id | Foreign Key | Relacionamento com a tabela Doadoras. |
| visita_id | Foreign Key | Relacionamento com a tabela VisitasColeta. |
| data_coleta_mae | DateTime | Preenchido pela mãe. Inicia os 15 dias de validade cru. |
| data_recepcao_blh | DateTime | Quando o hospital bipou/entrou com o leite no sistema. |
| volume_ml | Decimal/Int | Quantidade exata em mililitros medida no hospital. |
| status | Enum | COLETADO, REPROVADO_TRIAGEM, AGUARDANDO_PASTEURIZACAO, PASTEURIZADO. |
| motivo_descarte | String (Null) | Preenchido se o status for REPROVADO_TRIAGEM (ex: fios de cabelo, azedo). |
| lote_pasteurizacao_id | FK (Null) | Vinculará este frasco ao lote específico da máquina quando for processado. |

## Entidade 2: LotePasteurizacao
Representa uma "rodada" da máquina de pasteurização. Ela vai agrupar várias ColetaLeiteCru até atingir a capacidade da máquina.

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID / Int | Identificador do lote pasteurizado (geralmente vai na etiqueta do frasco final). |
| data_pasteurizacao | DateTime | Data do processo. Inicia os 6 meses de validade. |
| data_validade | Date | Calculada automaticamente (data_pasteurizacao + 6 meses). |
| volume_total_ml | Decimal/Int | Soma dos volumes de todas as coletas cruas usadas neste lote. |
| responsavel_tecnico | String/FK | Usuário do hospital que operou a máquina. |
| status_qualidade | Enum | EM_ANALISE, APROVADO_CONSUMO, REPROVADO_CONTAMINACAO. |

------------------------------
## 💡 Por que essa estrutura resolve o problema deles?

* Controle de Estoque Real: O painel do hospital mostrará exatamente: "Você tem 5.200ml de leite cru aguardando na fila". Como a máquina deles é pequena (ex: cabe 2 litros), o funcionário seleciona no sistema 4 coletas de 500ml, clica em "Criar Lote" e o sistema muda o status delas juntas.
* Rastreabilidade Total: Se um bebê passar mal com o leite do Lote #99, o hospital consegue rastrear no sistema quais foram as 3 ou 4 mães (ColetaLeiteCru) que geraram aquele lote específico.

Gostou dessa estrutura de tabelas? Se quiser, posso ajudar a desenhar as rotas do Back-End (API Endpoints) para esse fluxo ou estruturar a tabela de Visitas de Coleta. O que prefere detalhar agora?

Compreendo perfeitamente o seu ponto. Para a Vigilância Sanitária e para auditorias médicas hospitalares, a rastreabilidade precisa ser individual do início ao fim. Se a mãe doou o "Frasco A", o hospital precisa saber exatamente para qual receptor (bebê) o "Frasco A" foi, mesmo após passar pela máquina.
O grande desafio técnico do Banco de Leite é que a pasteurização mistura leites de doadoras diferentes em um mesmo recipiente da máquina para otimizar o volume (processo chamado de pool de leite).
Para manter a métrica e a rastreabilidade individual sem perder a relação com a máquina, a melhor prática de modelagem é criar três entidades. Uma para o Leite Cru, outra para o Lote da Máquina, e uma terceira para o Frasco Pasteurizado Final (que mantém o vínculo com o leite original).
Aqui está a estrutura corrigida para garantir 100% de rastreabilidade individual e métricas de ponta a ponta:
------------------------------
## 🗄️ Modelagem de Dados com Rastreabilidade Individual

[Doadora] ──(1:N)──> [ColetaLeiteCru] ──(N:M via Tabela Pivô)──> [LotePasteurizacao] ──(1:N)──> [FrascoFinal]

## 1. Entidade: ColetaLeiteCru (A entrada individual)
Mapeia o frasco exatamente como saiu da casa da mãe. Nada se perde aqui.

* id (UUID / PK)
* doadora_id (FK)
* data_coleta_mae (DateTime) -> Gera alerta se passar de 7 dias para buscar.
* data_recepcao_blh (DateTime) -> Define o limite de 15 dias para pasteurizar.
* volume_inicial_ml (Int) -> Volume bruto medido na recepção.
* status_triagem (Enum): AGUARDANDO_TRIAGEM, APROVADO, REPROVADO.
* motivo_descarte (String / Null) -> Para métricas de perda de leite cru.

## 2. Entidade: LotePasteurizacao (O gargalo / processamento)
Representa a operação da máquina pequena. Ela precisa existir para controlar a eficiência do equipamento e os testes microbiológicos do lote.

* id (UUID / PK)
* data_pasteurizacao (DateTime) -> Validade de 6 meses começa aqui.
* temperatura_atingida (Decimal) -> Controle de qualidade exigido por lei.
* tempo_segundos (Int)
* status_microbiologico (Enum): EM_ANALISE, LIBERADO, REPROVADO.

## 3. Entidade: ComposicaoLote (A tabela pivô da rastreabilidade)
Como a máquina mistura frascos, esta tabela resolve o relacionamento Muitos-para-Muitos. Ela diz exatamente quais leites crus entraram em qual lote da máquina e quanto de volume cada um contribuiu.

* id (UUID / PK)
* lote_pasteurizacao_id (FK)
* coleta_leite_cru_id (FK)
* volume_utilizado_ml (Int) -> Se um frasco de 500ml foi dividido, você sabe quanto entrou aqui.

## 4. Entidade: FrascoPasteurizado (A saída individualizada)
Após sair da máquina, o leite é envasado novamente em frascos menores para serem distribuídos aos bebês da UTI. Esta entidade garante que você saiba onde o produto final está.

* id (UUID / PK) -> Gera o QR Code / Código de Barras que vai colado no frasco que o bebê mama.
* lote_pasteurizacao_id (FK)
* volume_final_ml (Int)
* data_validade (Date) -> Calculado (Data da Pasteurização + 6 meses).
* status_estoque (Enum): DISPONIVEL, DISTRIBUIDO_UTI, VENCIDO, DESCARTADO_REANALISE.
* receptor_id (String/FK / Null) -> Identificação (ou prontuário) do bebê que consumiu.

------------------------------
## 📊 Quais métricas essa estrutura permite extrair?
Com esse desenho, o seu sistema conseguirá gerar relatórios cruciais para a diretoria do hospital, como:

* Taxa de Descarte na Triagem: "Perdemos X% de leite cru por sujidade este mês. A doadora Y é a que mais gera descartes (necessita de reorientação de higiene)".
* Tempo Médio de Gargalo: Quanto tempo o leite cru fica parado esperando vaga na máquina (data_pasteurizacao menos data_recepcao_blh).
* Aproveitamento de Volume: Comparar a soma de volume_inicial_ml do leite cru com o volume_final_ml dos frascos pós-pasteurização para ver a perda por evaporação ou manipulação.
* Rastreabilidade Reversa (Recall): Se o teste de laboratório do Lote 50 der positivo para uma bactéria após 3 dias, o sistema diz na hora: "Bloqueie os frascos finais X, Y e Z no estoque e verifique as doadoras Ana e Carlos, que originaram este leite".

Se fizermos dessa forma, resolve a necessidade de rastreamento total da sua equipe? Para avançarmos, o que acha de desenharmos os endpoints do Back-End (como os controllers vão receber esses dados) ou prefere focar nas regras de negócio para as visitas de coleta domiciliar?

Essa reunião é o momento mais importante do projeto. Para projetar um software que resolva a vida deles e não gere retrabalho, você precisa entender as regras de negócio reais, as exigências legais (RDC 171 da Anvisa) e as limitações físicas do hospital.
Aqui está um roteiro estruturado com as perguntas essenciais que você deve fazer à diretora, divididas por blocos de interesse técnico:
## 🔬 1. Sobre a Identificação e Rastreabilidade do Frasco
Atualmente, eles devem usar etiquetas de papel escritas à mão. Você precisa saber o que obrigatoriamente deve constar nelas.

* Quais dados são anotados manualmente no frasco hoje? (Ex: Nome da doadora, data da coleta, hora, volume, acidez Dornic, tipo de leite?).
* Existe alguma numeração ou código de barras sequencial hoje? Como eles garantem que o frasco "X" pertence à mãe "Y" se as etiquetas molharem no congelador?
* O leite é classificado por tipo? (Por lei, o banco de leite costuma classificar o leite por acidez, calorias e se é colostro, leite de transição ou leite maduro, pois bebês diferentes precisam de leites diferentes. O sistema precisará dessa propriedade).

## ⚙️ 2. Sobre a Máquina de Pasteurização e o Processo de "Pool"
Isso vai validar se a modelagem de "Lotes" que criamos atende perfeitamente ao gargalo real.

* Qual é a capacidade exata da máquina de pasteurização? (Quantos frascos ou quantos litros ela comporta por ciclo?).
* Vocês misturam o leite de doadoras diferentes em um mesmo lote (Pool de Leite)?
* Se sim: Existe um limite de quantas doadoras podem ser misturadas no mesmo lote?
   * Se não: A máquina roda mesmo se o frasco de uma única mãe não encher a capacidade total?
* Quais dados de controle da máquina precisam ser salvos no sistema? (Ex: Temperatura de aquecimento, tempo de resfriamento, número do ciclo).
* Quais testes laboratoriais são feitos pós-pasteurização? (Geralmente fazem teste de Coliformes Totais). Quanto tempo demora o resultado e onde o leite fica esperando esse laudo?

## 📦 3. Sobre a Capacidade de Armazenamento e Estoque
Esses dados servem para você criar alertas visuais (dashboards) no sistema, como "Estoque Crítico".

* Qual é a capacidade máxima de armazenamento físico dos freezers de Leite Cru e de Leite Pasteurizado?
* Qual é a média de frascos que vocês recebem por semana e qual a média que a UTI Neonatal consome? (Isso te ajuda a planejar a paginação e performance do banco de dados).
* Como funciona o descarte por validade hoje? Alguém olha frasco por frasco para ver se venceu ou existe uma planilha?

## 🚗 4. Sobre o Fluxo de Visitas e Coleta Domiciliar
Essencial para desenhar o módulo de agendamento e rotas do sistema.

* Como a mãe avisa que o leite está pronto para ser coletado? (Telefone, WhatsApp, aplicativo?).
* Como é planejada a rota do motorista do hospital? Ele atende por bairros, por dias da semana fixos ou por ordem de pedido?
* Quais dados o motorista precisa registrar no momento em que pega o leite na casa da mãe? (Ex: Temperatura da caixa térmica na saída/chegada, quantidade de frascos recolhidos).

------------------------------
## 💡 Dica de Ouro para a Reunião
Leve o desenho do fluxo que estruturamos na resposta anterior impresso ou no tablet. Mostre para ela e diga: "Nós mapeamos que o fluxo funciona assim [explique o fluxo]. Isso está correto ou na prática muda alguma coisa?". Isso vai gerar extrema confiança e fará a diretora lembrar de detalhes que ela esqueceria de te contar espontaneamente.
Para te ajudar a consolidar as respostas após a reunião, qual você acha que será o maior desafio deles no dia a dia: a organização das rotas de coleta ou o controle de validade do estoque?

