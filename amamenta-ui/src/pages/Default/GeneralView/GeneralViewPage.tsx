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
  const { t } = useTranslation();
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
        setError(t("generalView.loadError"));
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, [t]);

  const donationStatusData = useMemo(
    () =>
      ["PENDING", "APPROVED", "REJECTED", "EXPIRED"].map((status) => ({
        status,
        name: t(`generalView.donationStatus.${status}`),
        total:
          overview.donationStatusDistribution.find((item) => item.status === status)
            ?.total ?? 0,
      })),
    [overview.donationStatusDistribution, t],
  );

  const metrics = [
    {
      label: t("generalView.metrics.totalDonations"),
      value: overview.metrics.totalDonations,
      tone: "info",
    },
    {
      label: t("generalView.metrics.validDonations"),
      value: overview.metrics.validDonations,
      tone: "success",
    },
    {
      label: t("generalView.metrics.expiringSoonDonations"),
      value: overview.metrics.expiringSoonDonations,
      tone: "warning",
    },
    {
      label: t("generalView.metrics.periodVolume"),
      value: formatVolume(overview.metrics.periodVolumeMl),
      tone: "primary",
    },
  ];

  const alerts = [
    {
      text: t("generalView.alerts.expiredDonations", { count: overview.alerts.expiredDonations }),
      path: "/doacoes/coletas",
    },
    {
      text: t("generalView.alerts.pendingTriage", { count: overview.alerts.pendingTriage }),
      path: "/doacoes/coletas",
    },
    {
      text: t("generalView.alerts.todayVisits", { count: overview.alerts.todayVisits }),
      path: "/visitas/hoje",
    },
    {
      text: t("generalView.alerts.pendingExams", { count: overview.alerts.pendingExams }),
      path: "/doadoras/exames-pendentes",
    },
    {
      text: t("generalView.alerts.inactiveRisk", { count: overview.alerts.inactiveRisk }),
      path: "/doadoras",
    },
  ];

  return (
    <section className="general-view">
      <header className="general-view__header">
        <div>
          <h1 className="general-view__title">{t("generalView.title")}</h1>
          <p className="general-view__description">
            {t("generalView.description")}
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
          <h2>{t("generalView.alerts.title")}</h2>
          {alerts.map((alert) => (
            <button
              className="general-view__alert"
              key={alert.text}
              onClick={() => navigate(alert.path)}
              type="button"
            >
              <i aria-hidden="true" className="fas fa-exclamation-triangle" />
              <span>{loading ? t("generalView.alerts.loading") : alert.text}</span>
            </button>
          ))}
        </section>

        <section className="general-view__panel">
          <h2>{t("generalView.charts.donationStatus")}</h2>
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
          <h2>{t("generalView.charts.newDonators")}</h2>
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
          <h2>{t("generalView.charts.monthlyVolume")}</h2>
          <div className="general-view__chart">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={overview.monthlyCollectedVolume}>
                <CartesianGrid stroke="#e6e6e6" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis allowDecimals={false} tickFormatter={(value) => `${value} ml`} width={64} />
                <Tooltip formatter={(value) => [`${value} ml`, t("generalView.charts.volume")]} />
                <Bar dataKey="volumeMl" fill="#168821" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </section>
  );
}
