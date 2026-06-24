import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BrButton,
  BrInput,
  BrModal,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./StoragePage.css";

type StockStatus = "AVAILABLE" | "DISTRIBUTED" | "EXPIRED" | "DISCARDED";

type StockFilterTab = StockStatus | "ALL";

type PasteurizedMilkUnit = {
  id: string;
  batchId: string;
  volumeMl: number;
  expirationDate: string;
  stockStatus: StockStatus;
  distributedAt?: string | null;
  discardReason?: string | null;
  recipientIdentifier?: string | null;
  createdAt: string;
  updatedAt: string;
};

type PasteurizedMilkResponse = {
  data: PasteurizedMilkUnit[];
};

const TABS: { key: StockFilterTab; label: string }[] = [
  { key: "AVAILABLE", label: "Disponiveis" },
  { key: "DISTRIBUTED", label: "Distribuidas" },
  { key: "DISCARDED", label: "Descartes" },
  { key: "ALL", label: "Todas" },
];

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function getDaysUntilExpiration(value: string) {
  const expiration = new Date(value);
  if (Number.isNaN(expiration.getTime())) return Number.POSITIVE_INFINITY;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiration.setHours(0, 0, 0, 0);

  return Math.ceil((expiration.getTime() - today.getTime()) / 86_400_000);
}

function isExpired(unit: PasteurizedMilkUnit) {
  return getDaysUntilExpiration(unit.expirationDate) < 0;
}

function isDistributionBlocked(unit: PasteurizedMilkUnit) {
  return unit.stockStatus !== "AVAILABLE" || isExpired(unit);
}

function getStatusTag(unit: PasteurizedMilkUnit) {
  if (unit.stockStatus === "DISTRIBUTED") {
    return <BrTag color="info" value="Distribuida" />;
  }

  if (unit.stockStatus === "DISCARDED") {
    return <BrTag color="danger" value="Descartada" />;
  }

  if (unit.stockStatus === "EXPIRED" || isExpired(unit)) {
    return <BrTag color="danger" value="Vencida" />;
  }

  const days = getDaysUntilExpiration(unit.expirationDate);
  if (days <= 7) return <BrTag color="warning" value="Prioridade" />;

  return <BrTag color="success" value="Disponivel" />;
}

function getValidityLabel(unit: PasteurizedMilkUnit) {
  const days = getDaysUntilExpiration(unit.expirationDate);
  if (!Number.isFinite(days)) return "Validade indisponivel";
  if (days < 0) return "Vencida";
  if (days === 0) return "Vence hoje";
  if (days === 1) return "Vence em 1 dia";
  return `Vence em ${days} dias`;
}

function getShortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }

  return fallback;
}

