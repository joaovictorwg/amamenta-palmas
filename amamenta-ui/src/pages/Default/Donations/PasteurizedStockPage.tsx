import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  BrButton,
  BrInput,
  BrMessage,
  BrModal,
  BrTab,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./PasteurizedStockPage.css";

type StockStatus = "AVAILABLE" | "DISTRIBUTED" | "EXPIRED" | "DISCARDED";

type PasteurizedMilkUnit = {
  id: string;
  batchId: string;
  batchCode?: string | null;
  volumeMl: number;
  expirationDate: string;
  stockStatus: StockStatus;
  distributedAt?: string | null;
  recipientIdentifier?: string | null;
  discardReason?: string | null;
};

type StockResponse = {
  data: PasteurizedMilkUnit[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

const statuses: StockStatus[] = [
  "AVAILABLE",
  "DISTRIBUTED",
  "EXPIRED",
  "DISCARDED",
];

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "-";
}

function getErrorMessage(error: unknown, fallback: string) {
  return axios.isAxiosError(error)
    ? error.response?.data?.message ?? fallback
    : fallback;
}

export default function PasteurizedStockPage() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [units, setUnits] = useState<PasteurizedMilkUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<PasteurizedMilkUnit | null>(null);
  const [recipientIdentifier, setRecipientIdentifier] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: "success" | "danger" | "info";
    message: string;
  } | null>(null);

  const status = statuses[activeIndex];

  async function loadStock() {
    setLoading(true);
    try {
      const response = await api.get<StockResponse>("/donations/pasteurized-milk", {
        params: { stockStatus: status, page, limit },
      });
      setUnits(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      setFeedback({
        status: "danger",
        message: getErrorMessage(error, t("pasteurizedStock.loadError")),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStock();
  }, [status, page, limit]);

  async function distribute() {
    if (!selectedUnit || !recipientIdentifier.trim() || submitting) return;

    setSubmitting(true);
    setFeedback({ status: "info", message: t("pasteurizedStock.distributing") });
    try {
      await api.patch(`/donations/pasteurized-milk/${selectedUnit.id}/distribute`, {
        recipientIdentifier: recipientIdentifier.trim(),
      });
      setSelectedUnit(null);
      setRecipientIdentifier("");
      setFeedback({ status: "success", message: t("pasteurizedStock.distributeSuccess") });
      await loadStock();
    } catch (error) {
      setFeedback({
        status: "danger",
        message: getErrorMessage(error, t("pasteurizedStock.distributeError")),
      });
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<BrTableColumn<PasteurizedMilkUnit>[]>(
    () => [
      {
        key: "batchCode",
        title: t("pasteurizedStock.table.batch"),
        boldHeading: true,
        render: (value, row) => String(value ?? row.batchId),
      },
      {
        key: "volumeMl",
        title: t("pasteurizedStock.table.volume"),
        render: (value) => `${value} ml`,
      },
      {
        key: "expirationDate",
        title: t("pasteurizedStock.table.expiration"),
        render: (value) => formatDate(String(value)),
      },
      {
        key: "stockStatus",
        title: t("common.status"),
        render: (value) => {
          const current = value as StockStatus;
          const color =
            current === "AVAILABLE"
              ? "success"
              : current === "DISTRIBUTED"
                ? "info"
                : current === "EXPIRED"
                  ? "warning"
                  : "danger";
          return <BrTag color={color} value={t(`pasteurizedStock.status.${current}`)} />;
        },
      },
      {
        key: "recipientIdentifier",
        title: t("pasteurizedStock.table.destination"),
        render: (value, row) =>
          String(value ?? row.discardReason ?? "-"),
      },
      {
        key: "id",
        title: t("common.actions"),
        align: "right",
        render: (_value, row) => {
          const unavailable = row.stockStatus !== "AVAILABLE";
          return (
            <BrButton
              aria-label={t("pasteurizedStock.distribute")}
              disabled={unavailable}
              icon="hand-holding-heart"
              onClick={() => {
                setSelectedUnit(row);
                setRecipientIdentifier("");
                setFeedback(null);
              }}
              size="small"
              title={
                unavailable
                  ? t("pasteurizedStock.unavailable")
                  : t("pasteurizedStock.distribute")
              }
            >
              {t("pasteurizedStock.distribute")}
            </BrButton>
          );
        },
      },
    ],
    [t],
  );

  return (
    <section className="pasteurized-stock">
      <header>
        <h1>{t("pasteurizedStock.title")}</h1>
        <p>{t("pasteurizedStock.description")}</p>
      </header>

      {feedback && (
        <BrMessage
          category="message"
          message={feedback.message}
          status={feedback.status}
        />
      )}

      <BrTab
        activeIndex={activeIndex}
        items={statuses.map((item) => t(`pasteurizedStock.tabs.${item}`))}
        onChange={(index) => {
          setActiveIndex(index);
          setPage(1);
          setFeedback(null);
        }}
      >
        {null}
      </BrTab>

      <BrTable
        columns={columns}
        data={units}
        density="small"
        emptyContent={t("pasteurizedStock.empty")}
        isLoading={loading}
        paginationProps={{
          page,
          perPage: limit,
          total,
          showTotalizers: true,
          itemTitleSingular: t("pasteurizedStock.pagination.singular"),
          itemTitlePlural: t("pasteurizedStock.pagination.plural"),
          onPageChange: setPage,
          onPerPageChange: setLimit,
        }}
        title={t(`pasteurizedStock.tabs.${status}`)}
      />

      <BrModal
        isOpen={Boolean(selectedUnit)}
        onClose={() => !submitting && setSelectedUnit(null)}
        primaryAction={{
          label: submitting ? t("pasteurizedStock.distributing") : t("pasteurizedStock.confirm"),
          action: () => void distribute(),
          disabled: submitting || !recipientIdentifier.trim(),
        }}
        secondaryAction={{
          label: t("common.cancel"),
          action: () => setSelectedUnit(null),
          disabled: submitting,
        }}
        showClose={!submitting}
        title={t("pasteurizedStock.modalTitle")}
      >
        <div className="pasteurized-stock__modal">
          <BrMessage
            category="feedback"
            message={t("pasteurizedStock.recipientHelp")}
            status="info"
          />
          <BrInput
            disabled={submitting}
            label={t("pasteurizedStock.recipient")}
            onChange={(event) => setRecipientIdentifier(event.currentTarget.value)}
            required
            value={recipientIdentifier}
          />
        </div>
      </BrModal>
    </section>
  );
}
