import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrButton,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "@/services/api";

import "./DonatorsOverviewPage.css";

type DonatorStatus = "PENDING_EXAMS" | "ACTIVE" | "INACTIVE";

type DonatorOverview = {
  metrics: {
    activeDonators: number;
    pendingExams: number;
    inactivityRisk: number;
    pendingVisits: number;
  };
  alerts: {
    examsExpiringThisMonth: number;
    inactivatedThisWeek: number;
    newWhatsappRegistrations: number;
  };
  monthlyNewDonators: { month: string; total: number }[];
  statusDistribution: { status: DonatorStatus; total: number }[];
  latestRegistrations: {
    id: string;
    name: string;
    phone: string;
    status: DonatorStatus;
  }[];
};

type DonatorOverviewResponse = {
  data: DonatorOverview;
};

const emptyOverview: DonatorOverview = {
  metrics: {
    activeDonators: 0,
    pendingExams: 0,
    inactivityRisk: 0,
    pendingVisits: 0,
  },
  alerts: {
    examsExpiringThisMonth: 0,
    inactivatedThisWeek: 0,
    newWhatsappRegistrations: 0,
  },
  monthlyNewDonators: [],
  statusDistribution: [],
  latestRegistrations: [],
};

const statusLabels: Record<DonatorStatus, string> = {
  ACTIVE: "Ativas",
  INACTIVE: "Inativas",
  PENDING_EXAMS: "Pendentes",
};

const statusColors: Record<DonatorStatus, string> = {
  ACTIVE: "#168821",
  INACTIVE: "#888888",
  PENDING_EXAMS: "#ffcd07",
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return value;
}

function getStatusTag(status: DonatorStatus) {
  if (status === "ACTIVE") {
    return <BrTag color="success" value="Ativa" />;
  }

  if (status === "PENDING_EXAMS") {
    return <BrTag color="warning" value="Pendente Exames" />;
  }

  return <BrTag color="danger" value="Inativa" />;
}

export default function DonatorsOverviewPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DonatorOverview>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<DonatorOverviewResponse>("/donators/overview");
        setOverview(response.data.data);
      } catch {
        setError("Nao foi possivel carregar a visao geral de doadoras.");
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, []);

  const statusChartData = useMemo(
    () =>
      (["ACTIVE", "INACTIVE", "PENDING_EXAMS"] as DonatorStatus[]).map((status) => ({
        name: statusLabels[status],
        status,
        total:
          overview.statusDistribution.find((item) => item.status === status)?.total ?? 0,
      })),
    [overview.statusDistribution],
  );

  const rows = useMemo(
    () =>
      overview.latestRegistrations.map((donator) => ({
        ...donator,
        actions: donator.id,
      })),
    [overview.latestRegistrations],
  );

  const columns = useMemo<BrTableColumn<(typeof rows)[number]>[]>(
    () => [
      {
        key: "name",
        title: "Nome",
        width: "38%",
        boldHeading: true,
      },
      {
        key: "phone",
        title: "Telefone",
        width: "24%",
        render: (value) => formatPhone(String(value)),
      },
      {
        key: "status",
        title: "Status",
        width: "20%",
        render: (value) => getStatusTag(value),
      },
      {
        key: "actions",
        title: "Acoes",
        align: "right",
        width: "18%",
        render: (_value, row) => (
          <BrButton
            aria-label={`Ver perfil de ${row.name}`}
            circle
            icon="eye"
            onClick={() => navigate(`/doadoras/${row.id}`)}
            size="small"
          />
        ),
      },
    ],
    [navigate],
  );

  const metrics = [
    {
      label: "Doadoras ativas",
      value: overview.metrics.activeDonators,
      tone: "success",
    },
    {
      label: "Aguardando exames",
      value: overview.metrics.pendingExams,
      tone: "warning",
    },
    {
      label: "Risco de inatividade",
      value: overview.metrics.inactivityRisk,
      tone: "danger",
    },
    {
      label: "Visitas pendentes",
      value: overview.metrics.pendingVisits,
      tone: "info",
    },
  ];

  const alerts = [
    {
      text: `${overview.alerts.examsExpiringThisMonth} doadoras com exames vencendo este mes`,
      icon: "exclamation-triangle",
      onClick: () => navigate("/doadoras/exames-pendentes"),
    },
    {
      text: `${overview.alerts.inactivatedThisWeek} doadoras inativadas nesta semana`,
      icon: "exclamation-circle",
      onClick: () => navigate("/doadoras/lista"),
    },
    {
      text: `${overview.alerts.newWhatsappRegistrations} novos cadastros via WhatsApp`,
      icon: "comment",
      onClick: () => navigate("/doadoras/lista"),
    },
  ];

  return (
    <section className="donators-overview">
      <header className="donators-overview__header">
        <div>
          <h1 className="donators-overview__title">Visao Geral de Doadoras</h1>
          <p className="donators-overview__description">
            Acompanhe cadastro, triagem e sinais de risco da base de doadoras.
          </p>
        </div>

        <BrButton
          icon="plus"
          onClick={() => navigate("/doadoras/cadastro")}
          primary
        >
          Criar doadora
        </BrButton>
      </header>

      {error && <div className="donators-overview__error">{error}</div>}

      <div className="donators-overview__metrics">
        {metrics.map((metric) => (
          <article
            className={`donators-overview__metric donators-overview__metric--${metric.tone}`}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{loading ? "-" : metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="donators-overview__main">
        <section className="donators-overview__panel donators-overview__alerts">
          <h2>Acoes urgentes</h2>
          {alerts.map((alert) => (
            <button
              className="donators-overview__alert"
              key={alert.text}
              onClick={alert.onClick}
              type="button"
            >
              <i aria-hidden="true" className={`fas fa-${alert.icon}`} />
              <span>{loading ? "Carregando alerta..." : alert.text}</span>
            </button>
          ))}
        </section>

        <section className="donators-overview__panel">
          <h2>Evolucao de novas doadoras</h2>
          <div className="donators-overview__chart">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={overview.monthlyNewDonators}>
                <CartesianGrid stroke="#e6e6e6" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis allowDecimals={false} tickLine={false} width={32} />
                <Tooltip />
                <Bar dataKey="total" fill="#1351b4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="donators-overview__panel">
          <h2>Saude da base</h2>
          <div className="donators-overview__donut">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={statusChartData}
                  dataKey="total"
                  innerRadius={58}
                  nameKey="name"
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {statusChartData.map((entry) => (
                    <Cell fill={statusColors[entry.status]} key={entry.status} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="donators-overview__legend">
            {statusChartData.map((entry) => (
              <span key={entry.status}>
                <i style={{ backgroundColor: statusColors[entry.status] }} />
                {entry.name}: {entry.total}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="donators-overview__table">
        <BrTable
          columns={columns}
          data={rows}
          density="small"
          emptyContent="Nenhum cadastro recente encontrado."
          isLoading={loading}
          title="Ultimos cadastros"
        />
      </div>
    </section>
  );
}
