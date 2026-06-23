import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrButton,
  BrInput,
  BrSelect,
  BrTable,
  BrTag,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./PendingExamsPage.css";

type DonatorStatus = "PENDING_EXAMS" | "ACTIVE" | "INACTIVE";

type Donator = {
  id: string;
  name: string;
  phone: string;
  city: string;
  neighborhood: string;
  status: DonatorStatus;
  lastCollectionDate?: string | null;
};

type DonatorsResponse = {
  data: Donator[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type DonatorRow = Donator & {
  location: string;
  actions: string;
};

const statusOptions = [
  { label: "Pendentes", value: "PENDING_EXAMS" },
  { label: "Ativas", value: "ACTIVE" },
  { label: "Inativas", value: "INACTIVE" },
];

function formatPhone(value: string) {
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

function getStatusTag(status: DonatorStatus) {
  if (status === "ACTIVE") {
    return <BrTag color="success" value="Ativa" />;
  }

  if (status === "PENDING_EXAMS") {
    return <BrTag color="warning" value="Pendente Exames" />;
  }

  return <BrTag color="danger" value="Inativa" />;
}

function getFilenameFromDisposition(disposition?: string) {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? "cadastro-doadora.docx";
}

export default function PendingExamsPage() {
  const navigate = useNavigate();
  const [donators, setDonators] = useState<Donator[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<DonatorStatus>("PENDING_EXAMS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDonators() {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<DonatorsResponse>("/donators", {
        params: {
          page,
          limit,
          name: name || undefined,
          city: city || undefined,
          status,
          pendingExams: status === "PENDING_EXAMS" ? true : undefined,
        },
      });

      setDonators(response.data.data);
      setTotal(response.data.meta.total);
    } catch {
      setError("Nao foi possivel carregar as pendencias de exames.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDonators();
  }, [page, limit]);

  function handleFilter() {
    if (page === 1) {
      void loadDonators();
      return;
    }

    setPage(1);
  }

  function handleClearFilters() {
    setName("");
    setCity("");
    setStatus("PENDING_EXAMS");
    setPage(1);
  }

  async function handleExport(donator: Donator) {
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

  const rows = useMemo<DonatorRow[]>(
    () =>
      donators.map((donator) => ({
        ...donator,
        location: `${donator.city || "-"} / ${donator.neighborhood || "-"}`,
        actions: donator.id,
      })),
    [donators],
  );

  const columns = useMemo<BrTableColumn<DonatorRow>[]>(
    () => [
      {
        key: "name",
        title: "Nome da Doadora",
        width: "26%",
        boldHeading: true,
      },
      {
        key: "phone",
        title: "Telefone",
        width: "16%",
        render: (value) => formatPhone(String(value)),
      },
      {
        key: "location",
        title: "Cidade / Bairro",
        width: "22%",
      },
      {
        key: "lastCollectionDate",
        title: "Ultima Coleta",
        width: "14%",
        render: (value) => formatDate(value),
      },
      {
        key: "status",
        title: "Status",
        width: "14%",
        render: (value) => getStatusTag(value),
      },
      {
        key: "actions",
        title: "Acoes",
        align: "right",
        width: "8%",
        render: (_value, row) => (
          <div className="pending-exams__actions">
            <BrButton
              aria-label={`Ver perfil de ${row.name}`}
              circle
              icon="eye"
              onClick={() => navigate(`/doadoras/${row.id}`)}
              size="small"
            />
            <BrButton
              aria-label={`Editar exames de ${row.name}`}
              circle
              icon="edit"
              onClick={() => navigate(`/doadoras/${row.id}/editar`)}
              size="small"
            />
            <BrButton
              aria-label={`Exportar ficha de ${row.name}`}
              circle
              icon="print"
              onClick={() => void handleExport(row)}
              size="small"
            />
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <section className="pending-exams">
      <header className="pending-exams__header">
        <div>
          <h1 className="pending-exams__title">Exames Pendentes</h1>
          <p className="pending-exams__description">
            Acompanhe doadoras que precisam completar ou regularizar exames.
          </p>
        </div>
        <BrButton
          icon="plus"
          onClick={() => navigate("/doadoras/cadastro")}
          primary
        >
          Criar doadora
        </BrButton>
      </header>

      <div className="pending-exams__filters">
        <BrInput
          label="Nome da doadora"
          onChange={(event) => setName(event.currentTarget.value)}
          placeholder="Buscar por nome"
          value={name}
        />
        <BrInput
          label="Cidade"
          onChange={(event) => setCity(event.currentTarget.value)}
          placeholder="Buscar por cidade"
          value={city}
        />
        <BrSelect
          label="Situacao"
          onChange={(value) => setStatus(String(value) as DonatorStatus)}
          options={statusOptions}
          value={status}
        />
        <div className="pending-exams__actions">
          <BrButton onClick={handleClearFilters} secondary>
            Limpar
          </BrButton>
          <BrButton onClick={handleFilter} primary>
            Filtrar
          </BrButton>
        </div>
      </div>

      {error && <div className="pending-exams__error">{error}</div>}

      <div className="pending-exams__table">
        <BrTable
          columns={columns}
          data={rows}
          density="small"
          emptyContent="Nenhuma pendencia de exame encontrada."
          isLoading={loading}
          paginationProps={{
            page,
            perPage: limit,
            total,
            showTotalizers: true,
            itemTitleSingular: "doadora",
            itemTitlePlural: "doadoras",
            onPageChange: setPage,
            onPerPageChange: setLimit,
          }}
          title="Doadoras com exames pendentes"
        />
      </div>
    </section>
  );
}
