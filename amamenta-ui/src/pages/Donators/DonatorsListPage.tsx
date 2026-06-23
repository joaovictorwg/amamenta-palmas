import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import "./DonatorsListPage.css";

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
  { label: "Todos", value: "" },
  { label: "Ativa", value: "ACTIVE" },
  { label: "Pendente Exames", value: "PENDING_EXAMS" },
  { label: "Inativa", value: "INACTIVE" },
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
    return <BrTag className="donators-list__status" color="success" value="Ativa" />;
  }

  if (status === "PENDING_EXAMS") {
    return (
      <BrTag
        className="donators-list__status"
        color="warning"
        value="Pendente Exames"
      />
    );
  }

  return <BrTag className="donators-list__status" color="danger" value="Inativa" />;
}

function getFilenameFromDisposition(disposition?: string) {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? "cadastro-doadora.docx";
}

export default function DonatorsListPage() {
  const navigate = useNavigate();
  const [donators, setDonators] = useState<Donator[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donatorToInactivate, setDonatorToInactivate] =
    useState<Donator | null>(null);

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
          status: status || undefined,
        },
      });

      setDonators(response.data.data);
      setTotal(response.data.meta.total);
    } catch {
      setError("Nao foi possivel carregar a lista de doadoras.");
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
    setStatus("");
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

  async function handleInactivate() {
    if (!donatorToInactivate) {
      return;
    }

    await api.patch(`/donators/${donatorToInactivate.id}`, {
      status: "INACTIVE",
    });

    setDonatorToInactivate(null);
    await loadDonators();
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
        width: "24%",
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
        width: "20%",
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
        width: "12%",
        render: (_value, row) => (
          <div className="donators-list__actions">
            <BrButton
              aria-label={`Ver perfil de ${row.name}`}
              circle
              icon="eye"
              onClick={() => navigate(`/doadoras/${row.id}`)}
              size="small"
            />
            <BrButton
              aria-label={`Editar ${row.name}`}
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
            <BrButton
              aria-label={`Inativar ${row.name}`}
              circle
              color="danger"
              icon="ban"
              onClick={() => setDonatorToInactivate(row)}
              size="small"
            />
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <section className="donators-list">
      <header className="donators-list__header">
        <div>
          <h1 className="donators-list__title">Doadoras</h1>
          <p className="donators-list__description">
            Consulte o cadastro, status sanitario e dados principais das
            doadoras.
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

      <div className="donators-list__filters">
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
          label="Status"
          onChange={(value) => setStatus(String(value))}
          options={statusOptions}
          placeholder="Todos"
          value={status}
        />
        <div className="donators-list__actions">
          <BrButton onClick={handleClearFilters} secondary>
            Limpar
          </BrButton>
          <BrButton onClick={handleFilter} primary>
            Filtrar
          </BrButton>
        </div>
      </div>

      {error && <div className="donators-list__error">{error}</div>}

      <div className="donators-list__table">
        <BrTable
          columns={columns}
          data={rows}
          density="small"
          emptyContent="Nenhuma doadora encontrada."
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
          title="Lista de doadoras"
        />
      </div>

      <BrModal
        isOpen={Boolean(donatorToInactivate)}
        onClose={() => setDonatorToInactivate(null)}
        primaryAction={{
          label: "Inativar",
          action: () => void handleInactivate(),
        }}
        secondaryAction={{
          label: "Cancelar",
          action: () => setDonatorToInactivate(null),
        }}
        showClose
        title="Inativar doadora"
      >
        <p className="donators-list__modal-text">
          Deseja realmente inativar esta doadora?
        </p>
      </BrModal>
    </section>
  );
}
