import { useMemo, useState } from "react";
import axios from "axios";
import { BrButton, BrInput } from "@govbr-ds/react-components";
import { useNavigate } from "react-router-dom";

import { api } from "@/services/api";

import "./LotsPage.css";

type StockStatus = "AVAILABLE" | "DISTRIBUTED" | "EXPIRED" | "DISCARDED";

type FormErrors = Partial<Record<"batchId" | "volumeMl" | "quantity" | "pasteurizedAt" | "general", string>>;

function getDefaultDatetimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function createTemporaryBatchId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "00000000-0000-4000-8000-000000000000";
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }

  return "Nao foi possivel cadastrar as unidades temporarias.";
}

export default function LotsPage() {
  const navigate = useNavigate();

  const [batchId, setBatchId] = useState<string>(() => createTemporaryBatchId());
  const [volumeMl, setVolumeMl] = useState("200");
  const [quantity, setQuantity] = useState("5");
  const [pasteurizedAt, setPasteurizedAt] = useState(getDefaultDatetimeLocal);
  const [stockStatus, setStockStatus] = useState<StockStatus>("AVAILABLE");
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const expirationPreview = useMemo(() => {
    if (!pasteurizedAt) return "-";
    const date = new Date(pasteurizedAt);
    if (Number.isNaN(date.getTime())) return "-";
    date.setDate(date.getDate() + 180);
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
  }, [pasteurizedAt]);

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!batchId.trim()) nextErrors.batchId = "Informe ou gere o ID temporario do lote.";
    if (!volumeMl || Number(volumeMl) <= 0) nextErrors.volumeMl = "Informe um volume valido.";
    if (!quantity || Number(quantity) <= 0) nextErrors.quantity = "Informe uma quantidade valida.";
    if (!pasteurizedAt) nextErrors.pasteurizedAt = "Informe a data de pasteurizacao.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    setSubmitting(true);
    setSuccessMessage(null);
    setErrors({});

    try {
      const total = Number(quantity);
      const payload = {
        batchId: batchId.trim(),
        volumeMl: Number(volumeMl),
        pasteurizedAt,
        stockStatus,
      };

      await Promise.all(
        Array.from({ length: total }, () => api.post("/donations/pasteurized-milk", payload)),
      );

      setSuccessMessage(`${total} unidade(s) cadastrada(s) para teste no estoque.`);
    } catch (error) {
      setErrors({ general: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="lots-page">
      <header className="lots-page__header">
        <div>
          <p className="lots-page__eyebrow">Cadastro temporario</p>
          <h1 className="lots-page__title">Lotes de Pasteurizacao</h1>
          <p className="lots-page__description">
            Crie unidades de leite pasteurizado para testar a tela de estoque enquanto o fluxo completo de lotes e microbiologia e finalizado.
          </p>
        </div>
      </header>

      <div className="lots-page__notice">
        Esta tela e provisoria. Ela cadastra unidades diretamente em estoque usando o endpoint de leite pasteurizado.
      </div>

      <div className="lots-page__content">
        <form className="lots-page__form" onSubmit={(event) => event.preventDefault()}>
          <div className="lots-page__field-with-action">
            <BrInput
              label="ID temporario do lote"
              value={batchId}
              status={errors.batchId ? "danger" : undefined}
              feedbackText={errors.batchId}
              onChange={(event) => setBatchId(event.currentTarget.value)}
            />
            <BrButton
              icon="sync"
              secondary
              type="button"
              onClick={() => setBatchId(createTemporaryBatchId())}
            >
              Gerar
            </BrButton>
          </div>

          <div className="lots-page__grid">
            <BrInput
              type="number"
              label="Volume por unidade (ml)"
              value={volumeMl}
              status={errors.volumeMl ? "danger" : undefined}
              feedbackText={errors.volumeMl}
              onChange={(event) => setVolumeMl(event.currentTarget.value)}
            />

            <BrInput
              type="number"
              label="Quantidade de unidades"
              value={quantity}
              status={errors.quantity ? "danger" : undefined}
              feedbackText={errors.quantity}
              onChange={(event) => setQuantity(event.currentTarget.value)}
            />
          </div>

          <div className="lots-page__grid">
            <BrInput
              type="datetime-local"
              label="Data de pasteurizacao"
              value={pasteurizedAt}
              status={errors.pasteurizedAt ? "danger" : undefined}
              feedbackText={errors.pasteurizedAt}
              onChange={(event) => setPasteurizedAt(event.currentTarget.value)}
            />

            <label className="lots-page__select-field">
              <span>Status inicial</span>
              <select value={stockStatus} onChange={(event) => setStockStatus(event.currentTarget.value as StockStatus)}>
                <option value="AVAILABLE">Disponivel</option>
                <option value="DISTRIBUTED">Distribuida</option>
                <option value="EXPIRED">Vencida</option>
                <option value="DISCARDED">Descartada</option>
              </select>
            </label>
          </div>

          <div className="lots-page__preview">
            <span>Validade calculada pela API</span>
            <strong>{expirationPreview}</strong>
            <small>180 dias apos a pasteurizacao</small>
          </div>

          {errors.general && <div className="lots-page__error">{errors.general}</div>}
          {successMessage && <div className="lots-page__success">{successMessage}</div>}

          <div className="lots-page__actions">
            <BrButton
              disabled={submitting}
              icon="flask"
              primary
              type="button"
              onClick={() => void handleSubmit()}
            >
              {submitting ? "Cadastrando..." : "Cadastrar unidades"}
            </BrButton>
            <BrButton icon="boxes" secondary type="button" onClick={() => navigate("/doacoes/estoque")}>
              Ver estoque
            </BrButton>
          </div>
        </form>
      </div>
    </section>
  );
}
