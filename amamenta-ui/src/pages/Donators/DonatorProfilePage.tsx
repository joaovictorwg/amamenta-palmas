import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BrButton,
  BrModal,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./DonatorProfilePage.css";

type DonatorStatus = "PENDING_EXAMS" | "ACTIVE" | "INACTIVE";
type ExamResult = "NON_REACTIVE" | "REACTIVE" | "UNAVAILABLE";

type ClinicalHistory = {
  profession?: string | null;
  maritalStatus?: string | null;
  prenatalType?: "PUBLIC" | "PRIVATE" | null;
  prenatalLocation?: string | null;
  receivedBreastfeedingGuidance?: boolean | null;
  isFirstChild?: boolean | null;
  breastfedLastChild?: boolean | null;
  breastfedLastChildDuration?: string | null;
  deliveryType?: "VAGINAL" | "CESAREAN" | null;
  birthWeightGrams?: number | null;
  gestationalAgeInitialWeeks?: number | null;
  gestationalAgeFinalWeeks?: number | null;
  gestationalAgeDays?: number | null;
  deliveryDate?: string | null;
  pregnancyWeightKg?: string | null;
  heightMeters?: string | null;
  pregnancyIntercurrencesCid10?: string | null;
  isSmoker?: boolean | null;
  cigarettesPerDay?: number | null;
  usesAlcohol?: boolean | null;
  usesDrugs?: boolean | null;
  usesMedication?: boolean | null;
  substanceUseDescription?: string | null;
  substanceUseClassification?: "ABUSE" | "NONE" | null;
  hadBloodTransfusionLastFiveYears?: boolean | null;
  medicalArea?: string | null;
  declaredFit?: boolean | null;
  observations?: string | null;
};

type DonatorExam = {
  examDate: string;
  validUntil: string;
  vdrl: ExamResult;
  hbsag: ExamResult;
  ftaabs: ExamResult;
  hiv: ExamResult;
  hbPercentage?: string | null;
  htPercentage?: string | null;
};

type DonatorProfile = {
  id: string;
  registrationNumber?: string | null;
  registeredAt?: string | null;
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  referencePoint?: string | null;
  birthDate?: string | null;
  babyName?: string | null;
  naturality?: string | null;
  homeCollection: boolean;
  exclusiveDonator: boolean;
  receptor?: string | null;
  receptorOther?: string | null;
  guidanceSource?: string | null;
  guidanceSourceOther?: string | null;
  registeredBy?: string | null;
  status: DonatorStatus;
  lastCollectionDate?: string | null;
  clinicalHistory: ClinicalHistory | null;
  latestExam: DonatorExam | null;
};

type DonatorProfileResponse = {
  data: DonatorProfile;
};

type DonatorExamsResponse = {
  data: DonatorExam[];
};

const statusLabels: Record<DonatorStatus, string> = {
  ACTIVE: "Ativa",
  PENDING_EXAMS: "Pendente Exames",
  INACTIVE: "Inativa",
};

const examLabels: Record<ExamResult, string> = {
  NON_REACTIVE: "Nao reagente",
  REACTIVE: "Reagente",
  UNAVAILABLE: "Indisponivel",
};

