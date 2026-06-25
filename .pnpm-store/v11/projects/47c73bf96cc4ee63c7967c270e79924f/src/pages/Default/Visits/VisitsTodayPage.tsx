import { useMemo, useState } from "react";
import {
  BrButton,
  BrInput,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import "./VisitsTodayPage.css";

type VisitStatus = "SCHEDULED" | "DONE" | "OVERDUE";
type VisitType = "DELIVERY" | "COLLECTION";

type TodayVisit = {
  id: string;
  donorName: string;
  address: string;
  neighborhood: string;
  phone: string;
  scheduledAt: string;
  type: VisitType;
  status: VisitStatus;
  needsKit: boolean;
  priority: "HIGH" | "NORMAL";
  notes: string;
};

type TodayVisitRow = TodayVisit & {
  schedule: string;
  kit: string;
  actions: string;
};

const todayVisits: TodayVisit[] = [
  {
    id: "today-001",
    donorName: "Maria Eduarda Alves",
    address: "Quadra 405 Norte, Alameda 12, Lote 08",
    neighborhood: "Plano Diretor Norte",
    phone: "(63) 98412-2301",
    scheduledAt: "2026-06-25T08:30:00",
    type: "DELIVERY",
    status: "SCHEDULED",
    needsKit: true,
    priority: "HIGH",
    notes: "Entrega de kit inicial. Priorizar periodo da manha.",
  },
  {
    id: "today-002",
    donorName: "Ana Clara Moura",
    address: "Rua das Mangueiras, 114",
    neighborhood: "Aureny III",
    phone: "(63) 99220-1198",
    scheduledAt: "2026-06-25T10:00:00",
    type: "COLLECTION",
    status: "SCHEDULED",
    needsKit: false,
    priority: "NORMAL",
    notes: "Coleta semanal dentro do ciclo previsto.",
  },
  {
    id: "today-003",
    donorName: "Julliana Martins",
    address: "Av. Tocantins, 2200",
    neighborhood: "Taquaralto",
    phone: "(63) 98100-7744",
    scheduledAt: "2026-06-25T11:30:00",
    type: "COLLECTION",
    status: "OVERDUE",
    needsKit: true,
    priority: "HIGH",
    notes: "Mais de 2 meses sem coleta. Confirmar continuidade.",
  },
  {
    id: "today-004",
    donorName: "Renata Sousa",
    address: "Qd. 706 Sul, Alameda 05",
    neighborhood: "Plano Diretor Sul",
    phone: "(63) 98540-3309",
    scheduledAt: "2026-06-25T14:00:00",
    type: "COLLECTION",
    status: "DONE",
    needsKit: false,
    priority: "NORMAL",
    notes: "Visita finalizada sem intercorrencias.",
  },
];

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusTag(status: VisitStatus) {
  if (status === "DONE") return <BrTag color="success" value="Realizada" />;
  if (status === "SCHEDULED") return <BrTag color="warning" value="Agendada" />;

  return <BrTag color="danger" value="Em atraso" />;
}

function getTypeTag(type: VisitType) {
  return <BrTag color={type === "DELIVERY" ? "info" : "success"} value={type === "DELIVERY" ? "Entrega" : "Coleta"} />;
}

export default function VisitsTodayPage() {
  const [search, setSearch] = useState("");

  const filteredVisits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return todayVisits;

    return todayVisits.filter((visit) =>
      `${visit.donorName} ${visit.address} ${visit.neighborhood}`.toLowerCase().includes(normalizedSearch),
    );
  }, [search]);

  const rows = useMemo<TodayVisitRow[]>(
    () =>
      filteredVisits.map((visit) => ({
        ...visit,
        schedule: visit.scheduledAt,
        kit: visit.needsKit ? "Sim" : "Não",
        actions: visit.id,
      })),
    [filteredVisits],
  );

  const summary = useMemo(
    () => ({
      total: todayVisits.length,
      done: todayVisits.filter((visit) => visit.status === "DONE").length,
      kits: todayVisits.filter((visit) => visit.needsKit).length,
      priority: todayVisits.filter((visit) => visit.priority === "HIGH").length,
    }),
    [],
  );

  const columns = useMemo<BrTableColumn<TodayVisitRow>[]>(
    () => [
      {
        key: "schedule",
        title: "Hora",
        width: "9%",
        boldHeading: true,
        render: (value) => formatTime(String(value)),
      },
      {
        key: "donorName",
        title: "Doadora",
        width: "20%",
        boldHeading: true,
      },
      {
        key: "address",
        title: "Endereco",
        width: "26%",
        render: (_value, row) => (
          <span className="visits-today__address">
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
          <div className="visits-today__actions">
            <BrButton aria-label={`Ver detalhes de ${row.donorName}`} circle icon="eye" size="small" />
            <BrButton aria-label={`Registrar visita de ${row.donorName}`} circle icon="check" size="small" />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <section className="visits-today">
      <header className="visits-today__header">
        <div>
          <h1 className="visits-today__title">Visitas de Hoje</h1>
          <p className="visits-today__description">
            Acompanhamento rapido da rota diaria de entregas de kit e coletas domiciliares.
          </p>
        </div>

        <BrButton icon="plus" primary>
          Nova visita
        </BrButton>
      </header>

      <div className="visits-today__summary" aria-label="Resumo das visitas de hoje">
        <article className="visits-today__summary-card visits-today__summary-card--primary">
          <span>Total do dia</span>
          <strong>{summary.total}</strong>
          <small>visitas na agenda</small>
        </article>
        <article className="visits-today__summary-card visits-today__summary-card--done">
          <span>Realizadas</span>
          <strong>{summary.done}</strong>
          <small>finalizadas pela equipe</small>
        </article>
        <article className="visits-today__summary-card visits-today__summary-card--kit">
          <span>Kits</span>
          <strong>{summary.kits}</strong>
          <small>entregas pendentes</small>
        </article>
        <article className="visits-today__summary-card visits-today__summary-card--priority">
          <span>Prioridade</span>
          <strong>{summary.priority}</strong>
          <small>contato recomendado</small>
        </article>
      </div>

      <div className="visits-today__content">
        <div className="visits-today__main">
          <div className="visits-today__search">
            <BrInput
              label="Buscar na rota"
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Nome da doadora ou endereco"
              value={search}
            />
          </div>

          <div className="visits-today__table">
            <BrTable
              columns={columns}
              data={rows}
              density="small"
              emptyContent="Nenhuma visita encontrada para hoje."
              title="Rota do dia"
            />
          </div>
        </div>

        <aside className="visits-today__panel" aria-label="Prioridades do dia">
          <h2>Prioridades</h2>
          {todayVisits
            .filter((visit) => visit.priority === "HIGH")
            .map((visit) => (
              <article key={visit.id} className="visits-today__priority-item">
                <div>
                  <strong>{formatTime(visit.scheduledAt)} - {visit.donorName}</strong>
                  <span>{visit.neighborhood}</span>
                </div>
                <p>{visit.notes}</p>
              </article>
            ))}
        </aside>
      </div>
    </section>
  );
}
