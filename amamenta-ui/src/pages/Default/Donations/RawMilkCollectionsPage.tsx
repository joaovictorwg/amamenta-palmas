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
import { useAuth } from "@/contexts/AuthContext/useAuth";
import type { RawMilkCollection, RawMilkResponse, RawMilkFilterTab } from "@/types/rawMilk";

import "./RawMilkCollectionsPage.css";

const TABS: { key: RawMilkFilterTab; label: string }[] = [
  { key: "PENDING", label: "Pendentes" },
  { key: "APPROVED", label: "Aprovados" },
  { key: "REJECTED", label: "Rejeitados" },
  { key: "EXPIRED", label: "Vencidos" },
];

type Donator = { id: string; name: string };

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function getStatusTag(status: RawMilkCollection["triageStatus"]) {
  if (status === "APPROVED") return <BrTag color="success" value="Aprovado" />;
  if (status === "REJECTED") return <BrTag color="danger" value="Rejeitado" />;
  return <BrTag color="warning" value="Pendente" />;
}

export default function RawMilkCollectionsPage() {
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
      setError("Nao foi possivel carregar as coletas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCollections();
  }, [activeTab, page, limit]);

  function handleTabChange(tab: RawMilkFilterTab) {
    setActiveTab(tab);
    setPage(1);
  }

  const rows = useMemo(() => collections, [collections]);

  const columns = useMemo<BrTableColumn<RawMilkCollection>[]>(
    () => [
     { key: "donorName", title: "Doadora", width: "24%", boldHeading: true, render: (v: unknown, row: RawMilkCollection) => (v as string | null) ?? row.donorId },
      { key: "volumeMl", title: "Volume (ml)", width: "14%" },
     { key: "expirationDate", title: "Validade", width: "16%", render: (v: unknown) => formatDate(String(v)) },
     { key: "triageStatus", title: "Status", width: "16%", render: (v: unknown) => getStatusTag(v as RawMilkCollection["triageStatus"]) },
         {
        key: "id",
        title: "Acoes",
        align: "right",
        width: "12%",
        render: (_v: unknown, row: RawMilkCollection) => (
          <BrButton
            aria-label={`Ver detalhes da coleta de ${row.donorName ?? row.donorId}`}
            circle
            icon="eye"
            size="small"
            onClick={() => setSelected(row)}
          />
        ),
      },
    ],
    [],
  );

  return (
    <section className="raw-milk-collections">
      <header className="raw-milk-collections__header">
        <div>
          <h1 className="raw-milk-collections__title">Gestao de Coletas</h1>
          <p className="raw-milk-collections__description">
            Triagem e acompanhamento dos frascos de leite cru recebidos.
          </p>
        </div>
        <BrButton icon="plus" primary onClick={() => setIsNewModalOpen(true)}>
          Nova Coleta
        </BrButton>
      </header>

      <div className="raw-milk-collections__tabs">
        {TABS.map((tab) => (
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
          emptyContent="Nenhuma coleta encontrada."
          isLoading={loading}
          paginationProps={{
            page,
            perPage: limit,
            total,
            showTotalizers: true,
            itemTitleSingular: "coleta",
            itemTitlePlural: "coletas",
            onPageChange: setPage,
            onPerPageChange: setLimit,
          }}
          title="Coletas de leite cru"
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
    if (!donor) newErrors.donor = "Selecione a doadora";
    if (!volumeMl || Number(volumeMl) <= 0) newErrors.volumeMl = "Informe o volume";
    if (!collectionDate) newErrors.collectionDate = "Informe a data da coleta";
    if (!receivedAt) newErrors.receivedAt = "Informe a data de recebimento";
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
      let message = "Erro ao registrar coleta.";
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
      title="Nova Coleta"
      primaryAction={{ label: submitting ? "Salvando..." : "Registrar", action: () => void handleSubmit() }}
      secondaryAction={{ label: "Cancelar", action: onClose }}
    >
      <div className="raw-milk-collections__form">
        <div className="raw-milk-collections__autocomplete">
          <BrInput
            label="Doadora"
            placeholder="Buscar por nome"
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
          label="Volume (ml)"
          value={volumeMl}
          status={errors.volumeMl ? "danger" : undefined}
          feedbackText={errors.volumeMl}
          onChange={(e) => setVolumeMl(e.currentTarget.value)}
        />
        <BrInput
          type="datetime-local"
          label="Data da coleta"
          value={collectionDate}
          status={errors.collectionDate ? "danger" : undefined}
          feedbackText={errors.collectionDate}
          onChange={(e) => setCollectionDate(e.currentTarget.value)}
        />
        <BrInput
          type="datetime-local"
          label="Data de recebimento"
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

const STEPS = ["Extraido", "Recebido", "Triado", "Utilizado / Descartado"];

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
  if (!collection) return null;
  const activeStep = getActiveStep(collection);

  return (
    <BrModal isOpen showClose onClose={onClose} title="Detalhes da coleta">
      <p><strong>Doadora:</strong> {collection.donorName ?? collection.donorId}</p>
      <p><strong>Volume:</strong> {collection.volumeMl} ml</p>
      <p><strong>Validade:</strong> {formatDate(collection.expirationDate)}</p>
      <p><strong>Status:</strong> {getStatusTag(collection.triageStatus)}</p>

      <h4>Linha do tempo</h4>
      <ol className="raw-milk-collections__timeline">
        {STEPS.map((step, index) => (
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
          <h4>Observacoes clinicas</h4>
          <p>{collection.observations}</p>
        </>
      )}

      {collection.triageStatus === "REJECTED" && (
        <>
          <h4>Motivo de descarte</h4>
          <p>{collection.discardReason ?? "Nao informado"}</p>
        </>
      )}
    </BrModal>
  );
}