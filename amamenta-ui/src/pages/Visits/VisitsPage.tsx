import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BrButton,
  BrInput,
  BrModal,
  BrSelect,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./VisitsPage.css";

type VisitType = "DELIVERY" | "COLLECTION";
type VisitStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";
type VisitsPageMode = "schedule" | "today" | "history";

type Visit = {
  id: string;
  donatorId: string;
  donatorName: string | null;
  donatorPhone: string | null;
  donatorAddress: string | null;
  donatorNeighborhood: string | null;
  donatorCity: string | null;
  type: VisitType;
  status: VisitStatus;
  scheduledAt?: string | null;
  needsKit: boolean;
  zipCode?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  observations?: string | null;
};

type Donator = {
  id: string;
  name: string;
};

type VisitsResponse = {
  data: Visit[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CepResponse = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
};

function todayInputValue() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function formatPhone(value?: string | null) {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return value;
}

function formatDateTime(value: string | null | undefined, emptyLabel: string) {
  if (!value) return emptyLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyLabel;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function getTypeLabel(type: VisitType, t: (key: string) => string) {
  return type === "DELIVERY" ? t("visits.type.deliveryShort") : t("visits.type.collection");
}

function getStatusTag(status: VisitStatus, t: (key: string) => string) {
  if (status === "COMPLETED") return <BrTag color="success" value={t("visits.status.completed")} />;
  if (status === "CANCELED") return <BrTag color="danger" value={t("visits.status.canceled")} />;
  return <BrTag color="warning" value={t("visits.status.scheduled")} />;
}

export default function VisitsPage({ mode = "schedule" }: { mode?: VisitsPageMode }) {
  const { t } = useTranslation();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [status, setStatus] = useState<VisitStatus>(
    mode === "history" ? "COMPLETED" : "SCHEDULED",
  );
  const [date, setDate] = useState(mode === "today" ? todayInputValue() : "");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadVisits() {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, unknown> = { status, page, limit };

      if (date) {
        params.dateFrom = `${date}T00:00:00`;
        params.dateTo = `${date}T23:59:59`;
      }

      const response = await api.get<VisitsResponse>("/visits", { params });
      setVisits(response.data.data);
      setTotal(response.data.meta.total);
    } catch {
      setError(t("visits.loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVisits();
  }, [status, page, limit, t]);

  function handleFilter() {
    if (page === 1) {
      void loadVisits();
      return;
    }
    setPage(1);
  }

  async function updateStatus(visit: Visit, nextStatus: VisitStatus) {
    await api.patch(`/visits/${visit.id}/status`, { status: nextStatus });
    await loadVisits();
  }

  const columns = useMemo<BrTableColumn<Visit>[]>(
    () => [
      {
        key: "donatorName",
        title: t("visits.table.donator"),
        width: "22%",
        boldHeading: true,
        render: (value, row) => String(value ?? row.donatorId),
      },
      {
        key: "donatorPhone",
        title: t("donatorsOverview.table.phone"),
        width: "14%",
        render: (value) => formatPhone(String(value ?? "")),
      },
      {
        key: "donatorAddress",
        title: t("visits.table.address"),
        width: "24%",
        render: (_value, row) =>
          [
            row.address ?? row.donatorAddress,
            row.addressNumber,
            row.neighborhood ?? row.donatorNeighborhood,
            row.city ?? row.donatorCity,
          ]
            .filter(Boolean)
            .join(" - ") || "-",
      },
      {
        key: "type",
        title: t("visits.table.type"),
        width: "10%",
        render: (value) => getTypeLabel(value as VisitType, t),
      },
      {
        key: "scheduledAt",
        title: t("visits.table.dateTime"),
        width: "14%",
        render: (value) => formatDateTime(String(value ?? ""), t("visits.noDate")),
      },
      {
        key: "needsKit",
        title: t("visits.table.kit"),
        width: "8%",
        render: (value) => (value ? t("common.yes") : t("common.no")),
      },
      {
        key: "status",
        title: t("common.status"),
        width: "10%",
        render: (value) => getStatusTag(value as VisitStatus, t),
      },
      {
        key: "id",
        title: t("common.actions"),
        align: "right",
        width: "12%",
        render: (_value, row) => (
          <div className="visits-page__row-actions">
            <BrButton
              aria-label={t("visits.actions.editVisit", { name: row.donatorName ?? t("visits.table.donatorFallback") })}
              circle
              icon="edit"
              onClick={() => {
                setEditingVisit(row);
                setIsModalOpen(true);
              }}
              size="small"
            />
            {row.status === "SCHEDULED" && (
              <>
                <BrButton
                  aria-label={t("visits.actions.markCompleted")}
                  circle
                  icon="check"
                  onClick={() => void updateStatus(row, "COMPLETED")}
                  size="small"
                />
                <BrButton
                  aria-label={t("visits.actions.cancelVisit")}
                  circle
                  color="danger"
                  icon="ban"
                  onClick={() => void updateStatus(row, "CANCELED")}
                  size="small"
                />
              </>
            )}
          </div>
        ),
      },
    ],
    [t],
  );

  const allStatusTabs: { key: VisitStatus; label: string }[] = [
    { key: "SCHEDULED", label: t("visits.tabs.scheduled") },
    { key: "COMPLETED", label: t("visits.tabs.completed") },
    { key: "CANCELED", label: t("visits.tabs.canceled") },
  ];
  const statusTabs = allStatusTabs.filter(
    (tab) => mode !== "history" || tab.key !== "SCHEDULED",
  );

  const title = t(`visits.pages.${mode}.title`);
  const description = t(`visits.pages.${mode}.description`);
  const tableTitle = t(`visits.pages.${mode}.tableTitle`);

  return (
    <section className="visits-page">
      <header className="visits-page__header">
        <div>
          <h1 className="visits-page__title">{title}</h1>
          <p className="visits-page__description">
            {description}
          </p>
        </div>

        <BrButton
          icon="plus"
          onClick={() => {
            setEditingVisit(null);
            setIsModalOpen(true);
          }}
          primary
        >
          {t("visits.newVisit")}
        </BrButton>
      </header>

      <div className="visits-page__tabs">
        {statusTabs.map((tab) => (
          <button
            className={
              "visits-page__tab" + (status === tab.key ? " visits-page__tab--active" : "")
            }
            key={tab.key}
            onClick={() => {
              setStatus(tab.key);
              setPage(1);
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode !== "today" && (
        <div className="visits-page__filters">
          <BrInput
            label={t("visits.filters.routeDate")}
            onChange={(event) => setDate(event.currentTarget.value)}
            type="date"
            value={date}
          />
          <div className="visits-page__filter-actions">
            <BrButton onClick={() => setDate("")} secondary>
              {t("visits.filters.clear")}
            </BrButton>
            <BrButton onClick={handleFilter} primary>
              {t("visits.filters.apply")}
            </BrButton>
          </div>
        </div>
      )}

      {error && <div className="visits-page__error">{error}</div>}

      <div className="visits-page__table">
        <BrTable
          columns={columns}
          data={visits}
          density="small"
          emptyContent={t("visits.table.empty")}
          isLoading={loading}
          paginationProps={{
            page,
            perPage: limit,
            total,
            showTotalizers: true,
            itemTitleSingular: t("visits.pagination.singular"),
            itemTitlePlural: t("visits.pagination.plural"),
            onPageChange: setPage,
            onPerPageChange: setLimit,
          }}
          title={tableTitle}
        />
      </div>

      <VisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => {
          setIsModalOpen(false);
          void loadVisits();
        }}
        visit={editingVisit}
      />
    </section>
  );
}

function VisitModal({
  isOpen,
  onClose,
  onSaved,
  visit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  visit: Visit | null;
}) {
  const { t } = useTranslation();
  const [donatorQuery, setDonatorQuery] = useState("");
  const [donatorResults, setDonatorResults] = useState<Donator[]>([]);
  const [donator, setDonator] = useState<Donator | null>(null);
  const [type, setType] = useState<VisitType>("DELIVERY");
  const [scheduledAt, setScheduledAt] = useState("");
  const [needsKit, setNeedsKit] = useState(true);
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [observations, setObservations] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const isEditing = Boolean(visit);
  const typeOptions = [
    { label: t("visits.type.delivery"), value: "DELIVERY" },
    { label: t("visits.type.collection"), value: "COLLECTION" },
  ];

  useEffect(() => {
    if (!isOpen) return;

    setDonatorQuery(visit?.donatorName ?? "");
    setDonator(visit ? { id: visit.donatorId, name: visit.donatorName ?? "" } : null);
    setType(visit?.type ?? "DELIVERY");
    setScheduledAt(toDateTimeLocal(visit?.scheduledAt));
    setNeedsKit(visit?.needsKit ?? true);
    setZipCode(visit?.zipCode ?? "");
    setAddress(visit?.address ?? "");
    setAddressNumber(visit?.addressNumber ?? "");
    setNeighborhood(visit?.neighborhood ?? "");
    setCity(visit?.city ?? "");
    setState(visit?.state ?? "");
    setObservations(visit?.observations ?? "");
    setError(null);
  }, [isOpen, visit]);

  useEffect(() => {
    if (!donatorQuery || donatorQuery === donator?.name || isEditing) {
      setDonatorResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const response = await api.get<{ data: Donator[] }>("/donators", {
        params: { name: donatorQuery, limit: 10 },
      });
      setDonatorResults(response.data.data);
    }, 300);

    return () => clearTimeout(timeout);
  }, [donatorQuery, donator, isEditing]);

  async function handleSubmit() {
    if (!isEditing && !donator) {
      setError(t("visits.form.selectDonator"));
      return;
    }

    const payload = {
      type,
      scheduledAt: scheduledAt || null,
      needsKit,
      zipCode: zipCode || null,
      address: address || null,
      addressNumber: addressNumber || null,
      neighborhood: neighborhood || null,
      city: city || null,
      state: state || null,
      observations: observations || null,
    };

    try {
      if (visit) {
        await api.patch(`/visits/${visit.id}`, payload);
      } else {
        await api.post("/visits", { ...payload, donatorId: donator?.id });
      }
      onSaved();
    } catch {
      setError(t("visits.form.saveError"));
    }
  }

  async function loadAddressByCep(value: string) {
    const digits = value.replace(/\D/g, "");

    setZipCode(digits);
    if (digits.length !== 8) return;

    setCepLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${digits}`);
      if (!response.ok) throw new Error("CEP not found");
      const data = (await response.json()) as CepResponse;

      setAddress(data.street);
      setNeighborhood(data.neighborhood);
      setCity(data.city);
      setState(data.state);
    } catch {
      setError(t("visits.form.cepError"));
    } finally {
      setCepLoading(false);
    }
  }

  return (
    <BrModal
      isOpen={isOpen}
      onClose={onClose}
      primaryAction={{ label: t("common.save"), action: () => void handleSubmit() }}
      secondaryAction={{ label: t("common.cancel"), action: onClose }}
      showClose
      title={visit ? t("visits.form.editTitle") : t("visits.form.newTitle")}
    >
      <div className="visits-page__form">
        {!isEditing && (
          <div className="visits-page__autocomplete">
            <BrInput
              feedbackText={error ?? undefined}
              label={t("visits.table.donator")}
              onChange={(event) => {
                setDonatorQuery(event.currentTarget.value);
                setDonator(null);
              }}
              placeholder={t("visits.form.searchByName")}
              status={error ? "danger" : undefined}
              value={donatorQuery}
            />
            {donatorResults.length > 0 && (
              <ul className="visits-page__autocomplete-list">
                {donatorResults.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setDonator(item);
                      setDonatorQuery(item.name);
                      setDonatorResults([]);
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <BrSelect
          label={t("visits.table.type")}
          onChange={(value) => {
            const nextType = String(value) as VisitType;
            setType(nextType);
            setNeedsKit(nextType === "DELIVERY");
          }}
          options={typeOptions}
          value={type}
        />
        <BrInput
          label={t("visits.form.dateTime")}
          onChange={(event) => setScheduledAt(event.currentTarget.value)}
          type="datetime-local"
          value={scheduledAt}
        />
        <div className="visits-page__address-grid">
          <BrInput
            feedbackText={cepLoading ? t("visits.form.searchingCep") : undefined}
            label={t("visits.form.cep")}
            maxLength={8}
            onChange={(event) => void loadAddressByCep(event.currentTarget.value)}
            placeholder="77000000"
            value={zipCode}
          />
          <BrInput
            label={t("visits.form.numberOrLot")}
            onChange={(event) => setAddressNumber(event.currentTarget.value)}
            value={addressNumber}
          />
        </div>
        <BrInput
          label={t("visits.table.address")}
          onChange={(event) => setAddress(event.currentTarget.value)}
          value={address}
        />
        <div className="visits-page__address-grid">
          <BrInput
            label={t("visits.form.neighborhood")}
            onChange={(event) => setNeighborhood(event.currentTarget.value)}
            value={neighborhood}
          />
          <BrInput
            label={t("visits.form.city")}
            onChange={(event) => setCity(event.currentTarget.value)}
            value={city}
          />
          <BrInput
            label={t("visits.form.uf")}
            maxLength={2}
            onChange={(event) => setState(event.currentTarget.value.toUpperCase())}
            value={state}
          />
        </div>
        <label className="visits-page__checkbox">
          <input
            checked={needsKit}
            onChange={(event) => setNeedsKit(event.currentTarget.checked)}
            type="checkbox"
          />
          {t("visits.form.needsKit")}
        </label>
        <BrInput
          label={t("visits.form.observations")}
          onChange={(event) => setObservations(event.currentTarget.value)}
          value={observations}
        />
      </div>
    </BrModal>
  );
}
