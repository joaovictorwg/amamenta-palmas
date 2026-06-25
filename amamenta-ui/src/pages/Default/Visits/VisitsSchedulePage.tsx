import { useMemo, useState } from "react";
import {
  BrButton,
  BrInput,
  BrSelect,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import "./VisitsSchedulePage.css";

type VisitStatus = "SCHEDULED" | "DONE" | "CANCELED" | "OVERDUE";
type VisitType = "DELIVERY" | "COLLECTION";

type Visit = {
  id: string;
  donorName: string;
  address: string;
  neighborhood: string;
  phone: string;
  scheduledAt: string;
  type: VisitType;
  status: VisitStatus;
  needsKit: boolean;
  lastCollectionAt?: string;
  lastVisitAt?: string;
  notes: string;
  history: string[];
};

type VisitRow = Visit & {
  donor: string;
  schedule: string;
  kit: string;
  actions: string;
};

const visits: Visit[] = [
  {
    id: "visit-001",
    donorName: "Maria Eduarda Alves",
    address: "Quadra 405 Norte, Alameda 12, Lote 08",
    neighborhood: "Plano Diretor Norte",
    phone: "(63) 98412-2301",
    scheduledAt: "2026-06-25T08:30:00",
    type: "DELIVERY",
    status: "SCHEDULED",
    needsKit: true,
    lastVisitAt: "2026-06-02",
    notes: "Entrega do kit inicial e reforco das orientacoes de higiene.",
    history: ["Cadastro concluido em 24/06", "Solicitou kit inicial para primeira ordenha"],
  },
  {
    id: "visit-002",
    donorName: "Ana Clara Moura",
    address: "Rua das Mangueiras, 114",
    neighborhood: "Aureny III",
    phone: "(63) 99220-1198",
    scheduledAt: "2026-06-25T10:00:00",
    type: "COLLECTION",
    status: "SCHEDULED",
    needsKit: false,
    lastCollectionAt: "2026-06-18",
    lastVisitAt: "2026-06-18",
    notes: "Coleta semanal. Confirmar volume armazenado antes do deslocamento.",
    history: ["Coleta realizada em 18/06", "Frequencia regular de 7 em 7 dias"],
  },
  {
    id: "visit-003",
    donorName: "Julliana Martins",
    address: "Av. Tocantins, 2200",
    neighborhood: "Taquaralto",
    phone: "(63) 98100-7744",
    scheduledAt: "2026-06-24T15:30:00",
    type: "COLLECTION",
    status: "OVERDUE",
    needsKit: true,
    lastCollectionAt: "2026-04-18",
    lastVisitAt: "2026-04-18",
    notes: "Mais de 2 meses sem coleta. Priorizar contato para avaliar continuidade.",
    history: ["Ultima coleta registrada em 18/04", "Tentativa de contato sem retorno em 20/06"],
  },
  {
    id: "visit-004",
    donorName: "Renata Sousa",
    address: "Qd. 706 Sul, Alameda 05",
    neighborhood: "Plano Diretor Sul",
    phone: "(63) 98540-3309",
    scheduledAt: "2026-06-23T09:00:00",
    type: "COLLECTION",
    status: "DONE",
    needsKit: false,
    lastCollectionAt: "2026-06-23",
    lastVisitAt: "2026-06-23",
    notes: "Coleta realizada sem intercorrencias.",
    history: ["Volume coletado registrado pela equipe", "Proxima visita sugerida para 30/06"],
  },
  {
    id: "visit-005",
    donorName: "Patricia Nunes",
    address: "Rua LO-09, 501",
    neighborhood: "Jardim Aureny I",
    phone: "(63) 99972-6410",
    scheduledAt: "2026-06-26T11:00:00",
    type: "DELIVERY",
    status: "CANCELED",
    needsKit: true,
    lastVisitAt: "2026-05-28",
    notes: "Doadora solicitou reagendamento por consulta pediatrica.",
    history: ["Entrega de kit pendente", "Reagendar preferencialmente pela manha"],
  },
];

const statusOptions = [
  { label: "Todos", value: "" },
  { label: "Agendada", value: "SCHEDULED" },
  { label: "Realizada", value: "DONE" },
  { label: "Cancelada", value: "CANCELED" },
  { label: "Em atraso", value: "OVERDUE" },
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

function formatDate(value?: string) {
  if (!value) return "Sem registro";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem registro";

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function getVisitTypeLabel(type: VisitType) {
  return type === "DELIVERY" ? "Entrega" : "Coleta";
}

function getStatusTag(status: VisitStatus) {
  if (status === "DONE") return <BrTag color="success" value="Realizada" />;
  if (status === "SCHEDULED") return <BrTag color="warning" value="Agendada" />;
  if (status === "CANCELED") return <BrTag color="danger" value="Cancelada" />;

  return <BrTag color="danger" value="Em atraso" />;
}

function getTypeTag(type: VisitType) {
  return <BrTag color={type === "DELIVERY" ? "info" : "success"} value={getVisitTypeLabel(type)} />;
}

export default function VisitsSchedulePage() {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(visits[0]);

  const filteredVisits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return visits.filter((visit) => {
      const matchesStatus = status ? visit.status === status : true;
      const matchesDate = date ? visit.scheduledAt.startsWith(date) : true;
      const searchableText = `${visit.donorName} ${visit.address} ${visit.neighborhood}`.toLowerCase();
      const matchesSearch = normalizedSearch ? searchableText.includes(normalizedSearch) : true;

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [date, search, status]);

  const rows = useMemo<VisitRow[]>(
    () =>
      filteredVisits.map((visit) => ({
        ...visit,
        donor: visit.donorName,
        schedule: visit.scheduledAt,
        kit: visit.needsKit ? "Sim" : "Não",
        actions: visit.id,
      })),
    [filteredVisits],
  );

  const summary = useMemo(
    () => ({
      today: visits.filter((visit) => visit.scheduledAt.startsWith("2026-06-25")).length,
      scheduled: visits.filter((visit) => visit.status === "SCHEDULED").length,
      kits: visits.filter((visit) => visit.needsKit).length,
      inactiveRisk: visits.filter((visit) => visit.id === "visit-003").length,
    }),
    [],
  );

  const columns = useMemo<BrTableColumn<VisitRow>[]>(
    () => [
      {
        key: "donor",
        title: "Doadora",
        width: "22%",
        boldHeading: true,
      },
      {
        key: "address",
        title: "Endereco",
        width: "26%",
        render: (_value, row) => (
          <span className="visits-schedule__address">
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
          <div className="visits-schedule__actions">
            <BrButton
              aria-label={`Ver detalhes da visita de ${row.donorName}`}
              circle
              icon="eye"
              onClick={() => setSelectedVisit(row)}
              size="small"
            />
            <BrButton aria-label={`Alterar visita de ${row.donorName}`} circle icon="edit" size="small" />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <section className="visits-schedule">
      <header className="visits-schedule__header">
        <div>
          <h1 className="visits-schedule__title">Agenda de Visitas</h1>
          <p className="visits-schedule__description">
            Coordenacao de entregas de kits, coletas domiciliares e acompanhamentos das doadoras.
          </p>
        </div>

        <BrButton icon="plus" primary>
          Nova visita
        </BrButton>
      </header>

      <div className="visits-schedule__summary" aria-label="Resumo da agenda">
        <article className="visits-schedule__summary-card visits-schedule__summary-card--primary">
          <span>Visitas hoje</span>
          <strong>{summary.today}</strong>
          <small>atalho para o painel geral</small>
        </article>
        <article className="visits-schedule__summary-card">
          <span>Agendadas</span>
          <strong>{summary.scheduled}</strong>
          <small>pendentes de confirmacao</small>
        </article>
        <article className="visits-schedule__summary-card visits-schedule__summary-card--kit">
          <span>Kits pendentes</span>
          <strong>{summary.kits}</strong>
          <small>prioridade de contato</small>
        </article>
        <article className="visits-schedule__summary-card visits-schedule__summary-card--risk">
          <span>Inatividade</span>
          <strong>{summary.inactiveRisk}</strong>
          <small>mais de 2 meses sem coleta</small>
        </article>
      </div>

      <div className="visits-schedule__filters">
        <BrInput
          label="Buscar"
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Nome da doadora ou endereco"
          value={search}
        />
        <BrSelect
          label="Status"
          onChange={(value) => setStatus(String(value))}
          options={statusOptions}
          placeholder="Todos"
          value={status}
        />
        <BrInput
          label="Data"
          onChange={(event) => setDate(event.currentTarget.value)}
          type="date"
          value={date}
        />
        <div className="visits-schedule__filter-actions">
          <BrButton
            onClick={() => {
              setSearch("");
              setStatus("");
              setDate("");
            }}
            secondary
          >
            Limpar
          </BrButton>
        </div>
      </div>

      <div className="visits-schedule__content">
        <div className="visits-schedule__table">
          <BrTable
            columns={columns}
            data={rows}
            density="small"
            emptyContent="Nenhuma visita encontrada."
            title="Painel de agenda"
          />
        </div>

        <VisitDetails visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
      </div>
    </section>
  );
}

function VisitDetails({ visit, onClose }: { visit: Visit | null; onClose: () => void }) {
  if (!visit) {
    return (
      <aside className="visits-schedule__drawer visits-schedule__drawer--empty">
        <span>Selecione uma visita para ver detalhes.</span>
      </aside>
    );
  }

  return (
    <aside className="visits-schedule__drawer" aria-label="Detalhes da visita">
      <div className="visits-schedule__drawer-header">
        <div>
          <span className="visits-schedule__eyebrow">Detalhes da visita</span>
          <h2>{visit.donorName}</h2>
        </div>
        <BrButton aria-label="Fechar detalhes" circle icon="times" onClick={onClose} size="small" />
      </div>

      <div className="visits-schedule__drawer-tags">
        {getStatusTag(visit.status)}
        {getTypeTag(visit.type)}
        {visit.needsKit && <BrTag color="warning" value="Kit necessario" />}
      </div>

      <div className="visits-schedule__profile">
        <p>
          <strong>Endereco:</strong> {visit.address}, {visit.neighborhood}
        </p>
        <p>
          <strong>Telefone:</strong> {visit.phone}
        </p>
        <p>
          <strong>Agendamento:</strong> {formatDateTime(visit.scheduledAt)}
        </p>
        <p>
          <strong>Ultima visita:</strong> {formatDate(visit.lastVisitAt)}
        </p>
        <p>
          <strong>Ultima coleta:</strong> {formatDate(visit.lastCollectionAt)}
        </p>
      </div>

      <div className="visits-schedule__status-panel">
        <span>Status da visita</span>
        <div>
          <button className={visit.status === "SCHEDULED" ? "active" : ""} type="button">
            Agendada
          </button>
          <button className={visit.status === "DONE" ? "active" : ""} type="button">
            Realizada
          </button>
          <button className={visit.status === "CANCELED" ? "active" : ""} type="button">
            Cancelada
          </button>
        </div>
      </div>

      <div className="visits-schedule__timeline">
        <h3>Historico de interacoes</h3>
        {visit.history.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>

      <label className="visits-schedule__notes">
        Observacoes da equipe
        <textarea defaultValue={visit.notes} rows={5} />
      </label>

      <div className="visits-schedule__drawer-actions">
        <BrButton secondary>Alterar data</BrButton>
        <BrButton primary>Registrar retorno</BrButton>
      </div>
    </aside>
  );
}
