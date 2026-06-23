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

import "./DonationsPage.css";

type DonationOverview = {
  metrics: {
    rawMilkPendingTriage: number;
    rawMilkWaitingBatch: number;
    pasteurizationPending: number;
    availableStockMl: number;
  };
  alerts: {
    rawMilkExpired: number;
    rawMilkExpiringSoon: number;
    rejectedTriage: number;
    pasteurizedExpiringSoon: number;
    pasteurizedExpired: number;
  };
  rawMilkTriageDistribution: { status: string; total: number }[];
  rawMilkStorageDistribution: { status: string; total: number }[];
  pasteurizedStockDistribution: {
    status: string;
    total: number;
    volumeMl: number;
  }[];
  monthlyCollectedVolume: { month: string; volumeMl: number }[];
  monthlyPasteurizedVolume: { month: string; volumeMl: number }[];
};

type DonationOverviewResponse = {
  data: DonationOverview;
};

const emptyOverview: DonationOverview = {
  metrics: {
    rawMilkPendingTriage: 0,
    rawMilkWaitingBatch: 0,
    pasteurizationPending: 0,
    availableStockMl: 0,
  },
  alerts: {
    rawMilkExpired: 0,
    rawMilkExpiringSoon: 0,
    rejectedTriage: 0,
    pasteurizedExpiringSoon: 0,
    pasteurizedExpired: 0,
  },
  rawMilkTriageDistribution: [],
  rawMilkStorageDistribution: [],
  pasteurizedStockDistribution: [],
  monthlyCollectedVolume: [],
  monthlyPasteurizedVolume: [],
};

const triageLabels: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

const triageColors: Record<string, string> = {
  PENDING: "#ffcd07",
  APPROVED: "#168821",
  REJECTED: "#e52207",
};

const stockLabels: Record<string, string> = {
  AVAILABLE: "Disponivel",
  DISTRIBUTED: "Distribuido",
  EXPIRED: "Vencido",
  DISCARDED: "Descartado",
};

const stockColors: Record<string, string> = {
  AVAILABLE: "#168821",
  DISTRIBUTED: "#1351b4",
  EXPIRED: "#888888",
  DISCARDED: "#e52207",
};

function formatVolume(value: number) {
  return `${new Intl.NumberFormat("pt-BR").format(value)} ml`;
}

export default function DonationsPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DonationOverview>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<DonationOverviewResponse>(
          "/donations/overview",
        );
        setOverview(response.data.data);
      } catch {
        setError("Nao foi possivel carregar a visao geral de doacoes.");
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, []);

  const triageData = useMemo(
    () =>
      ["PENDING", "APPROVED", "REJECTED"].map((status) => ({
        status,
        name: triageLabels[status],
        total:
          overview.rawMilkTriageDistribution.find((item) => item.status === status)
            ?.total ?? 0,
      })),
    [overview.rawMilkTriageDistribution],
  );

  const stockData = useMemo(
    () =>
      ["AVAILABLE", "DISTRIBUTED", "EXPIRED", "DISCARDED"].map((status) => ({
        status,
        name: stockLabels[status],
        total:
          overview.pasteurizedStockDistribution.find((item) => item.status === status)
            ?.total ?? 0,
        volumeMl:
          overview.pasteurizedStockDistribution.find((item) => item.status === status)
            ?.volumeMl ?? 0,
      })),
    [overview.pasteurizedStockDistribution],
  );

  const metrics = [
    {
      label: "Coletas pendentes de triagem",
      value: overview.metrics.rawMilkPendingTriage,
      tone: "warning",
    },
    {
      label: "Aguardando lote",
      value: overview.metrics.rawMilkWaitingBatch,
      tone: "primary",
    },
    {
      label: "Microbiologia pendente",
      value: overview.metrics.pasteurizationPending,
      tone: "danger",
    },
    {
      label: "Estoque disponivel",
      value: formatVolume(overview.metrics.availableStockMl),
      tone: "success",
    },
  ];

  const alerts = [
    {
      text: `${overview.alerts.rawMilkExpired} coletas de leite cru vencidas`,
      path: "/doacoes/coletas",
    },
    {
      text: `${overview.alerts.rawMilkExpiringSoon} coletas vencendo em ate 3 dias`,
      path: "/doacoes/coletas",
    },
    {
      text: `${overview.alerts.rejectedTriage} coletas rejeitadas na triagem`,
      path: "/doacoes/coletas",
    },
    {
      text: `${overview.alerts.pasteurizedExpiringSoon} unidades pasteurizadas vencendo em ate 30 dias`,
      path: "/doacoes/estoque",
    },
    {
      text: `${overview.alerts.pasteurizedExpired} unidades pasteurizadas vencidas em estoque`,
      path: "/doacoes/estoque",
    },
  ];

  return (
    <section className="donations-overview">
      <header className="donations-overview__header">
        <div>
          <h1 className="donations-overview__title">Visao Geral de Doacoes</h1>
          <p className="donations-overview__description">
            Gargalos, validade e estoque do fluxo de leite cru e pasteurizado.
          </p>
        </div>
      </header>

      {error && <div className="donations-overview__error">{error}</div>}

      <div className="donations-overview__metrics">
        {metrics.map((metric) => (
          <article
            className={`donations-overview__metric donations-overview__metric--${metric.tone}`}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{loading ? "-" : metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="donations-overview__grid">
        <section className="donations-overview__panel donations-overview__alerts">
          <h2>Alertas criticos</h2>
          {alerts.map((alert) => (
            <button
              className="donations-overview__alert"
              key={alert.text}
              onClick={() => navigate(alert.path)}
              type="button"
            >
              <i aria-hidden="true" className="fas fa-exclamation-triangle" />
              <span>{loading ? "Carregando alerta..." : alert.text}</span>
            </button>
          ))}
        </section>

        <section className="donations-overview__panel">
          <h2>Triagem do leite cru</h2>
          <DonutChart
            colors={triageColors}
            data={triageData}
          />
        </section>

        <section className="donations-overview__panel">
          <h2>Estoque pasteurizado</h2>
          <DonutChart
            colors={stockColors}
            data={stockData}
          />
        </section>

        <section className="donations-overview__panel donations-overview__panel--wide">
          <h2>Volume coletado x pasteurizado</h2>
          <div className="donations-overview__chart">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={overview.monthlyCollectedVolume.map((item) => ({
                ...item,
                pasteurizedMl:
                  overview.monthlyPasteurizedVolume.find(
                    (volume) => volume.month === item.month,
                  )?.volumeMl ?? 0,
              }))}>
                <CartesianGrid stroke="#e6e6e6" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis allowDecimals={false} tickFormatter={(value) => `${value} ml`} width={64} />
                <Tooltip />
                <Bar dataKey="volumeMl" fill="#1351b4" name="Coletado" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pasteurizedMl" fill="#168821" name="Pasteurizado" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </section>
  );
}

function DonutChart({
  colors,
  data,
}: {
  colors: Record<string, string>;
  data: { status: string; name: string; total: number; volumeMl?: number }[];
}) {
  return (
    <>
      <div className="donations-overview__donut">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey="total"
              innerRadius={58}
              nameKey="name"
              outerRadius={86}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell fill={colors[entry.status]} key={entry.status} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="donations-overview__legend">
        {data.map((entry) => (
          <span key={entry.status}>
            <i style={{ backgroundColor: colors[entry.status] }} />
            {entry.name}: {entry.total}
          </span>
        ))}
      </div>
    </>
  );
}