function formatPhone(value?: string | null) {
  if (!value) {
    return "-";
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return value;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Sem registro";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function formatBoolean(value?: boolean | null) {
  if (value === true) {
    return "Sim";
  }

  if (value === false) {
    return "Nao";
  }

  return "-";
}

function valueOrDash(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function getFilenameFromDisposition(disposition?: string) {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? "cadastro-doadora.docx";
}

function getStatusTag(status: DonatorStatus) {
  if (status === "ACTIVE") {
    return <BrTag color="success" value={statusLabels[status]} />;
  }

  if (status === "PENDING_EXAMS") {
    return <BrTag color="warning" value={statusLabels[status]} />;
  }

  return <BrTag color="danger" value={statusLabels[status]} />;
}

function getExamTag(result?: ExamResult) {
  if (!result) {
    return <BrTag color="info" value="Sem registro" />;
  }

  if (result === "NON_REACTIVE") {
    return <BrTag color="success" value={examLabels[result]} />;
  }

  if (result === "REACTIVE") {
    return <BrTag color="danger" value={examLabels[result]} />;
  }

  return <BrTag color="warning" value={examLabels[result]} />;
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="donator-profile__info-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function DonatorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donator, setDonator] = useState<DonatorProfile | null>(null);
  const [exams, setExams] = useState<DonatorExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactivateModal, setShowInactivateModal] = useState(false);

  async function loadDonator() {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [profileResponse, examsResponse] = await Promise.all([
        api.get<DonatorProfileResponse>(`/donators/${id}`),
        api.get<DonatorExamsResponse>(`/donators/${id}/exams`),
      ]);

      setDonator(profileResponse.data.data);
      setExams(examsResponse.data.data);
    } catch {
      setError("Nao foi possivel carregar o perfil da doadora.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDonator();
  }, [id]);

  const sanitaryStatus = useMemo(() => {
    if (!donator?.latestExam) {
      return {
        color: "warning" as const,
        label: "Sem exames registrados",
      };
    }

    const validUntil = new Date(donator.latestExam.validUntil);
    const isExpired = Number.isNaN(validUntil.getTime())
      ? true
      : validUntil < new Date();

    if (isExpired) {
      return {
        color: "danger" as const,
        label: "Exames vencidos",
      };
    }

    return {
      color: "success" as const,
      label: "Exames validos",
    };
  }, [donator]);

  async function handleExport() {
    if (!donator) {
      return;
    }

    const response = await api.get(`/donators/${donator.id}/export`, {
      responseType: "blob",
    });
    const filename = getFilenameFromDisposition(
      response.headers["content-disposition"],
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleInactivate() {
    if (!donator) {
      return;
    }

    await api.patch(`/donators/${donator.id}`, {
      status: "INACTIVE",
    });

    setShowInactivateModal(false);
    await loadDonator();
  }

  const examColumns = useMemo<BrTableColumn<DonatorExam>[]>(
    () => [
      {
        key: "examDate",
        title: "Data do exame",
        width: "14%",
        render: (value) => formatDate(String(value)),
      },
      {
        key: "validUntil",
        title: "Valido ate",
        width: "14%",
        render: (value) => formatDate(String(value)),
      },
      {
        key: "vdrl",
        title: "VDRL",
        width: "12%",
        render: (value) => getExamTag(value as ExamResult),
      },
      {
        key: "hbsag",
        title: "HBsAg",
        width: "12%",
        render: (value) => getExamTag(value as ExamResult),
      },
      {
        key: "ftaabs",
        title: "FTA-ABS",
        width: "12%",
        render: (value) => getExamTag(value as ExamResult),
      },
      {
        key: "hiv",
        title: "HIV",
        width: "12%",
        render: (value) => getExamTag(value as ExamResult),
      },
      {
        key: "hbPercentage",
        title: "Hb (%)",
        width: "12%",
        render: (value) => valueOrDash(value as string | null),
      },
      {
        key: "htPercentage",
        title: "Ht (%)",
        width: "12%",
        render: (value) => valueOrDash(value as string | null),
      },
    ],
    [],
  );

  if (loading) {
    return <div className="donator-profile__loading">Carregando...</div>;
  }

  if (error || !donator) {
    return (
      <section className="donator-profile">
        <div className="donator-profile__error">
          {error ?? "Doadora nao encontrada."}
        </div>
      </section>
    );
  }

  const clinicalHistory = donator.clinicalHistory;
  const latestExam = donator.latestExam;

  return (
    <section className="donator-profile">
      <header className="donator-profile__header">
        <div>
          <BrButton
            icon="arrow-left"
            onClick={() => navigate("/doadoras/lista")}
            secondary
            size="small"
          >
            Voltar
          </BrButton>
          <h1 className="donator-profile__title">{donator.name}</h1>
          <div className="donator-profile__meta">
            {getStatusTag(donator.status)}
            <span>{formatPhone(donator.phone)}</span>
            <span>
              {donator.city} / {donator.neighborhood}
            </span>
          </div>
        </div>

        <div className="donator-profile__actions">
          <BrButton
            icon="edit"
            onClick={() => navigate(`/doadoras/${donator.id}/editar`)}
            secondary
          >
            Editar
          </BrButton>
          <BrButton icon="print" onClick={() => void handleExport()} secondary>
            Exportar ficha
          </BrButton>
          <BrButton
            color="danger"
            icon="ban"
            onClick={() => setShowInactivateModal(true)}
            secondary
          >
            Inativar
          </BrButton>
        </div>
      </header>

      <div className="donator-profile__summary">
        <section className="donator-profile__summary-item">
          <span>Ultima coleta</span>
          <strong>{formatDate(donator.lastCollectionDate)}</strong>
        </section>
        <section className="donator-profile__summary-item">
          <span>Situacao sanitaria</span>
          <strong>
            <BrTag color={sanitaryStatus.color} value={sanitaryStatus.label} />
          </strong>
        </section>
        <section className="donator-profile__summary-item">
          <span>Validade dos exames</span>
          <strong>{formatDate(latestExam?.validUntil)}</strong>
        </section>
      </div>

      <section className="donator-profile__section">
        <h2>Dados cadastrais</h2>
        <dl className="donator-profile__info-grid">
          <InfoItem label="Registro" value={valueOrDash(donator.registrationNumber)} />
          <InfoItem label="Data do cadastro" value={formatDate(donator.registeredAt)} />
          <InfoItem label="Nascimento" value={formatDate(donator.birthDate)} />
          <InfoItem label="Naturalidade" value={valueOrDash(donator.naturality)} />
          <InfoItem label="Bebe" value={valueOrDash(donator.babyName)} />
          <InfoItem label="Cadastrada por" value={valueOrDash(donator.registeredBy)} />
          <InfoItem
            label="Endereco"
            value={`${donator.address}, ${donator.neighborhood}, ${donator.city}/${donator.state}`}
          />
          <InfoItem label="Referencia" value={valueOrDash(donator.referencePoint)} />
          <InfoItem label="Coleta domiciliar" value={formatBoolean(donator.homeCollection)} />
          <InfoItem label="Doadora exclusiva" value={formatBoolean(donator.exclusiveDonator)} />
          <InfoItem label="Receptor" value={valueOrDash(donator.receptorOther || donator.receptor)} />
          <InfoItem
            label="Origem da orientacao"
            value={valueOrDash(donator.guidanceSourceOther || donator.guidanceSource)}
          />
        </dl>
      </section>

      <section className="donator-profile__section">
        <h2>Historico clinico e obstetrico</h2>
        <dl className="donator-profile__info-grid">
          <InfoItem label="Profissao" value={valueOrDash(clinicalHistory?.profession)} />
          <InfoItem label="Estado civil" value={valueOrDash(clinicalHistory?.maritalStatus)} />
          <InfoItem label="Pre-natal" value={valueOrDash(clinicalHistory?.prenatalType)} />
          <InfoItem label="Local do pre-natal" value={valueOrDash(clinicalHistory?.prenatalLocation)} />
          <InfoItem label="Orientacao de aleitamento" value={formatBoolean(clinicalHistory?.receivedBreastfeedingGuidance)} />
          <InfoItem label="Primeiro filho" value={formatBoolean(clinicalHistory?.isFirstChild)} />
          <InfoItem label="Amamentou ultimo filho" value={formatBoolean(clinicalHistory?.breastfedLastChild)} />
          <InfoItem label="Duracao anterior" value={valueOrDash(clinicalHistory?.breastfedLastChildDuration)} />
          <InfoItem label="Tipo de parto" value={valueOrDash(clinicalHistory?.deliveryType)} />
          <InfoItem label="Data do parto" value={formatDate(clinicalHistory?.deliveryDate)} />
          <InfoItem label="Peso ao nascer" value={valueOrDash(clinicalHistory?.birthWeightGrams)} />
          <InfoItem label="Peso gestacional" value={valueOrDash(clinicalHistory?.pregnancyWeightKg)} />
          <InfoItem label="Altura" value={valueOrDash(clinicalHistory?.heightMeters)} />
          <InfoItem label="Fumante" value={formatBoolean(clinicalHistory?.isSmoker)} />
          <InfoItem label="Alcool" value={formatBoolean(clinicalHistory?.usesAlcohol)} />
          <InfoItem label="Drogas" value={formatBoolean(clinicalHistory?.usesDrugs)} />
          <InfoItem label="Medicamentos" value={formatBoolean(clinicalHistory?.usesMedication)} />
          <InfoItem label="Transfusao ultimos 5 anos" value={formatBoolean(clinicalHistory?.hadBloodTransfusionLastFiveYears)} />
          <InfoItem label="Apta declarada" value={formatBoolean(clinicalHistory?.declaredFit)} />
          <InfoItem label="Area medica" value={valueOrDash(clinicalHistory?.medicalArea)} />
          <InfoItem label="Intercorrencias" value={valueOrDash(clinicalHistory?.pregnancyIntercurrencesCid10)} />
          <InfoItem label="Observacoes" value={valueOrDash(clinicalHistory?.observations)} />
        </dl>
      </section>

      <section className="donator-profile__section">
        <div className="donator-profile__section-header">
          <h2>Ultima bateria de exames</h2>
          <BrButton
            icon="plus"
            onClick={() => navigate(`/doadoras/${donator.id}/editar`)}
            secondary
            size="small"
          >
            Registrar exames
          </BrButton>
        </div>
        <dl className="donator-profile__info-grid donator-profile__info-grid--exams">
          <InfoItem label="Data do exame" value={formatDate(latestExam?.examDate)} />
          <InfoItem label="Valido ate" value={formatDate(latestExam?.validUntil)} />
          <InfoItem label="VDRL" value={getExamTag(latestExam?.vdrl)} />
          <InfoItem label="HBsAg" value={getExamTag(latestExam?.hbsag)} />
          <InfoItem label="FTA-ABS" value={getExamTag(latestExam?.ftaabs)} />
          <InfoItem label="HIV" value={getExamTag(latestExam?.hiv)} />
          <InfoItem label="Hb (%)" value={valueOrDash(latestExam?.hbPercentage)} />
          <InfoItem label="Ht (%)" value={valueOrDash(latestExam?.htPercentage)} />
        </dl>
      </section>

      <section className="donator-profile__section">
        <h2>Historico de exames</h2>
        <div className="donator-profile__table">
          <BrTable
            columns={examColumns}
            data={exams}
            density="small"
            emptyContent="Nenhuma bateria de exames registrada."
            title="Baterias registradas"
          />
        </div>
      </section>

      <section className="donator-profile__section">
        <h2>Coletas relacionadas</h2>
        <div className="donator-profile__empty">
          Historico de coletas sera exibido aqui quando o modulo de doacoes
          estiver integrado ao perfil da doadora.
        </div>
      </section>

      <BrModal
        isOpen={showInactivateModal}
        onClose={() => setShowInactivateModal(false)}
        primaryAction={{
          label: "Inativar",
          action: () => void handleInactivate(),
        }}
        secondaryAction={{
          label: "Cancelar",
          action: () => setShowInactivateModal(false),
        }}
        showClose
        title="Inativar doadora"
      >
        <p className="donator-profile__modal-text">
          Deseja realmente inativar esta doadora?
        </p>
      </BrModal>
    </section>
  );
}
