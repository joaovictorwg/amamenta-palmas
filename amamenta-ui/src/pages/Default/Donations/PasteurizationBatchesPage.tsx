import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BrButton,
  BrInput,
  BrMessage,
  BrModal,
  BrTable,
  BrTag,
  BrSelect,
  BrTextarea,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { approvePasteurizationBatch, api, rejectPasteurizationBatch } from "@/services/api";
import type { RawMilkCollection, RawMilkResponse } from "@/types/rawMilk";

import "./PasteurizationBatchesPage.css";

type PasteurizationBatch = {
  id: string;
  batchCode: string;
  pasteurizedAt: string;
  operatorId: string;
  microbiologyStatus: "PENDING" | "APPROVED" | "REJECTED";
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
};

type PasteurizationBatchResponse = {
  data: PasteurizationBatch[];
};

type ModalView = "details" | "approve" | "reject";

type FeedbackState = {
  status: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
} | null;

type RawMilkOption = {
  label: string;
  value: string;
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

function getStatusTag(status: PasteurizationBatch["microbiologyStatus"]) {
  if (status === "APPROVED") {
    return <BrTag color="success" value="Aprovado" />;
  }

  if (status === "REJECTED") {
    return <BrTag color="danger" value="Rejeitado" />;
  }

  return <BrTag color="warning" value="Pendente" />;
}

export default function PasteurizationBatchesPage() {
  const [batches, setBatches] = useState<PasteurizationBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<PasteurizationBatch | null>(null);
  const [modalView, setModalView] = useState<ModalView>("details");
  const [createBatchCode, setCreateBatchCode] = useState("");
  const [createPasteurizedAt, setCreatePasteurizedAt] = useState("");
  const [createOperatorId, setCreateOperatorId] = useState("");
  const [createObservations, setCreateObservations] = useState("");
  const [createRawMilkIds, setCreateRawMilkIds] = useState<string[]>([]);
  const [availableRawMilk, setAvailableRawMilk] = useState<RawMilkCollection[]>([]);
  const [availableRawMilkLoading, setAvailableRawMilkLoading] = useState(false);
  const [availableRawMilkError, setAvailableRawMilkError] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<FeedbackState>(null);
  const [approveVolumeFinalMl, setApproveVolumeFinalMl] = useState("");
  const [approveGeneratedUnits, setApproveGeneratedUnits] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [pageMessage, setPageMessage] = useState<FeedbackState>(null);
  const [modalMessage, setModalMessage] = useState<FeedbackState>(null);
  const [submitting, setSubmitting] = useState(false);

  const rawMilkOptions = useMemo<RawMilkOption[]>(
    () =>
      availableRawMilk.map((milk) => ({
        value: milk.id,
        label: `${milk.donorName ?? milk.donorId} - ${milk.volumeMl} ml - ${formatDateTime(milk.collectionDate)}`,
      })),
    [availableRawMilk],
  );

  const approveVolumeValue = Number(approveVolumeFinalMl);
  const approveUnitsValue = Number(approveGeneratedUnits);
  const canApprove = Number.isInteger(approveVolumeValue) && approveVolumeValue > 0
    && Number.isInteger(approveUnitsValue) && approveUnitsValue > 0;
  const canReject = rejectReason.trim().length > 0;
  const canCreateBatch =
    createBatchCode.trim().length > 0 &&
    createPasteurizedAt.trim().length > 0 &&
    createOperatorId.trim().length > 0 &&
    createRawMilkIds.length > 0;

  useEffect(() => {
    if (!pageMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPageMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [pageMessage]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      setCreateMessage(null);
      return;
    }

    async function loadAvailableRawMilk() {
      setAvailableRawMilkLoading(true);
      setAvailableRawMilkError(null);

      try {
        const response = await api.get<RawMilkResponse>("/donations/raw-milk", {
          params: {
            page: 1,
            limit: 50,
            triageStatus: "APPROVED",
            storageStatus: "STORED",
          },
        });

        setAvailableRawMilk(response.data.data);
      } catch {
        setAvailableRawMilkError("Nao foi possivel carregar os frascos aprovados para o lote.");
      } finally {
        setAvailableRawMilkLoading(false);
      }
    }

    void loadAvailableRawMilk();
  }, [isCreateModalOpen]);

  async function loadBatches() {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<PasteurizationBatchResponse>("/donations/pasteurization-batches");
      setBatches(response.data.data);
    } catch {
      setError("Nao foi possivel carregar os lotes de pasteurização.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatch) {
      setModalView("details");
      setApproveVolumeFinalMl("");
      setApproveGeneratedUnits("");
      setRejectReason("");
      setModalMessage(null);
      return;
    }

    setModalView("details");
    setApproveVolumeFinalMl("");
    setApproveGeneratedUnits("");
    setRejectReason("");
    setModalMessage(null);
  }, [selectedBatch]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      setCreateBatchCode("");
      setCreatePasteurizedAt("");
      setCreateOperatorId("");
      setCreateObservations("");
      setCreateRawMilkIds([]);
      setCreateMessage(null);
    }
  }, [isCreateModalOpen]);

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return batches;
    }

    return batches.filter((batch) =>
      [batch.id, batch.batchCode, batch.operatorId, batch.microbiologyStatus, batch.observations ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [batches, search]);

  const columns = useMemo<BrTableColumn<PasteurizationBatch>[]>(
    () => [
      {
        key: "id",
        title: "ID",
        width: "34%",
        boldHeading: true,
        render: (value) => <span className="pasteurization-batches__cell-id">{String(value)}</span>,
      },
      {
        key: "pasteurizedAt",
        title: "Data",
        width: "24%",
        render: (value) => formatDateTime(String(value)),
      },
      {
        key: "microbiologyStatus",
        title: "Status Microbiológico",
        width: "20%",
        render: (value) => getStatusTag(value as PasteurizationBatch["microbiologyStatus"]),
      },
      {
        key: "updatedAt",
        title: "Ações",
        width: "22%",
        align: "right",
        render: (_value, row) => (
          <BrButton
            icon="eye"
            onClick={() => setSelectedBatch(row)}
            secondary
            size="small"
          >
            Ver Detalhes/Ações
          </BrButton>
        ),
      },
    ],
    [],
  );

  async function handleApprove() {
    if (!selectedBatch) {
      return;
    }

    if (!canApprove) {
      setModalMessage({
        status: "danger",
        title: "Validação obrigatória",
        message: "Informe um volume final válido e a quantidade de frascos gerados.",
      });
      return;
    }

    setSubmitting(true);
    setModalMessage({
      status: "info",
      title: "Processando",
      message: "Aguardando confirmação da aprovação do lote.",
    });

    try {
      await approvePasteurizationBatch(selectedBatch.id, {
        volumeFinalMl: approveVolumeValue,
        generatedUnits: approveUnitsValue,
      });
      setPageMessage({
        status: "success",
        title: "Sucesso",
        message: "Lote aprovado com sucesso.",
      });
      setModalMessage({
        status: "success",
        title: "Aprovado",
        message: "O lote foi aprovado e a tabela será atualizada.",
      });
      window.setTimeout(() => {
        setSelectedBatch(null);
      }, 700);
      await loadBatches();
    } catch {
      setModalMessage({
        status: "danger",
        title: "Erro",
        message: "Não foi possível aprovar o lote.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!selectedBatch) {
      return;
    }

    if (!canReject) {
      setModalMessage({
        status: "danger",
        title: "Validação obrigatória",
        message: "Informe a observação / justificativa antes de rejeitar o lote.",
      });
      return;
    }

    setSubmitting(true);
    setModalMessage({
      status: "info",
      title: "Processando",
      message: "Aguardando confirmação da rejeição do lote.",
    });

    try {
      await rejectPasteurizationBatch(selectedBatch.id, {
        reason: rejectReason.trim(),
      });
      setPageMessage({
        status: "success",
        title: "Sucesso",
        message: "Lote rejeitado com sucesso.",
      });
      setModalMessage({
        status: "success",
        title: "Rejeitado",
        message: "O lote foi rejeitado e a tabela será atualizada.",
      });
      window.setTimeout(() => {
        setSelectedBatch(null);
      }, 700);
      await loadBatches();
    } catch {
      setModalMessage({
        status: "danger",
        title: "Erro",
        message: "Não foi possível rejeitar o lote.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateBatch() {
    if (!canCreateBatch) {
      setCreateMessage({
        status: "danger",
        title: "Validação obrigatória",
        message: "Informe o código do lote, data, operador e ao menos um frasco aprovado.",
      });
      return;
    }

    setSubmitting(true);
    setCreateMessage({
      status: "info",
      title: "Processando",
      message: "Criando lote de pasteurização.",
    });

    try {
      await api.post("/donations/pasteurization-batches", {
        batchCode: createBatchCode.trim(),
        pasteurizedAt: createPasteurizedAt,
        operatorId: createOperatorId.trim(),
        rawMilkIds: createRawMilkIds,
        observations: createObservations.trim() || undefined,
      });

      setPageMessage({
        status: "success",
        title: "Sucesso",
        message: "Lote criado com sucesso.",
      });

      setCreateMessage({
        status: "success",
        title: "Lote criado",
        message: "O novo lote foi registrado e a tabela será atualizada.",
      });

      await loadBatches();

      window.setTimeout(() => {
        setIsCreateModalOpen(false);
      }, 700);
    } catch {
      setCreateMessage({
        status: "danger",
        title: "Erro",
        message: "Não foi possível criar o lote.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setSelectedBatch(null);
    setModalView("details");
    setApproveVolumeFinalMl("");
    setApproveGeneratedUnits("");
    setRejectReason("");
    setModalMessage(null);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setCreateMessage(null);
  }

  return (
    <section className="pasteurization-batches">
      <nav className="br-breadcrumb pasteurization-batches__breadcrumb" aria-label="Breadcrumb">
        <ol className="crumb-list">
          <li className="crumb-list__item">
            <Link className="crumb-link" to="/doacoes">Doações</Link>
          </li>
          <li className="crumb-list__item crumb-list__item--active" aria-current="page">
            <span>Lotes</span>
          </li>
        </ol>
      </nav>

      <header className="pasteurization-batches__header">
        <div>
          <h1 className="pasteurization-batches__title">Lotes de Pasteurização</h1>
          <p className="pasteurization-batches__description">
            Lista dos ciclos de pasteurização cadastrados no modulo de Doações.
          </p>
        </div>
        <BrButton icon="plus" primary onClick={() => setIsCreateModalOpen(true)}>
          Novo Lote
        </BrButton>
      </header>

      <div className="pasteurization-batches__filters">
        <BrInput
          label="Buscar lote"
          placeholder="Filtrar por ID, codigo, operador ou status"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </div>

      {error && (
        <BrMessage
          category="message"
          message={error}
          status="danger"
          title="Erro ao carregar"
        />
      )}

      {pageMessage && (
        <BrMessage
          category="message"
          message={pageMessage.message}
          status={pageMessage.status}
          title={pageMessage.title}
        />
      )}

      <div className="pasteurization-batches__table">
        <BrTable
          columns={columns}
          data={filteredBatches}
          density="small"
          emptyContent="Nenhum lote encontrado."
          isLoading={loading}
          title="Ciclos de pasteurização"
        />
      </div>

      <BrModal
        isOpen={Boolean(selectedBatch)}
        onClose={closeModal}
        showClose
        title="Detalhes e ações do lote"
      >
        {selectedBatch && (
          <div className="pasteurization-batches__modal">
            {modalMessage && (
              <BrMessage
                category="message"
                message={modalMessage.message}
                status={modalMessage.status}
                title={modalMessage.title}
              />
            )}

            {modalView === "details" && (
              <>
                <div className="pasteurization-batches__details">
                  <p><strong>ID:</strong> {selectedBatch.id}</p>
                  <p><strong>Codigo:</strong> {selectedBatch.batchCode}</p>
                  <p><strong>Data:</strong> {formatDateTime(selectedBatch.pasteurizedAt)}</p>
                  <p><strong>Status:</strong> {getStatusTag(selectedBatch.microbiologyStatus)}</p>
                  <p><strong>Operador:</strong> {selectedBatch.operatorId}</p>
                  <p><strong>Observacoes:</strong> {selectedBatch.observations ?? "-"}</p>
                </div>

                <div className="pasteurization-batches__action-row">
                  <BrButton
                    disabled={submitting}
                    onClick={() => setModalView("approve")}
                    primary
                  >
                    Aprovar
                  </BrButton>
                  <BrButton
                    disabled={submitting}
                    onClick={() => setModalView("reject")}
                    secondary
                  >
                    Rejeitar
                  </BrButton>
                </div>
              </>
            )}

            {modalView === "approve" && (
              <div className="pasteurization-batches__actions">
                <h3 className="pasteurization-batches__section-title">Aprovar lote</h3>

                <div className="pasteurization-batches__action-form">
                  <BrMessage
                    category="message"
                    message="Informe o volume final e a quantidade de frascos gerados para confirmar a aprovacao."
                    status="info"
                    title="Aprovacao"
                  />
                  <BrInput
                    label="Volume Final (ml)"
                    type="number"
                    value={approveVolumeFinalMl}
                    onChange={(event) => setApproveVolumeFinalMl(event.currentTarget.value)}
                  />
                  <BrInput
                    label="Frascos Gerados"
                    type="number"
                    value={approveGeneratedUnits}
                    onChange={(event) => setApproveGeneratedUnits(event.currentTarget.value)}
                  />
                  <div className="pasteurization-batches__form-actions">
                    <BrButton disabled={submitting} onClick={() => setModalView("details")} secondary>
                      Voltar
                    </BrButton>
                    <BrButton disabled={submitting || !canApprove} onClick={() => void handleApprove()} primary>
                      Confirmar
                    </BrButton>
                  </div>
                </div>
              </div>
            )}

            {modalView === "reject" && (
              <div className="pasteurization-batches__actions">
                <h3 className="pasteurization-batches__section-title">Rejeitar lote</h3>

                <div className="pasteurization-batches__action-form">
                  <BrMessage
                    category="message"
                    message="A observacao e obrigatoria. Use um dos exemplos abaixo ou descreva o motivo com clareza."
                    status="warning"
                    title="Rejeicao"
                  />
                  <div className="pasteurization-batches__chips">
                    <BrButton
                      secondary
                      size="small"
                      type="button"
                      onClick={() => setRejectReason("Contaminacao")}
                    >
                      Contaminacao
                    </BrButton>
                    <BrButton
                      secondary
                      size="small"
                      type="button"
                      onClick={() => setRejectReason("Falha microbiologica")}
                    >
                      Falha microbiologica
                    </BrButton>
                    <BrButton
                      secondary
                      size="small"
                      type="button"
                      onClick={() => setRejectReason("Inconsistencia operacional")}
                    >
                      Inconsistencia operacional
                    </BrButton>
                  </div>
                  <BrTextarea
                    label="Observacao / Justificativa"
                    placeholder="Descreva o motivo da rejeicao"
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.currentTarget.value)}
                  />
                  <div className="pasteurization-batches__form-actions">
                    <BrButton disabled={submitting} onClick={() => setModalView("details")} secondary>
                      Voltar
                    </BrButton>
                    <BrButton disabled={submitting || !canReject} onClick={() => void handleReject()} primary>
                      Confirmar
                    </BrButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </BrModal>

      <BrModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        showClose
        title="Novo lote de pasteurização"
      >
        <div className="pasteurization-batches__modal">
          {createMessage && (
            <BrMessage
              category="message"
              message={createMessage.message}
              status={createMessage.status}
              title={createMessage.title}
            />
          )}

          {availableRawMilkError && (
            <BrMessage
              category="message"
              message={availableRawMilkError}
              status="danger"
              title="Erro ao carregar frascos"
            />
          )}

          <BrMessage
            category="message"
            message="Selecione os frascos aprovados e informacoes operacionais do ciclo de pasteurizacao."
            status="info"
            title="Criacao do lote"
          />

          <div className="pasteurization-batches__action-form">
            <BrInput
              label="Codigo do lote"
              placeholder="Ex.: LOTE-2026-001"
              value={createBatchCode}
              onChange={(event) => setCreateBatchCode(event.currentTarget.value)}
            />
            <BrInput
              label="Data da pasteurizacao"
              type="datetime-local"
              value={createPasteurizedAt}
              onChange={(event) => setCreatePasteurizedAt(event.currentTarget.value)}
            />
            <BrInput
              label="ID do operador"
              placeholder="UUID do operador"
              value={createOperatorId}
              onChange={(event) => setCreateOperatorId(event.currentTarget.value)}
            />
            <BrSelect<string[]>
              label="Frascos aprovados"
              options={rawMilkOptions}
              value={createRawMilkIds}
              type="multiple"
              placeholder={availableRawMilkLoading ? "Carregando frascos..." : "Selecione os frascos"}
              isLoading={availableRawMilkLoading}
              onChange={(newValue) => setCreateRawMilkIds(newValue)}
            />
            <BrTextarea
              label="Observacoes"
              placeholder="Observacoes operacionais do lote"
              value={createObservations}
              onChange={(event) => setCreateObservations(event.currentTarget.value)}
            />
            <div className="pasteurization-batches__form-actions">
              <BrButton disabled={submitting} onClick={closeCreateModal} secondary>
                Cancelar
              </BrButton>
              <BrButton disabled={submitting || !canCreateBatch} onClick={() => void handleCreateBatch()} primary>
                Criar lote
              </BrButton>
            </div>
          </div>
        </div>
      </BrModal>
    </section>
  );
}