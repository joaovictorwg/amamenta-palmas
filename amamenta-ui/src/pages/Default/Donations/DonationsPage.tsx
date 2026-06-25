import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

const triageColors: Record<string, string> = {
  PENDING: "#ffcd07",
  APPROVED: "#168821",
  REJECTED: "#e52207",
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
  const { t } = useTranslation();
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
        setError(t("donationsOverview.loadError"));
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, [t]);

  const triageData = useMemo(
    () =>
      ["PENDING", "APPROVED", "REJECTED"].map((status) => ({
        status,
        name: t(`donationsOverview.triageStatus.${status}`),
        total:
          overview.rawMilkTriageDistribution.find((item) => item.status === status)
            ?.total ?? 0,
      })),
    [overview.rawMilkTriageDistribution, t],
  );

  const stockData = useMemo(
    () =>
      ["AVAILABLE", "DISTRIBUTED", "EXPIRED", "DISCARDED"].map((status) => ({
        status,
        name: t(`donationsOverview.stockStatus.${status}`),
        total:
          overview.pasteurizedStockDistribution.find((item) => item.status === status)
            ?.total ?? 0,
        volumeMl:
          overview.pasteurizedStockDistribution.find((item) => item.status === status)
            ?.volumeMl ?? 0,
      })),
    [overview.pasteurizedStockDistribution, t],
  );

  const metrics = [
    {
      label: t("donationsOverview.metrics.pendingTriage"),
      value: overview.metrics.rawMilkPendingTriage,
      tone: "warning",
    },
    {
      label: t("donationsOverview.metrics.waitingBatch"),
      value: overview.metrics.rawMilkWaitingBatch,
      tone: "primary",
    },
    {
      label: t("donationsOverview.metrics.pendingMicrobiology"),
      value: overview.metrics.pasteurizationPending,
      tone: "danger",
    },
    {
      label: t("donationsOverview.metrics.availableStock"),
      value: formatVolume(overview.metrics.availableStockMl),
      tone: "success",
    },
  ];

  const alerts = [
    {
      text: t("donationsOverview.alerts.rawMilkExpired", { count: overview.alerts.rawMilkExpired }),
      path: "/doacoes/coletas",
    },
    {
      text: t("donationsOverview.alerts.rawMilkExpiringSoon", { count: overview.alerts.rawMilkExpiringSoon }),
      path: "/doacoes/coletas",
    },
    {
      text: t("donationsOverview.alerts.rejectedTriage", { count: overview.alerts.rejectedTriage }),
      path: "/doacoes/coletas",
    },
    {
      text: t("donationsOverview.alerts.pasteurizedExpiringSoon", { count: overview.alerts.pasteurizedExpiringSoon }),
      path: "/doacoes/estoque",
    },
    {
      text: t("donationsOverview.alerts.pasteurizedExpired", { count: overview.alerts.pasteurizedExpired }),
      path: "/doacoes/estoque",
    },
  ];

  return (
    <section className="donations-overview">
      <header className="donations-overview__header">
        <div>
          <h1 className="donations-overview__title">{t("donationsOverview.title")}</h1>
          <p className="donations-overview__description">
            {t("donationsOverview.description")}
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
          <h2>{t("donationsOverview.alerts.title")}</h2>
          {alerts.map((alert) => (
            <button
              className="donations-overview__alert"
              key={alert.text}
              onClick={() => navigate(alert.path)}
              type="button"
            >
              <i aria-hidden="true" className="fas fa-exclamation-triangle" />
              <span>{loading ? t("donationsOverview.alerts.loading") : alert.text}</span>
            </button>
          ))}
        </section>

        <section className="donations-overview__panel">
          <h2>{t("donationsOverview.charts.rawMilkTriage")}</h2>
          <DonutChart
            colors={triageColors}
            data={triageData}
          />
        </section>

        <section className="donations-overview__panel">
          <h2>{t("donationsOverview.charts.pasteurizedStock")}</h2>
          <DonutChart
            colors={stockColors}
            data={stockData}
          />
        </section>

        <section className="donations-overview__panel donations-overview__panel--wide">
          <h2>{t("donationsOverview.charts.collectedVsPasteurized")}</h2>
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
                <Bar dataKey="volumeMl" fill="#1351b4" name={t("donationsOverview.charts.collected")} radius={[4, 4, 0, 0]} />
                <Bar dataKey="pasteurizedMl" fill="#168821" name={t("donationsOverview.charts.pasteurized")} radius={[4, 4, 0, 0]} />
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
