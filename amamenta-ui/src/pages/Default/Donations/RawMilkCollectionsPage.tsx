import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  BrButton,
  BrInput,
  BrModal,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext/useAuth";
import type { RawMilkCollection, RawMilkResponse, RawMilkFilterTab } from "@/types/rawMilk";

import "./RawMilkCollectionsPage.css";

type Donator = { id: string; name: string };

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function getStatusTag(status: RawMilkCollection["triageStatus"], t: (key: string) => string) {
  if (status === "APPROVED") return <BrTag color="success" value={t("rawMilk.status.approved")} />;
  if (status === "REJECTED") return <BrTag color="danger" value={t("rawMilk.status.rejected")} />;
  return <BrTag color="warning" value={t("rawMilk.status.pending")} />;
}

export default function RawMilkCollectionsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<RawMilkFilterTab>("PENDING");
  const [collections, setCollections] = useState<RawMilkCollection[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selected, setSelected] = useState<RawMilkCollection | null>(null);

  async function loadCollections() {
    setLoading(true);
    setError(null);
    try {
      const query: Record<string, unknown> = { page, limit };
      if (activeTab === "EXPIRED") query.expired = "true";
      else query.triageStatus = activeTab;

      const response = await api.get<RawMilkResponse>("/donations/raw-milk", {
        params: query,
      });
      setCollections(response.data.data);
      setTotal(response.data.meta.total);
    } catch {
      setError(t("rawMilk.loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCollections();
  }, [activeTab, page, limit, t]);

  function handleTabChange(tab: RawMilkFilterTab) {
    setActiveTab(tab);
    setPage(1);
  }

  const rows = useMemo(() => collections, [collections]);

  const columns = useMemo<BrTableColumn<RawMilkCollection>[]>(
    () => [
     { key: "donorName", title: t("visits.table.donator"), width: "24%", boldHeading: true, render: (v: unknown, row: RawMilkCollection) => (v as string | null) ?? row.donorId },
      { key: "volumeMl", title: t("common.volumeMl"), width: "14%" },
     { key: "expirationDate", title: t("rawMilk.table.expiration"), width: "16%", render: (v: unknown) => formatDate(String(v)) },
     { key: "triageStatus", title: t("common.status"), width: "16%", render: (v: unknown) => getStatusTag(v as RawMilkCollection["triageStatus"], t) },
         {
        key: "id",
        title: t("common.actions"),
        align: "right",
        width: "12%",
        render: (_v: unknown, row: RawMilkCollection) => (
          <BrButton
            aria-label={t("rawMilk.actions.viewDetails", { name: row.donorName ?? row.donorId })}
            circle
            icon="eye"
            size="small"
            onClick={() => setSelected(row)}
          />
        ),
      },
    ],
    [t],
  );

  const tabs: { key: RawMilkFilterTab; label: string }[] = [
    { key: "PENDING", label: t("rawMilk.tabs.pending") },
    { key: "APPROVED", label: t("rawMilk.tabs.approved") },
    { key: "REJECTED", label: t("rawMilk.tabs.rejected") },
    { key: "EXPIRED", label: t("rawMilk.tabs.expired") },
  ];

  return (
    <section className="raw-milk-collections">
      <header className="raw-milk-collections__header">
        <div>
          <h1 className="raw-milk-collections__title">{t("rawMilk.title")}</h1>
          <p className="raw-milk-collections__description">
            {t("rawMilk.description")}
          </p>
        </div>
        <BrButton icon="plus" primary onClick={() => setIsNewModalOpen(true)}>
          {t("rawMilk.newCollection")}
        </BrButton>
      </header>

      <div className="raw-milk-collections__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={
              "raw-milk-collections__tab" +
              (activeTab === tab.key ? " raw-milk-collections__tab--active" : "")
            }
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="raw-milk-collections__error">{error}</div>}

      <div className="raw-milk-collections__table">
        <BrTable
          columns={columns}
          data={rows}
          density="small"
          emptyContent={t("rawMilk.table.empty")}
          isLoading={loading}
          paginationProps={{
            page,
            perPage: limit,
            total,
            showTotalizers: true,
            itemTitleSingular: t("rawMilk.pagination.singular"),
            itemTitlePlural: t("rawMilk.pagination.plural"),
            onPageChange: setPage,
            onPerPageChange: setLimit,
          }}
          title={t("rawMilk.table.title")}
        />
      </div>

      <NewCollectionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        createdBy={user?.id ?? ""}
        onCreated={() => {
          setIsNewModalOpen(false);
          void loadCollections();
        }}
      />

      <DetailsModal collection={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

// --- Modal de Nova Coleta ---

function NewCollectionModal({
  isOpen,
  onClose,
  createdBy,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  createdBy: string;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [donorQuery, setDonorQuery] = useState("");
  const [donorResults, setDonorResults] = useState<Donator[]>([]);
  const [donor, setDonor] = useState<Donator | null>(null);
  const [volumeMl, setVolumeMl] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [receivedAt, setReceivedAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!donorQuery || donorQuery === donor?.name) {
      setDonorResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const response = await api.get<{ data: Donator[] }>("/donators", {
        params: { name: donorQuery, limit: 10 },
      });
      setDonorResults(response.data.data);
    }, 300);
    return () => clearTimeout(timeout);
  }, [donorQuery, donor]);

  function reset() {
    setDonorQuery("");
    setDonor(null);
    setVolumeMl("");
    setCollectionDate("");
    setReceivedAt("");
    setErrors({});
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {};
    if (!donor) newErrors.donor = t("rawMilk.form.selectDonator");
    if (!volumeMl || Number(volumeMl) <= 0) newErrors.volumeMl = t("rawMilk.form.volumeRequired");
    if (!collectionDate) newErrors.collectionDate = t("rawMilk.form.collectionDateRequired");
    if (!receivedAt) newErrors.receivedAt = t("rawMilk.form.receivedAtRequired");
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || !donor) return;

    setSubmitting(true);
    try {
      await api.post("/donations/raw-milk", {
        donorId: donor.id,
        volumeMl: Number(volumeMl),
        collectionDate,
        receivedAt,
        createdBy,
      });
      reset();
      onCreated();
    } catch (err) {
      let message = t("rawMilk.form.createError");
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setErrors({ general: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BrModal
      isOpen={isOpen}
      onClose={onClose}
      showClose
      title={t("rawMilk.form.newTitle")}
      primaryAction={{ label: submitting ? t("rawMilk.form.saving") : t("rawMilk.form.register"), action: () => void handleSubmit() }}
      secondaryAction={{ label: t("common.cancel"), action: onClose }}
    >
      <div className="raw-milk-collections__form">
        <div className="raw-milk-collections__autocomplete">
          <BrInput
            label={t("visits.table.donator")}
            placeholder={t("visits.form.searchByName")}
            value={donorQuery}
            status={errors.donor ? "danger" : undefined}
            feedbackText={errors.donor}
            onChange={(e) => {
              setDonorQuery(e.currentTarget.value);
              setDonor(null);
            }}
          />
          {donorResults.length > 0 && (
            <ul className="raw-milk-collections__autocomplete-list">
              {donorResults.map((d) => (
                <li
                  key={d.id}
                  onClick={() => {
                    setDonor(d);
                    setDonorQuery(d.name);
                    setDonorResults([]);
                  }}
                >
                  {d.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <BrInput
          type="number"
          label={t("common.volumeMl")}
          value={volumeMl}
          status={errors.volumeMl ? "danger" : undefined}
          feedbackText={errors.volumeMl}
          onChange={(e) => setVolumeMl(e.currentTarget.value)}
        />
        <BrInput
          type="datetime-local"
          label={t("rawMilk.form.collectionDate")}
          value={collectionDate}
          status={errors.collectionDate ? "danger" : undefined}
          feedbackText={errors.collectionDate}
          onChange={(e) => setCollectionDate(e.currentTarget.value)}
        />
        <BrInput
          type="datetime-local"
          label={t("rawMilk.form.receivedAt")}
          value={receivedAt}
          status={errors.receivedAt ? "danger" : undefined}
          feedbackText={errors.receivedAt}
          onChange={(e) => setReceivedAt(e.currentTarget.value)}
        />
        {errors.general && <p className="raw-milk-collections__error">{errors.general}</p>}
      </div>
    </BrModal>
  );
}

// --- Modal de Detalhes (substitui o "drawer" — a lib nao tem componente de drawer) ---

function getActiveStep(collection: RawMilkCollection) {
  if (collection.storageStatus === "USED_IN_BATCH" || collection.storageStatus === "DISCARDED") return 3;
  if (collection.triageStatus !== "PENDING") return 2;
  return 1;
}

function DetailsModal({
  collection,
  onClose,
}: {
  collection: RawMilkCollection | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (!collection) return null;
  const activeStep = getActiveStep(collection);
  const steps = [
    t("rawMilk.details.steps.extracted"),
    t("rawMilk.details.steps.received"),
    t("rawMilk.details.steps.triaged"),
    t("rawMilk.details.steps.usedOrDiscarded"),
  ];

  return (
    <BrModal isOpen showClose onClose={onClose} title={t("rawMilk.details.title")}>
      <p><strong>{t("visits.table.donator")}:</strong> {collection.donorName ?? collection.donorId}</p>
      <p><strong>{t("common.volume")}:</strong> {collection.volumeMl} ml</p>
      <p><strong>{t("rawMilk.table.expiration")}:</strong> {formatDate(collection.expirationDate)}</p>
      <p><strong>{t("common.status")}:</strong> {getStatusTag(collection.triageStatus, t)}</p>

      <h4>{t("rawMilk.details.timeline")}</h4>
      <ol className="raw-milk-collections__timeline">
        {steps.map((step, index) => (
          <li
            key={step}
            className={
              "raw-milk-collections__timeline-item" +
              (index < activeStep ? " raw-milk-collections__timeline-item--active" : "")
            }
          >
            {step}
          </li>
        ))}
      </ol>

      {collection.observations && (
        <>
          <h4>{t("rawMilk.details.clinicalObservations")}</h4>
          <p>{collection.observations}</p>
        </>
      )}

      {collection.triageStatus === "REJECTED" && (
        <>
          <h4>{t("rawMilk.details.discardReason")}</h4>
          <p>{collection.discardReason ?? t("rawMilk.details.notInformed")}</p>
        </>
      )}
    </BrModal>
  );
}
