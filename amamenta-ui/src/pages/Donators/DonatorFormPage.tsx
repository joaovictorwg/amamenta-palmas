import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BrButton,
  BrCheckbox,
  BrInput,
  BrSelect,
  BrTextarea,
  BrWizard,
} from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./DonatorFormPage.css";

type DonatorStatus = "PENDING_EXAMS" | "ACTIVE" | "INACTIVE";
type ExamResult = "NON_REACTIVE" | "REACTIVE" | "UNAVAILABLE";

type DonatorFormData = {
  registrationNumber: string;
  registeredAt: string;
  name: string;
  phone: string;
  birthDate: string;
  babyName: string;
  naturality: string;
  registeredBy: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  referencePoint: string;
  homeCollection: boolean;
  exclusiveDonator: boolean;
  receptor: string;
  receptorOther: string;
  guidanceSource: string;
  guidanceSourceOther: string;
  status: DonatorStatus;
  profession: string;
  maritalStatus: string;
  prenatalType: string;
  prenatalLocation: string;
  receivedBreastfeedingGuidance: boolean;
  isFirstChild: boolean;
  breastfedLastChild: boolean;
  breastfedLastChildDuration: string;
  deliveryType: string;
  birthWeightGrams: string;
  gestationalAgeInitialWeeks: string;
  gestationalAgeFinalWeeks: string;
  gestationalAgeDays: string;
  deliveryDate: string;
  pregnancyWeightKg: string;
  heightMeters: string;
  pregnancyIntercurrencesCid10: string;
  isSmoker: boolean;
  cigarettesPerDay: string;
  usesAlcohol: boolean;
  usesDrugs: boolean;
  usesMedication: boolean;
  substanceUseDescription: string;
  substanceUseClassification: string;
  hadBloodTransfusionLastFiveYears: boolean;
  medicalArea: string;
  declaredFit: boolean;
  observations: string;
  examDate: string;
  vdrl: ExamResult | "";
  hbsag: ExamResult | "";
  ftaabs: ExamResult | "";
  hiv: ExamResult | "";
  hbPercentage: string;
  htPercentage: string;
};

type DonatorProfileResponse = {
  data: Partial<DonatorFormData> & {
    id: string;
    clinicalHistory?: Partial<DonatorFormData> | null;
  };
};

type CepResponse = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
};

type StaffUser = {
  id: string;
  name?: string | null;
  email: string;
  role: "admin" | "employee";
};

const initialFormData: DonatorFormData = {
  registrationNumber: "",
  registeredAt: "",
  name: "",
  phone: "",
  birthDate: "",
  babyName: "",
  naturality: "",
  registeredBy: "",
  address: "",
  neighborhood: "",
  city: "",
  state: "TO",
  referencePoint: "",
  homeCollection: false,
  exclusiveDonator: false,
  receptor: "",
  receptorOther: "",
  guidanceSource: "",
  guidanceSourceOther: "",
  status: "PENDING_EXAMS",
  profession: "",
  maritalStatus: "",
  prenatalType: "",
  prenatalLocation: "",
  receivedBreastfeedingGuidance: false,
  isFirstChild: false,
  breastfedLastChild: false,
  breastfedLastChildDuration: "",
  deliveryType: "",
  birthWeightGrams: "",
  gestationalAgeInitialWeeks: "",
  gestationalAgeFinalWeeks: "",
  gestationalAgeDays: "",
  deliveryDate: "",
  pregnancyWeightKg: "",
  heightMeters: "",
  pregnancyIntercurrencesCid10: "",
  isSmoker: false,
  cigarettesPerDay: "",
  usesAlcohol: false,
  usesDrugs: false,
  usesMedication: false,
  substanceUseDescription: "",
  substanceUseClassification: "",
  hadBloodTransfusionLastFiveYears: false,
  medicalArea: "",
  declaredFit: false,
  observations: "",
  examDate: "",
  vdrl: "",
  hbsag: "",
  ftaabs: "",
  hiv: "",
  hbPercentage: "",
  htPercentage: "",
};

const receptorOptions = [
  { label: "UTIN", value: "UTIN" },
  { label: "UCINCO", value: "UCINCO" },
  { label: "Cristo Rei", value: "CRISTO_REI" },
  { label: "Outro", value: "OTHER" },
];

