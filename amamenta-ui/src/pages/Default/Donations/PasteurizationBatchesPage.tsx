import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BrButton,
  BrInput,
  BrMessage,
  BrModal,
  BrTable,
  BrTag,
  BrTextarea,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { approvePasteurizationBatch, api, rejectPasteurizationBatch } from "@/services/api";

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
  const [selectedBatch, setSelectedBatch] = useState<PasteurizationBatch | null>(null);
  const [modalView, setModalView] = useState<ModalView>("details");
  const [approveVolumeFinalMl, setApproveVolumeFinalMl] = useState("");
  const [approveGeneratedUnits, setApproveGeneratedUnits] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [pageMessage, setPageMessage] = useState<FeedbackState>(null);
  const [modalMessage, setModalMessage] = useState<FeedbackState>(null);
  const [submitting, setSubmitting] = useState(false);

  const approveVolumeValue = Number(approveVolumeFinalMl);
  const approveUnitsValue = Number(approveGeneratedUnits);
  const canApprove = Number.isInteger(approveVolumeValue) && approveVolumeValue > 0
    && Number.isInteger(approveUnitsValue) && approveUnitsValue > 0;
  const canReject = rejectReason.trim().length > 0;

  useEffect(() => {
    if (!pageMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPageMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [pageMessage]);

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
        key: "actions",
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

  function closeModal() {
    setSelectedBatch(null);
    setModalView("details");
    setApproveVolumeFinalMl("");
    setApproveGeneratedUnits("");
    setRejectReason("");
    setModalMessage(null);
  }

  return (
    <section className="pasteurization-batches">
      <header className="pasteurization-batches__header">
        <div>
          <h1 className="pasteurization-batches__title">Lotes de Pasteurização</h1>
          <p className="pasteurization-batches__description">
            Lista dos ciclos de pasteurização cadastrados no modulo de Doações.
          </p>
        </div>
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
    </section>
  );
}