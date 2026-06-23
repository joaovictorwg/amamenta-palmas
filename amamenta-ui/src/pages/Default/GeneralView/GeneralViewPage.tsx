import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import "./GeneralViewPage.css";

type OverviewData = {
  metrics: {
    totalDonations: number;
    validDonations: number;
    expiringSoonDonations: number;
    periodVolumeMl: number;
  };
  alerts: {
    expiredDonations: number;
    pendingTriage: number;
    todayVisits: number;
    pendingExams: number;
    inactiveRisk: number;
  };
  donationStatusDistribution: { status: string; total: number }[];
  monthlyNewDonators: { month: string; total: number }[];
  monthlyCollectedVolume: { month: string; volumeMl: number }[];
};

type OverviewResponse = {
  data: OverviewData;
};

const emptyOverview: OverviewData = {
  metrics: {
    totalDonations: 0,
    validDonations: 0,
    expiringSoonDonations: 0,
    periodVolumeMl: 0,
  },
  alerts: {
    expiredDonations: 0,
    pendingTriage: 0,
    todayVisits: 0,
    pendingExams: 0,
    inactiveRisk: 0,
  },
  donationStatusDistribution: [],
  monthlyNewDonators: [],
  monthlyCollectedVolume: [],
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendentes",
  APPROVED: "Aprovadas",
  REJECTED: "Rejeitadas",
  EXPIRED: "Vencidas",
};

const statusColors: Record<string, string> = {
  PENDING: "#ffcd07",
  APPROVED: "#168821",
  REJECTED: "#e52207",
  EXPIRED: "#888888",
};

function formatVolume(value: number) {
  return `${new Intl.NumberFormat("pt-BR").format(value)} ml`;
}

export default function GeneralViewPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewData>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<OverviewResponse>("/overview");
        setOverview(response.data.data);
      } catch {
        setError("Nao foi possivel carregar a visao geral.");
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, []);

  const donationStatusData = useMemo(
    () =>
      ["PENDING", "APPROVED", "REJECTED", "EXPIRED"].map((status) => ({
        status,
        name: statusLabels[status],
        total:
          overview.donationStatusDistribution.find((item) => item.status === status)
            ?.total ?? 0,
      })),
    [overview.donationStatusDistribution],
  );

  const metrics = [
    {
      label: "Total de doacoes",
      value: overview.metrics.totalDonations,
      tone: "info",
    },
    {
      label: "Dentro da validade",
      value: overview.metrics.validDonations,
      tone: "success",
    },
    {
      label: "Proximas ao vencimento",
      value: overview.metrics.expiringSoonDonations,
      tone: "warning",
    },
    {
      label: "Volume no mes",
      value: formatVolume(overview.metrics.periodVolumeMl),
      tone: "primary",
    },
  ];

  const alerts = [
    {
      text: `${overview.alerts.expiredDonations} doacoes vencidas aguardando acao`,
      path: "/doacoes/coletas",
    },
    {
      text: `${overview.alerts.pendingTriage} coletas pendentes de triagem`,
      path: "/doacoes/coletas",
    },
    {
      text: `${overview.alerts.todayVisits} visitas agendadas para hoje`,
      path: "/visitas/hoje",
    },
    {
      text: `${overview.alerts.pendingExams} doadoras com exames pendentes`,
      path: "/doadoras/exames-pendentes",
    },
    {
      text: `${overview.alerts.inactiveRisk} doadoras em risco de inatividade`,
      path: "/doadoras",
    },
  ];

  return (
    <section className="general-view">
      <header className="general-view__header">
        <div>
          <h1 className="general-view__title">Visao Geral</h1>
          <p className="general-view__description">
            Resumo operacional do banco de leite e principais pendencias do dia.
          </p>
        </div>
      </header>

      {error && <div className="general-view__error">{error}</div>}

      <div className="general-view__metrics">
        {metrics.map((metric) => (
          <article
            className={`general-view__metric general-view__metric--${metric.tone}`}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{loading ? "-" : metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="general-view__grid">
        <section className="general-view__panel general-view__alerts">
          <h2>Alertas e pendencias</h2>
          {alerts.map((alert) => (
            <button
              className="general-view__alert"
              key={alert.text}
              onClick={() => navigate(alert.path)}
              type="button"
            >
              <i aria-hidden="true" className="fas fa-exclamation-triangle" />
              <span>{loading ? "Carregando alerta..." : alert.text}</span>
            </button>
          ))}
        </section>

        <section className="general-view__panel">
          <h2>Situacao das doacoes</h2>
          <div className="general-view__donut">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={donationStatusData}
                  dataKey="total"
                  innerRadius={58}
                  nameKey="name"
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {donationStatusData.map((entry) => (
                    <Cell fill={statusColors[entry.status]} key={entry.status} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="general-view__legend">
            {donationStatusData.map((entry) => (
              <span key={entry.status}>
                <i style={{ backgroundColor: statusColors[entry.status] }} />
                {entry.name}: {entry.total}
              </span>
            ))}
          </div>
        </section>

        <section className="general-view__panel">
          <h2>Novas doadoras</h2>
          <div className="general-view__chart">
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

        <section className="general-view__panel general-view__panel--wide">
          <h2>Volume coletado por mes</h2>
          <div className="general-view__chart">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={overview.monthlyCollectedVolume}>
                <CartesianGrid stroke="#e6e6e6" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis allowDecimals={false} tickFormatter={(value) => `${value} ml`} width={64} />
                <Tooltip formatter={(value) => [`${value} ml`, "Volume"]} />
                <Bar dataKey="volumeMl" fill="#168821" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </section>
  );
}