const guidanceSourceOptions = [
  { label: "HMDR", value: "HMDR" },
  { label: "USF", value: "USF" },
  { label: "Midia", value: "MEDIA" },
  { label: "Outro", value: "OTHER" },
];

const statusOptions = [
  { label: "Pendente Exames", value: "PENDING_EXAMS" },
  { label: "Ativa", value: "ACTIVE" },
  { label: "Inativa", value: "INACTIVE" },
];

const prenatalOptions = [
  { label: "Publico", value: "PUBLIC" },
  { label: "Privado", value: "PRIVATE" },
];

const deliveryOptions = [
  { label: "Vaginal", value: "VAGINAL" },
  { label: "Cesarea", value: "CESAREAN" },
];

const substanceOptions = [
  { label: "Nenhum", value: "NONE" },
  { label: "Abuso", value: "ABUSE" },
];

const examResultOptions = [
  { label: "Nao reagente", value: "NON_REACTIVE" },
  { label: "Reagente", value: "REACTIVE" },
  { label: "Indisponivel", value: "UNAVAILABLE" },
];

function toDateInput(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: string) {
  const normalized = value.replace(",", ".").trim();
  return normalized ? Number(normalized) : undefined;
}

function getFilenameFromDisposition(disposition?: string) {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? "cadastro-doadora.docx";
}

function hasAnyValue(values: Array<string | boolean>) {
  return values.some((value) =>
    typeof value === "boolean" ? value : Boolean(value.trim()),
  );
}

function requiredLabel(label: string) {
  return (
    <>
      {label} <span className="donator-form__required">*</span>
    </>
  );
}

