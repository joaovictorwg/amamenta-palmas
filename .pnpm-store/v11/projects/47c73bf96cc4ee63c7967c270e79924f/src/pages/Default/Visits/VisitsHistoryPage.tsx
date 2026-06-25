import { useMemo, useState } from "react";
import {
  BrButton,
  BrInput,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import "./VisitsHistoryPage.css";

type VisitStatus = "SCHEDULED" | "DONE" | "CANCELED" | "OVERDUE";
type VisitType = "DELIVERY" | "COLLECTION";
type PeriodFilter = "ALL" | "TODAY" | "WEEK" | "MONTH";

type VisitHistory = {
  id: string;
  donorName: string;
  address: string;
  neighborhood: string;
  phone: string;
  visitedAt: string;
  type: VisitType;
  status: VisitStatus;
  needsKit: boolean;
  clinicalHistory: string;
  collectedVolumeMl?: number;
  notes: string;
  timeline: {
    date: string;
    title: string;
    description: string;
  }[];
};

type VisitHistoryRow = VisitHistory & {
  donor: string;
  schedule: string;
  kit: string;
  actions: string;
};

const historyVisits: VisitHistory[] = [
  {
    id: "history-001",
    donorName: "Renata Sousa",
    address: "Qd. 706 Sul, Alameda 05",
    neighborhood: "Plano Diretor Sul",
    phone: "(63) 98540-3309",
    visitedAt: "2026-06-23T09:00:00",
    type: "COLLECTION",
    status: "DONE",
    needsKit: false,
    clinicalHistory: "Puerpera sem intercorrencias recentes. Exames liberados para doacao.",
    collectedVolumeMl: 420,
    notes: "Coleta realizada sem intercorrencias. Frascos estavam identificados corretamente.",
    timeline: [
      {
        date: "23/06",
        title: "Coleta realizada",
        description: "Equipe retirou 420 ml de leite cru armazenado sob refrigeracao.",
      },
      {
        date: "16/06",
        title: "Contato telefonico",
        description: "Doadora confirmou disponibilidade para visita semanal.",
      },
      {
        date: "09/06",
        title: "Orientacao",
        description: "Reforcada higienizacao das maos e identificacao dos frascos.",
      },
    ],
  },
  {
    id: "history-002",
    donorName: "Maria Eduarda Alves",
    address: "Quadra 405 Norte, Alameda 12, Lote 08",
    neighborhood: "Plano Diretor Norte",
    phone: "(63) 98412-2301",
    visitedAt: "2026-06-25T08:30:00",
    type: "DELIVERY",
    status: "SCHEDULED",
    needsKit: true,
    clinicalHistory: "Cadastro recente. Aguardando primeira orientacao domiciliar.",
    notes: "Entrega do kit inicial e orientacoes de higiene previstas para o periodo da manha.",
    timeline: [
      {
        date: "25/06",
        title: "Visita agendada",
        description: "Entrega de kit inicial programada para o dia seguinte ao pedido.",
      },
      {
        date: "24/06",
        title: "Pedido de kit",
        description: "Doadora sinalizou interesse em iniciar armazenamento domiciliar.",
      },
    ],
  },
  {
    id: "history-003",
    donorName: "Julliana Martins",
    address: "Av. Tocantins, 2200",
    neighborhood: "Taquaralto",
    phone: "(63) 98100-7744",
    visitedAt: "2026-06-24T15:30:00",
    type: "COLLECTION",
    status: "OVERDUE",
    needsKit: true,
    clinicalHistory: "Doadora ativa, mas com longo intervalo sem coleta registrada.",
    notes: "Contato pendente. Mais de 2 meses sem coleta, avaliar continuidade do cadastro.",
    timeline: [
      {
        date: "24/06",
        title: "Visita em atraso",
        description: "Equipe nao conseguiu confirmar disponibilidade da doadora.",
      },
      {
        date: "20/06",
        title: "Tentativa de contato",
        description: "Ligacao sem retorno. Manter prioridade na agenda.",
      },
      {
        date: "18/04",
        title: "Ultima coleta",
        description: "Ultima retirada registrada no historico da doadora.",
      },
    ],
  },
  {
    id: "history-004",
    donorName: "Patricia Nunes",
    address: "Rua LO-09, 501",
    neighborhood: "Jardim Aureny I",
    phone: "(63) 99972-6410",
    visitedAt: "2026-06-21T11:00:00",
    type: "DELIVERY",
    status: "CANCELED",
    needsKit: true,
    clinicalHistory: "Sem restricoes clinicas registradas. Necessita reagendamento.",
    notes: "Cancelamento solicitado pela doadora por consulta pediatrica.",
    timeline: [
      {
        date: "21/06",
        title: "Visita cancelada",
        description: "Doadora pediu remarcacao para outro periodo da semana.",
      },
      {
        date: "19/06",
        title: "Entrega prevista",
        description: "Kit separado pela equipe para entrega domiciliar.",
      },
    ],
  },
  {
    id: "history-005",
    donorName: "Ana Clara Moura",
    address: "Rua das Mangueiras, 114",
    neighborhood: "Aureny III",
    phone: "(63) 99220-1198",
    visitedAt: "2026-06-18T10:00:00",
    type: "COLLECTION",
    status: "DONE",
    needsKit: false,
    clinicalHistory: "Doadora com frequencia regular e boa adesao as orientacoes.",
    collectedVolumeMl: 360,
    notes: "Coleta semanal dentro do ciclo previsto de 7 dias.",
    timeline: [
      {
        date: "18/06",
        title: "Coleta realizada",
        description: "Retirados 360 ml dentro do prazo de validade do leite cru.",
      },
      {
        date: "11/06",
        title: "Coleta anterior",
        description: "Mantido ciclo semanal de acompanhamento.",
      },
    ],
  },
];

const statusTabs: { key: VisitStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todas" },
  { key: "DONE", label: "Realizadas" },
  { key: "SCHEDULED", label: "Agendadas" },
  { key: "OVERDUE", label: "Em atraso" },
  { key: "CANCELED", label: "Canceladas" },
];

const periodTabs: { key: PeriodFilter; label: string }[] = [
  { key: "ALL", label: "Todo periodo" },
  { key: "TODAY", label: "Hoje" },
  { key: "WEEK", label: "Semana" },
  { key: "MONTH", label: "Mes" },
];

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusTag(status: VisitStatus) {
  if (status === "DONE") return <BrTag color="success" value="Realizada" />;
  if (status === "SCHEDULED") return <BrTag color="warning" value="Agendada" />;
  if (status === "CANCELED") return <BrTag color="danger" value="Cancelada" />;

  return <BrTag color="danger" value="Em atraso" />;
}

function getTypeTag(type: VisitType) {
  return <BrTag color={type === "DELIVERY" ? "info" : "success"} value={type === "DELIVERY" ? "Entrega" : "Coleta"} />;
}

function matchesPeriod(visitedAt: string, period: PeriodFilter) {
  if (period === "ALL") return true;
  if (period === "TODAY") return visitedAt.startsWith("2026-06-25");
  if (period === "WEEK") return visitedAt >= "2026-06-18";
  return visitedAt.startsWith("2026-06");
}

export default function VisitsHistoryPage() {
  const [status, setStatus] = useState<VisitStatus | "ALL">("ALL");
  const [period, setPeriod] = useState<PeriodFilter>("MONTH");
  const [search, setSearch] = useState("");
  const [selectedVisit, setSelectedVisit] = useState<VisitHistory | null>(historyVisits[0]);

  const filteredVisits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return historyVisits.filter((visit) => {
      const matchesStatus = status === "ALL" ? true : visit.status === status;
      const searchableText = `${visit.donorName} ${visit.address} ${visit.neighborhood}`.toLowerCase();
      const matchesSearch = normalizedSearch ? searchableText.includes(normalizedSearch) : true;

      return matchesStatus && matchesPeriod(visit.visitedAt, period) && matchesSearch;
    });
  }, [period, search, status]);

  const rows = useMemo<VisitHistoryRow[]>(
    () =>
      filteredVisits.map((visit) => ({
        ...visit,
        donor: visit.donorName,
        schedule: visit.visitedAt,
        kit: visit.needsKit ? "Sim" : "Não",
        actions: visit.id,
      })),
    [filteredVisits],
  );

  const columns = useMemo<BrTableColumn<VisitHistoryRow>[]>(
    () => [
      {
        key: "donor",
        title: "Doadora",
        width: "20%",
        boldHeading: true,
      },
      {
        key: "address",
        title: "Endereco",
        width: "26%",
        render: (_value, row) => (
          <span className="visits-history__address">
            {row.address}
            <small>{row.neighborhood}</small>
          </span>
        ),
      },
      {
        key: "phone",
        title: "Telefone",
        width: "13%",
      },
      {
        key: "schedule",
        title: "Data/Hora",
        width: "12%",
        render: (value) => formatDateTime(String(value)),
      },
      {
        key: "type",
        title: "Tipo",
        width: "10%",
        render: (value) => getTypeTag(value as VisitType),
      },
      {
        key: "status",
        title: "Status",
        width: "10%",
        render: (value) => getStatusTag(value as VisitStatus),
      },
      {
        key: "kit",
        title: "Kit",
        width: "7%",
        render: (_value, row) =>
          row.needsKit ? <BrTag color="warning" value="Entregar" /> : <BrTag color="info" value="Não" />,
      },
      {
        key: "actions",
        title: "Acoes",
        align: "right",
        width: "10%",
        render: (_value, row) => (
          <div className="visits-history__actions">
            <BrButton
              aria-label={`Ver detalhes da visita de ${row.donorName}`}
              circle
              icon="eye"
              onClick={() => setSelectedVisit(row)}
              size="small"
            />
            <BrButton aria-label={`Editar visita de ${row.donorName}`} circle icon="edit" size="small" />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <section className="visits-history">
      <header className="visits-history__header">
        <div>
          <h1 className="visits-history__title">Historico de Visitas</h1>
          <p className="visits-history__description">
            Consulta rapida de visitas realizadas, agendadas, canceladas e em atraso, com historico da doadora no painel lateral.
          </p>
        </div>

        <BrButton icon="plus" primary>
          Nova visita
        </BrButton>
      </header>

      <div className="visits-history__toolbar">
        <BrInput
          label="Buscar"
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Nome da doadora ou endereco"
          value={search}
        />

        <div className="visits-history__quick-filters" aria-label="Filtro por status">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              className={status === tab.key ? "active" : ""}
              onClick={() => setStatus(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="visits-history__quick-filters" aria-label="Filtro por periodo">
          {periodTabs.map((tab) => (
            <button
              key={tab.key}
              className={period === tab.key ? "active" : ""}
              onClick={() => setPeriod(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="visits-history__content">
        <div className="visits-history__table">
          <BrTable
            columns={columns}
            data={rows}
            density="small"
            emptyContent="Nenhuma visita encontrada."
            title="Lista de visitas"
          />
        </div>

        <VisitHistoryDrawer visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
      </div>
    </section>
  );
}

function VisitHistoryDrawer({ visit, onClose }: { visit: VisitHistory | null; onClose: () => void }) {
  if (!visit) {
    return (
      <aside className="visits-history__drawer visits-history__drawer--empty">
        <span>Selecione uma visita para consultar o historico.</span>
      </aside>
    );
  }

  return (
    <aside className="visits-history__drawer" aria-label="Detalhes historicos da visita">
      <div className="visits-history__drawer-header">
        <div>
          <span className="visits-history__eyebrow">Detalhes da visita</span>
          <h2>{visit.donorName}</h2>
        </div>
        <BrButton aria-label="Fechar detalhes" circle icon="times" onClick={onClose} size="small" />
      </div>

      <div className="visits-history__drawer-tags">
        {getStatusTag(visit.status)}
        {getTypeTag(visit.type)}
        {visit.needsKit && <BrTag color="warning" value="Kit necessario" />}
      </div>

      <div className="visits-history__details-grid">
        <p>
          <strong>Endereco:</strong> {visit.address}, {visit.neighborhood}
        </p>
        <p>
          <strong>Telefone:</strong> {visit.phone}
        </p>
        <p>
          <strong>Data/Hora:</strong> {formatDateTime(visit.visitedAt)}
        </p>
        <p>
          <strong>Volume coletado:</strong> {visit.collectedVolumeMl ? `${visit.collectedVolumeMl} ml` : "Nao se aplica"}
        </p>
      </div>

      <section className="visits-history__clinical">
        <h3>Historico clinico</h3>
        <p>{visit.clinicalHistory}</p>
      </section>

      <section className="visits-history__timeline">
        <h3>Timeline de interacoes</h3>
        {visit.timeline.map((item) => (
          <article key={`${item.date}-${item.title}`}>
            <span>{item.date}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </section>

      <label className="visits-history__notes">
        Observacoes e intercorrencias
        <textarea defaultValue={visit.notes} rows={5} />
      </label>

      <div className="visits-history__drawer-actions">
        <BrButton secondary>Editar visita</BrButton>
        <BrButton primary>Nova visita</BrButton>
      </div>
    </aside>
  );
}
