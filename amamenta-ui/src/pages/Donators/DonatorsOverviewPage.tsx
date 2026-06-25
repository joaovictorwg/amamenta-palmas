import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

function getStatusTag(status: DonatorStatus, t: (key: string) => string) {
  if (status === "ACTIVE") {
    return <BrTag color="success" value={t("donatorsOverview.status.active")} />;
  }

  if (status === "PENDING_EXAMS") {
    return <BrTag color="warning" value={t("donatorsOverview.status.pendingExams")} />;
  }

  return <BrTag color="danger" value={t("donatorsOverview.status.inactive")} />;
}

export default function DonatorsOverviewPage() {
  const { t } = useTranslation();
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
        setError(t("donatorsOverview.loadError"));
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, [t]);

  const statusChartData = useMemo(
    () =>
      (["ACTIVE", "INACTIVE", "PENDING_EXAMS"] as DonatorStatus[]).map((status) => ({
        name: t(`donatorsOverview.status.${status}`),
        status,
        total:
          overview.statusDistribution.find((item) => item.status === status)?.total ?? 0,
      })),
    [overview.statusDistribution, t],
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
        title: t("common.name"),
        width: "38%",
        boldHeading: true,
      },
      {
        key: "phone",
        title: t("donatorsOverview.table.phone"),
        width: "24%",
        render: (value) => formatPhone(String(value)),
      },
      {
        key: "status",
        title: t("common.status"),
        width: "20%",
        render: (value) => getStatusTag(value, t),
      },
      {
        key: "actions",
        title: t("common.actions"),
        align: "right",
        width: "18%",
        render: (_value, row) => (
          <BrButton
            aria-label={t("donatorsOverview.table.viewProfile", { name: row.name })}
            circle
            icon="eye"
            onClick={() => navigate(`/doadoras/${row.id}`)}
            size="small"
          />
        ),
      },
    ],
    [navigate, t],
  );

  const metrics = [
    {
      label: t("donatorsOverview.metrics.activeDonators"),
      value: overview.metrics.activeDonators,
      tone: "success",
    },
    {
      label: t("donatorsOverview.metrics.pendingExams"),
      value: overview.metrics.pendingExams,
      tone: "warning",
    },
    {
      label: t("donatorsOverview.metrics.inactivityRisk"),
      value: overview.metrics.inactivityRisk,
      tone: "danger",
    },
    {
      label: t("donatorsOverview.metrics.pendingVisits"),
      value: overview.metrics.pendingVisits,
      tone: "info",
    },
  ];

  const alerts = [
    {
      text: t("donatorsOverview.alerts.examsExpiring", {
        count: overview.alerts.examsExpiringThisMonth,
      }),
      icon: "exclamation-triangle",
      onClick: () => navigate("/doadoras/exames-pendentes"),
    },
    {
      text: t("donatorsOverview.alerts.inactivatedThisWeek", {
        count: overview.alerts.inactivatedThisWeek,
      }),
      icon: "exclamation-circle",
      onClick: () => navigate("/doadoras/lista"),
    },
    {
      text: t("donatorsOverview.alerts.newWhatsapp", {
        count: overview.alerts.newWhatsappRegistrations,
      }),
      icon: "comment",
      onClick: () => navigate("/doadoras/lista"),
    },
  ];

  return (
    <section className="donators-overview">
      <header className="donators-overview__header">
        <div>
          <h1 className="donators-overview__title">{t("donatorsOverview.title")}</h1>
          <p className="donators-overview__description">
            {t("donatorsOverview.description")}
          </p>
        </div>

        <BrButton
          icon="plus"
          onClick={() => navigate("/doadoras/cadastro")}
          primary
        >
          {t("donatorsOverview.createDonator")}
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
          <h2>{t("donatorsOverview.alerts.title")}</h2>
          {alerts.map((alert) => (
            <button
              className="donators-overview__alert"
              key={alert.text}
              onClick={alert.onClick}
              type="button"
            >
              <i aria-hidden="true" className={`fas fa-${alert.icon}`} />
              <span>{loading ? t("donatorsOverview.alerts.loading") : alert.text}</span>
            </button>
          ))}
        </section>

        <section className="donators-overview__panel">
          <h2>{t("donatorsOverview.charts.newDonators")}</h2>
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
          <h2>{t("donatorsOverview.charts.baseHealth")}</h2>
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
          emptyContent={t("donatorsOverview.table.empty")}
          isLoading={loading}
          title={t("donatorsOverview.table.title")}
        />
      </div>
    </section>
  );
}