export default function DonatorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState<DonatorFormData>(initialFormData);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [zipCode, setZipCode] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get<StaffUser[]>("/users")
      .then((response) => setStaff(response.data))
      .catch(() => setStaff([]))
      .finally(() => setStaffLoading(false));
  }, []);

  useEffect(() => {
    async function loadDonator() {
      if (!id) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<DonatorProfileResponse>(
          `/donators/${id}`,
        );
        const donator = response.data.data;
        const clinicalHistory = donator.clinicalHistory ?? {};

        setFormData({
          ...initialFormData,
          registrationNumber: donator.registrationNumber ?? "",
          registeredAt: toDateInput(donator.registeredAt),
          name: donator.name ?? "",
          phone: donator.phone ?? "",
          birthDate: toDateInput(donator.birthDate),
          babyName: donator.babyName ?? "",
          naturality: donator.naturality ?? "",
          registeredBy: donator.registeredBy ?? "",
          address: donator.address ?? "",
          neighborhood: donator.neighborhood ?? "",
          city: donator.city ?? "",
          state: donator.state ?? "TO",
          referencePoint: donator.referencePoint ?? "",
          homeCollection: Boolean(donator.homeCollection),
          exclusiveDonator: Boolean(donator.exclusiveDonator),
          receptor: donator.receptor ?? "",
          receptorOther: donator.receptorOther ?? "",
          guidanceSource: donator.guidanceSource ?? "",
          guidanceSourceOther: donator.guidanceSourceOther ?? "",
          status: donator.status ?? "PENDING_EXAMS",
          profession: clinicalHistory.profession ?? "",
          maritalStatus: clinicalHistory.maritalStatus ?? "",
          prenatalType: clinicalHistory.prenatalType ?? "",
          prenatalLocation: clinicalHistory.prenatalLocation ?? "",
          receivedBreastfeedingGuidance: Boolean(
            clinicalHistory.receivedBreastfeedingGuidance,
          ),
          isFirstChild: Boolean(clinicalHistory.isFirstChild),
          breastfedLastChild: Boolean(clinicalHistory.breastfedLastChild),
          breastfedLastChildDuration:
            clinicalHistory.breastfedLastChildDuration ?? "",
          deliveryType: clinicalHistory.deliveryType ?? "",
          birthWeightGrams: String(clinicalHistory.birthWeightGrams ?? ""),
          gestationalAgeInitialWeeks: String(
            clinicalHistory.gestationalAgeInitialWeeks ?? "",
          ),
          gestationalAgeFinalWeeks: String(
            clinicalHistory.gestationalAgeFinalWeeks ?? "",
          ),
          gestationalAgeDays: String(clinicalHistory.gestationalAgeDays ?? ""),
          deliveryDate: toDateInput(clinicalHistory.deliveryDate),
          pregnancyWeightKg: String(clinicalHistory.pregnancyWeightKg ?? ""),
          heightMeters: String(clinicalHistory.heightMeters ?? ""),
          pregnancyIntercurrencesCid10:
            clinicalHistory.pregnancyIntercurrencesCid10 ?? "",
          isSmoker: Boolean(clinicalHistory.isSmoker),
          cigarettesPerDay: String(clinicalHistory.cigarettesPerDay ?? ""),
          usesAlcohol: Boolean(clinicalHistory.usesAlcohol),
          usesDrugs: Boolean(clinicalHistory.usesDrugs),
          usesMedication: Boolean(clinicalHistory.usesMedication),
          substanceUseDescription:
            clinicalHistory.substanceUseDescription ?? "",
          substanceUseClassification:
            clinicalHistory.substanceUseClassification ?? "",
          hadBloodTransfusionLastFiveYears: Boolean(
            clinicalHistory.hadBloodTransfusionLastFiveYears,
          ),
          medicalArea: clinicalHistory.medicalArea ?? "",
          declaredFit: Boolean(clinicalHistory.declaredFit),
          observations: clinicalHistory.observations ?? "",
          examDate: "",
          vdrl: "",
          hbsag: "",
          ftaabs: "",
          hiv: "",
          hbPercentage: "",
          htPercentage: "",
        });
      } catch {
        setError("Nao foi possivel carregar os dados da doadora.");
      } finally {
        setLoading(false);
      }
    }

    void loadDonator();
  }, [id]);

  const pageTitle = isEditing ? "Editar doadora" : "Cadastro de doadora";
  const registeredByOptions = useMemo(() => {
    const options = staff.map((user) => ({
      label: user.name ? `${user.name} (${user.email})` : user.email,
      value: user.name ?? user.email,
    }));

    if (
      formData.registeredBy &&
      !options.some((option) => option.value === formData.registeredBy)
    ) {
      options.unshift({
        label: formData.registeredBy,
        value: formData.registeredBy,
      });
    }

    return options;
  }, [formData.registeredBy, staff]);

  const requiredFieldsCompleted = useMemo(
    () =>
      Boolean(
        formData.name &&
          formData.phone &&
          formData.address &&
          formData.neighborhood &&
          formData.city &&
          formData.state,
      ),
    [formData],
  );

  const examStarted = useMemo(
    () =>
      Boolean(
        formData.examDate ||
          formData.vdrl ||
          formData.hbsag ||
          formData.ftaabs ||
          formData.hiv ||
          formData.hbPercentage ||
          formData.htPercentage,
      ),
    [formData],
  );

  const examRequiredFieldsCompleted = useMemo(
    () =>
      !examStarted ||
      Boolean(
        formData.examDate &&
          formData.vdrl &&
          formData.hbsag &&
          formData.ftaabs &&
          formData.hiv,
      ),
    [examStarted, formData],
  );

  function updateField<K extends keyof DonatorFormData>(
    field: K,
    value: DonatorFormData[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
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

      setFormData((current) => ({
        ...current,
        address: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      }));
    } catch {
      setError("Nao foi possivel buscar o CEP.");
    } finally {
      setCepLoading(false);
    }
  }

  function buildDonatorPayload() {
    return {
      registrationNumber: optionalString(formData.registrationNumber),
      registeredAt: formData.registeredAt || undefined,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      neighborhood: formData.neighborhood.trim(),
      city: formData.city.trim(),
      state: formData.state.trim().toUpperCase(),
      referencePoint: optionalString(formData.referencePoint),
      birthDate: formData.birthDate || undefined,
      babyName: optionalString(formData.babyName),
      naturality: optionalString(formData.naturality),
      homeCollection: formData.homeCollection,
      exclusiveDonator: formData.exclusiveDonator,
      receptor: formData.receptor || undefined,
      receptorOther: optionalString(formData.receptorOther),
      guidanceSource: formData.guidanceSource || undefined,
      guidanceSourceOther: optionalString(formData.guidanceSourceOther),
      registeredBy: optionalString(formData.registeredBy),
      ...(isEditing ? { status: formData.status } : {}),
    };
  }

  function buildClinicalHistoryPayload() {
    return {
      profession: optionalString(formData.profession),
      maritalStatus: optionalString(formData.maritalStatus),
      prenatalType: formData.prenatalType || undefined,
      prenatalLocation: optionalString(formData.prenatalLocation),
      receivedBreastfeedingGuidance: formData.receivedBreastfeedingGuidance,
      isFirstChild: formData.isFirstChild,
      breastfedLastChild: formData.breastfedLastChild,
      breastfedLastChildDuration: optionalString(
        formData.breastfedLastChildDuration,
      ),
      deliveryType: formData.deliveryType || undefined,
      birthWeightGrams: optionalNumber(formData.birthWeightGrams),
      gestationalAgeInitialWeeks: optionalNumber(
        formData.gestationalAgeInitialWeeks,
      ),
      gestationalAgeFinalWeeks: optionalNumber(
        formData.gestationalAgeFinalWeeks,
      ),
      gestationalAgeDays: optionalNumber(formData.gestationalAgeDays),
      deliveryDate: formData.deliveryDate || undefined,
      pregnancyWeightKg: optionalNumber(formData.pregnancyWeightKg),
      heightMeters: optionalNumber(formData.heightMeters),
      pregnancyIntercurrencesCid10: optionalString(
        formData.pregnancyIntercurrencesCid10,
      ),
      isSmoker: formData.isSmoker,
      cigarettesPerDay: optionalNumber(formData.cigarettesPerDay),
      usesAlcohol: formData.usesAlcohol,
      usesDrugs: formData.usesDrugs,
      usesMedication: formData.usesMedication,
      substanceUseDescription: optionalString(
        formData.substanceUseDescription,
      ),
      substanceUseClassification:
        formData.substanceUseClassification || undefined,
      hadBloodTransfusionLastFiveYears:
        formData.hadBloodTransfusionLastFiveYears,
      medicalArea: optionalString(formData.medicalArea),
      declaredFit: formData.declaredFit,
      observations: optionalString(formData.observations),
    };
  }

  function buildExamPayload() {
    if (
      !formData.examDate ||
      !formData.vdrl ||
      !formData.hbsag ||
      !formData.ftaabs ||
      !formData.hiv
    ) {
      return null;
    }

    return {
      examDate: formData.examDate,
      vdrl: formData.vdrl,
      hbsag: formData.hbsag,
      ftaabs: formData.ftaabs,
      hiv: formData.hiv,
      hbPercentage: optionalNumber(formData.hbPercentage),
      htPercentage: optionalNumber(formData.htPercentage),
    };
  }

  async function handleSave() {
    setSubmitted(true);

    if (!requiredFieldsCompleted) {
      setError("Preencha os dados obrigatorios antes de salvar.");
      return;
    }

    if (!examRequiredFieldsCompleted) {
      setError("Complete os campos obrigatorios da bateria de exames.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const donatorPayload = buildDonatorPayload();
      const clinicalPayload = buildClinicalHistoryPayload();
      const examPayload = buildExamPayload();
      const donatorId = id
        ? (
            await api.patch<{ data: { id: string } }>(
              `/donators/${id}`,
              donatorPayload,
            )
          ).data.data.id
        : (
            await api.post<{ data: { id: string } }>(
              "/donators",
              donatorPayload,
            )
          ).data.data.id;

      if (
        hasAnyValue([
          formData.profession,
          formData.maritalStatus,
          formData.prenatalType,
          formData.deliveryType,
          formData.observations,
          formData.receivedBreastfeedingGuidance,
          formData.declaredFit,
        ])
      ) {
        await api.patch(
          `/donators/${donatorId}/clinical-history`,
          clinicalPayload,
        );
      }

      if (examPayload) {
        await api.post(`/donators/${donatorId}/exams`, examPayload);
      }

      navigate("/doadoras/lista");
    } catch {
      setError("Nao foi possivel salvar a doadora.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    if (!id) {
      return;
    }

    const response = await api.get(`/donators/${id}/export`, {
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

  if (loading) {
    return <div className="donator-form__loading">Carregando...</div>;
  }

  return (
    <section className="donator-form">
      <header className="donator-form__header">
        <div>
          <h1 className="donator-form__title">{pageTitle}</h1>
          <p className="donator-form__description">
            Dados cadastrais, historico clinico e exames da doadora.
          </p>
          <p className="donator-form__required-note">
            Campos marcados com <span className="donator-form__required">*</span>{" "}
            sao obrigatorios.
          </p>
        </div>
        <div className="donator-form__header-actions">
          {isEditing && (
            <BrButton icon="print" onClick={() => void handleExport()} secondary>
              Exportar ficha
            </BrButton>
          )}
          <BrButton
            icon="arrow-left"
            onClick={() => navigate("/doadoras/lista")}
            secondary
          >
            Voltar
          </BrButton>
        </div>
      </header>

      {error && <div className="donator-form__error">{error}</div>}

      <BrWizard
        cancelButtonText="Cancelar"
        concludeButtonText={saving ? "Salvando..." : "Salvar"}
        nextButtonText="Avancar"
        onCancel={() => navigate("/doadoras/lista")}
        onConclude={() => void handleSave()}
        prevButtonText="Voltar"
        showCancelButton
        vertical
      >
        <BrWizard.Panel title="Cadastro">
          <div className="donator-form__grid">
            <BrInput
              label="Numero de registro"
              onChange={(event) =>
                updateField("registrationNumber", event.currentTarget.value)
              }
              value={formData.registrationNumber}
            />
            <BrInput
              label="Data do cadastro"
              onChange={(event) =>
                updateField("registeredAt", event.currentTarget.value)
              }
              type="date"
              value={formData.registeredAt}
            />
            <BrInput
              feedbackText={
                submitted && !formData.name ? "Informe o nome da doadora." : ""
              }
              label={requiredLabel("Nome da doadora")}
              onChange={(event) => updateField("name", event.currentTarget.value)}
              required
              status={submitted && !formData.name ? "danger" : undefined}
              value={formData.name}
            />
            <BrInput
              feedbackText={
                submitted && !formData.phone ? "Informe o telefone." : ""
              }
              label={requiredLabel("Telefone")}
              mask="(##) #####-####"
              onChange={(event) =>
                updateField("phone", event.currentTarget.value)
              }
              required
              status={submitted && !formData.phone ? "danger" : undefined}
              value={formData.phone}
            />
            <BrInput
              label="Data de nascimento"
              onChange={(event) =>
                updateField("birthDate", event.currentTarget.value)
              }
              type="date"
              value={formData.birthDate}
            />
            <BrInput
              label="Naturalidade"
              onChange={(event) =>
                updateField("naturality", event.currentTarget.value)
              }
              value={formData.naturality}
            />
            <BrInput
              label="Nome do bebe"
              onChange={(event) =>
                updateField("babyName", event.currentTarget.value)
              }
              value={formData.babyName}
            />
            <BrSelect
              clearable
              emptyOptionsMessage="Nenhum funcionário encontrado"
              isLoading={staffLoading}
              label="Cadastrada por"
              onChange={(value) => updateField("registeredBy", String(value))}
              onClear={() => updateField("registeredBy", "")}
              onSearchChange={() => undefined}
              options={registeredByOptions}
              placeholder="Busque um funcionário"
              value={formData.registeredBy}
            />
            <BrSelect
              label="Receptor"
              onChange={(value) => updateField("receptor", String(value))}
              options={receptorOptions}
              placeholder="Selecione"
              value={formData.receptor}
            />
            <BrInput
              label="Outro receptor"
              onChange={(event) =>
                updateField("receptorOther", event.currentTarget.value)
              }
              value={formData.receptorOther}
            />
            <BrSelect
              label="Origem da orientacao"
              onChange={(value) =>
                updateField("guidanceSource", String(value))
              }
              options={guidanceSourceOptions}
              placeholder="Selecione"
              value={formData.guidanceSource}
            />
            <BrInput
              label="Outra origem"
              onChange={(event) =>
                updateField("guidanceSourceOther", event.currentTarget.value)
              }
              value={formData.guidanceSourceOther}
            />
            {isEditing && (
              <BrSelect
                label="Status"
                onChange={(value) =>
                  updateField("status", String(value) as DonatorStatus)
                }
                options={statusOptions}
                value={formData.status}
              />
            )}
          </div>
        </BrWizard.Panel>

        <BrWizard.Panel title="Endereco e coleta">
          <div className="donator-form__grid">
            <BrInput
              feedbackText={cepLoading ? "Buscando CEP..." : undefined}
              label="CEP"
              maxLength={8}
              onChange={(event) => void loadAddressByCep(event.currentTarget.value)}
              placeholder="77000000"
              value={zipCode}
            />
            <BrInput
              feedbackText={
                submitted && !formData.address ? "Informe o endereco." : ""
              }
              label={requiredLabel("Endereco")}
              onChange={(event) =>
                updateField("address", event.currentTarget.value)
              }
              required
              status={submitted && !formData.address ? "danger" : undefined}
              value={formData.address}
            />
            <BrInput
              feedbackText={
                submitted && !formData.neighborhood ? "Informe o bairro." : ""
              }
              label={requiredLabel("Bairro")}
              onChange={(event) =>
                updateField("neighborhood", event.currentTarget.value)
              }
              required
              status={
                submitted && !formData.neighborhood ? "danger" : undefined
              }
              value={formData.neighborhood}
            />
            <BrInput
              feedbackText={
                submitted && !formData.city ? "Informe a cidade." : ""
              }
              label={requiredLabel("Cidade")}
              onChange={(event) => updateField("city", event.currentTarget.value)}
              required
              status={submitted && !formData.city ? "danger" : undefined}
              value={formData.city}
            />
            <BrInput
              feedbackText={submitted && !formData.state ? "Informe a UF." : ""}
              label={requiredLabel("UF")}
              maxLength={2}
              onChange={(event) =>
                updateField("state", event.currentTarget.value.toUpperCase())
              }
              required
              status={submitted && !formData.state ? "danger" : undefined}
              value={formData.state}
            />
            <BrInput
              label="Ponto de referencia"
              onChange={(event) =>
                updateField("referencePoint", event.currentTarget.value)
              }
              value={formData.referencePoint}
            />
            <div className="donator-form__checks">
              <BrCheckbox
                checked={formData.homeCollection}
                label="Coleta domiciliar"
                onChange={(event) =>
                  updateField("homeCollection", event.currentTarget.checked)
                }
              />
              <BrCheckbox
                checked={formData.exclusiveDonator}
                label="Doadora exclusiva"
                onChange={(event) =>
                  updateField("exclusiveDonator", event.currentTarget.checked)
                }
              />
            </div>
          </div>
        </BrWizard.Panel>

        <BrWizard.Panel title="Historico clinico">
          <div className="donator-form__grid">
            <BrInput
              label="Profissao"
              onChange={(event) =>
                updateField("profession", event.currentTarget.value)
              }
              value={formData.profession}
            />
            <BrInput
              label="Estado civil"
              onChange={(event) =>
                updateField("maritalStatus", event.currentTarget.value)
              }
              value={formData.maritalStatus}
            />
            <BrSelect
              label="Pre-natal"
              onChange={(value) => updateField("prenatalType", String(value))}
              options={prenatalOptions}
              placeholder="Selecione"
              value={formData.prenatalType}
            />
            <BrInput
              label="Local do pre-natal"
              onChange={(event) =>
                updateField("prenatalLocation", event.currentTarget.value)
              }
              value={formData.prenatalLocation}
            />
            <BrSelect
              label="Tipo de parto"
              onChange={(value) => updateField("deliveryType", String(value))}
              options={deliveryOptions}
              placeholder="Selecione"
              value={formData.deliveryType}
            />
            <BrInput
              label="Data do parto"
              onChange={(event) =>
                updateField("deliveryDate", event.currentTarget.value)
              }
              type="date"
              value={formData.deliveryDate}
            />
            <BrInput
              label="Peso ao nascer (g)"
              numeric
              onChange={(event) =>
                updateField("birthWeightGrams", event.currentTarget.value)
              }
              value={formData.birthWeightGrams}
            />
            <BrInput
              label="Peso na gestacao (kg)"
              numeric={{ decimalScale: 2 }}
              onChange={(event) =>
                updateField("pregnancyWeightKg", event.currentTarget.value)
              }
              value={formData.pregnancyWeightKg}
            />
            <BrInput
              label="Altura (m)"
              numeric={{ decimalScale: 2 }}
              onChange={(event) =>
                updateField("heightMeters", event.currentTarget.value)
              }
              value={formData.heightMeters}
            />
            <BrInput
              label="Idade gestacional inicial"
              numeric
              onChange={(event) =>
                updateField(
                  "gestationalAgeInitialWeeks",
                  event.currentTarget.value,
                )
              }
              value={formData.gestationalAgeInitialWeeks}
            />
            <BrInput
              label="Idade gestacional final"
              numeric
              onChange={(event) =>
                updateField(
                  "gestationalAgeFinalWeeks",
                  event.currentTarget.value,
                )
              }
              value={formData.gestationalAgeFinalWeeks}
            />
            <BrInput
              label="Dias"
              numeric
              onChange={(event) =>
                updateField("gestationalAgeDays", event.currentTarget.value)
              }
              value={formData.gestationalAgeDays}
            />
            <div className="donator-form__checks donator-form__checks--wide">
              <BrCheckbox
                checked={formData.receivedBreastfeedingGuidance}
                label="Recebeu orientacao sobre aleitamento"
                onChange={(event) =>
                  updateField(
                    "receivedBreastfeedingGuidance",
                    event.currentTarget.checked,
                  )
                }
              />
              <BrCheckbox
                checked={formData.isFirstChild}
                label="Primeiro filho"
                onChange={(event) =>
                  updateField("isFirstChild", event.currentTarget.checked)
                }
              />
              <BrCheckbox
                checked={formData.breastfedLastChild}
                label="Amamentou o ultimo filho"
                onChange={(event) =>
                  updateField("breastfedLastChild", event.currentTarget.checked)
                }
              />
            </div>
            <BrInput
              label="Duracao da amamentacao anterior"
              onChange={(event) =>
                updateField(
                  "breastfedLastChildDuration",
                  event.currentTarget.value,
                )
              }
              value={formData.breastfedLastChildDuration}
            />
            <BrTextarea
              className="donator-form__field--wide"
              label="Intercorrencias CID-10"
              onChange={(event) =>
                updateField(
                  "pregnancyIntercurrencesCid10",
                  event.currentTarget.value,
                )
              }
              value={formData.pregnancyIntercurrencesCid10}
            />
          </div>
        </BrWizard.Panel>

        <BrWizard.Panel title="Triagem">
          <div className="donator-form__grid">
            <div className="donator-form__checks donator-form__checks--wide">
              <BrCheckbox
                checked={formData.isSmoker}
                label="Fumante"
                onChange={(event) =>
                  updateField("isSmoker", event.currentTarget.checked)
                }
              />
              <BrCheckbox
                checked={formData.usesAlcohol}
                label="Usa alcool"
                onChange={(event) =>
                  updateField("usesAlcohol", event.currentTarget.checked)
                }
              />
              <BrCheckbox
                checked={formData.usesDrugs}
                label="Usa drogas"
                onChange={(event) =>
                  updateField("usesDrugs", event.currentTarget.checked)
                }
              />
              <BrCheckbox
                checked={formData.usesMedication}
                label="Usa medicamentos"
                onChange={(event) =>
                  updateField("usesMedication", event.currentTarget.checked)
                }
              />
              <BrCheckbox
                checked={formData.hadBloodTransfusionLastFiveYears}
                label="Transfusao nos ultimos 5 anos"
                onChange={(event) =>
                  updateField(
                    "hadBloodTransfusionLastFiveYears",
                    event.currentTarget.checked,
                  )
                }
              />
              <BrCheckbox
                checked={formData.declaredFit}
                label="Declarada apta"
                onChange={(event) =>
                  updateField("declaredFit", event.currentTarget.checked)
                }
              />
            </div>
            <BrInput
              label="Cigarros por dia"
              numeric
              onChange={(event) =>
                updateField("cigarettesPerDay", event.currentTarget.value)
              }
              value={formData.cigarettesPerDay}
            />
            <BrSelect
              label="Classificacao de uso"
              onChange={(value) =>
                updateField("substanceUseClassification", String(value))
              }
              options={substanceOptions}
              placeholder="Selecione"
              value={formData.substanceUseClassification}
            />
            <BrInput
              label="Area medica"
              onChange={(event) =>
                updateField("medicalArea", event.currentTarget.value)
              }
              value={formData.medicalArea}
            />
            <BrTextarea
              className="donator-form__field--wide"
              label="Descricao de substancias/medicamentos"
              onChange={(event) =>
                updateField(
                  "substanceUseDescription",
                  event.currentTarget.value,
                )
              }
              value={formData.substanceUseDescription}
            />
            <BrTextarea
              className="donator-form__field--wide"
              label="Observacoes"
              onChange={(event) =>
                updateField("observations", event.currentTarget.value)
              }
              value={formData.observations}
            />
          </div>
        </BrWizard.Panel>

        <BrWizard.Panel title="Exames">
          <div className="donator-form__grid">
            <BrInput
              feedbackText={
                submitted && examStarted && !formData.examDate
                  ? "Informe a data do exame."
                  : ""
              }
              label={examStarted ? requiredLabel("Data do exame") : "Data do exame"}
              onChange={(event) =>
                updateField("examDate", event.currentTarget.value)
              }
              status={
                submitted && examStarted && !formData.examDate
                  ? "danger"
                  : undefined
              }
              type="date"
              value={formData.examDate}
            />
            <BrSelect
              feedbackText={
                submitted && examStarted && !formData.vdrl
                  ? "Informe o resultado."
                  : ""
              }
              label={examStarted ? requiredLabel("VDRL") : "VDRL"}
              onChange={(value) => updateField("vdrl", String(value) as ExamResult)}
              options={examResultOptions}
              placeholder="Selecione"
              status={
                submitted && examStarted && !formData.vdrl
                  ? "danger"
                  : undefined
              }
              value={formData.vdrl}
            />
            <BrSelect
              feedbackText={
                submitted && examStarted && !formData.hbsag
                  ? "Informe o resultado."
                  : ""
              }
              label={examStarted ? requiredLabel("HBsAg") : "HBsAg"}
              onChange={(value) =>
                updateField("hbsag", String(value) as ExamResult)
              }
              options={examResultOptions}
              placeholder="Selecione"
              status={
                submitted && examStarted && !formData.hbsag
                  ? "danger"
                  : undefined
              }
              value={formData.hbsag}
            />
            <BrSelect
              feedbackText={
                submitted && examStarted && !formData.ftaabs
                  ? "Informe o resultado."
                  : ""
              }
              label={examStarted ? requiredLabel("FTA-ABS") : "FTA-ABS"}
              onChange={(value) =>
                updateField("ftaabs", String(value) as ExamResult)
              }
              options={examResultOptions}
              placeholder="Selecione"
              status={
                submitted && examStarted && !formData.ftaabs
                  ? "danger"
                  : undefined
              }
              value={formData.ftaabs}
            />
            <BrSelect
              feedbackText={
                submitted && examStarted && !formData.hiv
                  ? "Informe o resultado."
                  : ""
              }
              label={examStarted ? requiredLabel("HIV") : "HIV"}
              onChange={(value) => updateField("hiv", String(value) as ExamResult)}
              options={examResultOptions}
              placeholder="Selecione"
              status={
                submitted && examStarted && !formData.hiv
                  ? "danger"
                  : undefined
              }
              value={formData.hiv}
            />
            <BrInput
              label="Hb (%)"
              numeric={{ decimalScale: 2 }}
              onChange={(event) =>
                updateField("hbPercentage", event.currentTarget.value)
              }
              value={formData.hbPercentage}
            />
            <BrInput
              label="Ht (%)"
              numeric={{ decimalScale: 2 }}
              onChange={(event) =>
                updateField("htPercentage", event.currentTarget.value)
              }
              value={formData.htPercentage}
            />
          </div>
        </BrWizard.Panel>

        <BrWizard.Panel title="Revisao">
          <dl className="donator-form__review">
            <div>
              <dt>Nome</dt>
              <dd>{formData.name || "-"}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{formData.phone || "-"}</dd>
            </div>
            <div>
              <dt>Endereco</dt>
              <dd>
                {[formData.address, formData.neighborhood, formData.city]
                  .filter(Boolean)
                  .join(" / ") || "-"}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{formData.status}</dd>
            </div>
            <div>
              <dt>Exame</dt>
              <dd>{formData.examDate || "Nao informado"}</dd>
            </div>
          </dl>
        </BrWizard.Panel>
      </BrWizard>
    </section>
  );
}