export default function StoragePage() {
  const [activeTab, setActiveTab] = useState<StockFilterTab>("AVAILABLE");
  const [units, setUnits] = useState<PasteurizedMilkUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<PasteurizedMilkUnit | null>(null);
  const [distributionUnit, setDistributionUnit] = useState<PasteurizedMilkUnit | null>(null);

  async function loadUnits() {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<PasteurizedMilkResponse>("/donations/pasteurized-milk", {
        params: activeTab === "ALL" ? undefined : { stockStatus: activeTab },
      });

      setUnits(response.data.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Nao foi possivel carregar o estoque."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUnits();
  }, [activeTab]);

  const orderedUnits = useMemo(
    () =>
      [...units].sort((first, second) => {
        const firstPriority = first.stockStatus === "AVAILABLE" ? 0 : 1;
        const secondPriority = second.stockStatus === "AVAILABLE" ? 0 : 1;
        if (firstPriority !== secondPriority) return firstPriority - secondPriority;
        return getDaysUntilExpiration(first.expirationDate) - getDaysUntilExpiration(second.expirationDate);
      }),
    [units],
  );

  const summary = useMemo(() => {
    return units.reduce(
      (acc, unit) => {
        if (unit.stockStatus === "AVAILABLE" && !isExpired(unit)) {
          acc.availableUnits += 1;
          acc.availableVolume += unit.volumeMl;
        }

        if (unit.stockStatus === "AVAILABLE" && getDaysUntilExpiration(unit.expirationDate) <= 7) {
          acc.priorityUnits += 1;
        }

        if (unit.stockStatus === "DISTRIBUTED") acc.distributedUnits += 1;
        if (unit.stockStatus === "DISCARDED") acc.discardedUnits += 1;
        if (unit.stockStatus === "EXPIRED" || isExpired(unit)) acc.blockedUnits += 1;

        return acc;
      },
      {
        availableUnits: 0,
        availableVolume: 0,
        blockedUnits: 0,
        discardedUnits: 0,
        distributedUnits: 0,
        priorityUnits: 0,
      },
    );
  }, [units]);

  const columns = useMemo<BrTableColumn<PasteurizedMilkUnit>[]>(
    () => [
      {
        key: "id",
        title: "Unidade",
        width: "14%",
        boldHeading: true,
        render: (_value: unknown, row: PasteurizedMilkUnit) => `#${getShortId(row.id)}`,
      },
      { key: "batchId", title: "Lote", width: "16%", render: (value: unknown) => getShortId(String(value)) },
      { key: "volumeMl", title: "Volume", width: "12%", render: (value: unknown) => `${value} ml` },
      {
        key: "expirationDate",
        title: "Validade",
        width: "18%",
        render: (_value: unknown, row: PasteurizedMilkUnit) => (
          <span className={isExpired(row) ? "storage__validity storage__validity--blocked" : "storage__validity"}>
            {formatDate(row.expirationDate)}
            <small>{getValidityLabel(row)}</small>
          </span>
        ),
      },
      {
        key: "stockStatus",
        title: "Status",
        width: "16%",
        render: (_value: unknown, row: PasteurizedMilkUnit) => getStatusTag(row),
      },
      {
        key: "recipientIdentifier",
        title: "Destino",
        width: "14%",
        render: (value: unknown) => (value as string | null) ?? "-",
      },
      {
        key: "updatedAt",
        title: "Acoes",
        align: "right",
        width: "14%",
        render: (_value: unknown, row: PasteurizedMilkUnit) => (
          <div className="storage__table-actions">
            <BrButton
              aria-label={`Ver rastreabilidade da unidade ${getShortId(row.id)}`}
              circle
              icon="eye"
              size="small"
              onClick={() => setSelectedUnit(row)}
            />
            <BrButton
              aria-label={`Distribuir unidade ${getShortId(row.id)}`}
              circle
              disabled={isDistributionBlocked(row)}
              icon="paper-plane"
              size="small"
              onClick={() => setDistributionUnit(row)}
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <section className="storage">
      <header className="storage__header">
        <div>
          <h1 className="storage__title">Estoque de Leite Pasteurizado</h1>
          <p className="storage__description">
            Controle de validade, rastreabilidade e distribuicao segura das unidades finais.
          </p>
        </div>
      </header>

      <div className="storage__summary" aria-label="Resumo do estoque">
        <article className="storage__summary-card storage__summary-card--primary">
          <span className="storage__summary-label">Disponivel</span>
          <strong>{summary.availableVolume} ml</strong>
          <small>{summary.availableUnits} unidades aptas para saida</small>
        </article>
        <article className="storage__summary-card">
          <span className="storage__summary-label">Prioridade por validade</span>
          <strong>{summary.priorityUnits}</strong>
          <small>unidades vencem em ate 7 dias</small>
        </article>
        <article className="storage__summary-card">
          <span className="storage__summary-label">Distribuidas</span>
          <strong>{summary.distributedUnits}</strong>
          <small>saidas registradas</small>
        </article>
        <article className="storage__summary-card storage__summary-card--blocked">
          <span className="storage__summary-label">Bloqueadas</span>
          <strong>{summary.blockedUnits + summary.discardedUnits}</strong>
          <small>vencidas ou descartadas</small>
        </article>
      </div>


      <div className="storage__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={"storage__tab" + (activeTab === tab.key ? " storage__tab--active" : "")}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="storage__error">{error}</div>}

      <div className="storage__table">
        <BrTable
          columns={columns}
          data={orderedUnits}
          density="small"
          emptyContent="Nenhuma unidade encontrada."
          isLoading={loading}
          title="Unidades de leite pasteurizado"
        />
      </div>

      <DetailsModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      <DistributionModal
        unit={distributionUnit}
        onClose={() => setDistributionUnit(null)}
        onDistributed={() => {
          setDistributionUnit(null);
          void loadUnits();
        }}
      />
    </section>
  );
}

function DetailsModal({
  unit,
  onClose,
}: {
  unit: PasteurizedMilkUnit | null;
  onClose: () => void;
}) {
  if (!unit) return null;

  return (
    <BrModal isOpen showClose onClose={onClose} title="Rastreabilidade da unidade">
      <div className="storage__details">
        <p>
          <strong>Unidade:</strong> #{getShortId(unit.id)}
        </p>
        <p>
          <strong>Lote de pasteurizacao:</strong> {unit.batchId}
        </p>
        <p>
          <strong>Volume:</strong> {unit.volumeMl} ml
        </p>
        <p>
          <strong>Validade:</strong> {formatDate(unit.expirationDate)} ({getValidityLabel(unit)})
        </p>
        <p>
          <strong>Status:</strong> {getStatusTag(unit)}
        </p>
        <p>
          <strong>Destinatario:</strong> {unit.recipientIdentifier ?? "Nao distribuida"}
        </p>
        <p>
          <strong>Distribuida em:</strong> {formatDate(unit.distributedAt)}
        </p>
        {unit.discardReason && (
          <p>
            <strong>Motivo do descarte:</strong> {unit.discardReason}
          </p>
        )}
      </div>
    </BrModal>
  );
}

function DistributionModal({
  unit,
  onClose,
  onDistributed,
}: {
  unit: PasteurizedMilkUnit | null;
  onClose: () => void;
  onDistributed: () => void;
}) {
  const [recipientIdentifier, setRecipientIdentifier] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!unit) return;
    setRecipientIdentifier("");
    setFeedback(null);
  }, [unit]);

  if (!unit) return null;

  const currentUnit = unit;

  async function handleDistribution() {
    if (!recipientIdentifier.trim()) {
      setFeedback("Informe o destinatario antes de confirmar a distribuicao.");
      return;
    }

    if (isDistributionBlocked(currentUnit)) {
      setFeedback("Esta unidade nao pode sair do estoque porque esta vencida, descartada ou ja distribuida.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await api.patch(`/donations/pasteurized-milk/${currentUnit.id}/distribute`, {
        recipientIdentifier: recipientIdentifier.trim(),
      });
      onDistributed();
    } catch (distributionError) {
      setFeedback(getErrorMessage(distributionError, "Nao foi possivel distribuir esta unidade."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BrModal
      isOpen
      showClose
      onClose={onClose}
      title="Confirmar distribuicao"
      primaryAction={{
        label: submitting ? "Distribuindo..." : "Confirmar distribuicao",
        action: () => void handleDistribution(),
      }}
      secondaryAction={{ label: "Cancelar", action: onClose }}
    >
      <div className="storage__form">
        <div className="storage__confirmation">
          <strong>Unidade #{getShortId(unit.id)}</strong>
          <span>{unit.volumeMl} ml</span>
          <span>Validade: {formatDate(unit.expirationDate)}</span>
        </div>

        <BrInput
          label="Destinatario"
          placeholder="Ex: UTI Neonatal, paciente ou setor"
          value={recipientIdentifier}
          status={feedback ? "danger" : undefined}
          feedbackText={feedback ?? undefined}
          onChange={(event) => setRecipientIdentifier(event.currentTarget.value)}
        />

        <p className="storage__safety-note">
          A saida so sera registrada para unidades disponiveis e dentro da validade.
        </p>
      </div>
    </BrModal>
  );
}
