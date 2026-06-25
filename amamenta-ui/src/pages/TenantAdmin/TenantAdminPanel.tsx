import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  BrButton,
  BrInput,
  BrTable,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { useAuth } from "@/contexts/AuthContext/useAuth";
import { api } from "@/services/api";

import "./TenantAdminPanel.css";

type User = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
};

type Invite = {
  id: string;
  email: string;
  expiresAt: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}

export default function TenantAdminPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [employees, setEmployees] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const canManage = user?.role === "admin";

  async function loadData() {
    if (!canManage) return;

    const [usersResponse, invitesResponse] = await Promise.all([
      api.get<User[]>("/users", { params: { role: "employee" } }),
      api.get<{ data: Invite[] }>("/invites", {
        params: { role: "employee", pending: true },
      }),
    ]);

    setEmployees(usersResponse.data);
    setInvites(invitesResponse.data.data);
  }

  useEffect(() => {
    void loadData();
  }, [canManage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await api.post("/invites/employee", { email: email.trim() });
      setEmail("");
      setFeedback({ type: "success", message: t("tenantAdmin.invite.success") });
      await loadData();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, t("tenantAdmin.invite.error")),
      });
    } finally {
      setLoading(false);
    }
  }

  async function editEmployee(employee: User) {
    const name = window.prompt(t("common.prompt.name"), employee.name ?? "");
    if (name === null) return;
    const email = window.prompt(t("common.prompt.email"), employee.email);
    if (!email) return;

    await api.patch(`/users/${employee.id}`, { name, email });
    await loadData();
  }

  async function deleteEmployee(employee: User) {
    if (!window.confirm(t("tenantAdmin.employees.confirmDelete", { email: employee.email }))) return;
    await api.delete(`/users/${employee.id}`);
    await loadData();
  }

  async function deleteInvite(invite: Invite) {
    if (!window.confirm(t("tenantAdmin.invites.confirmDelete", { email: invite.email }))) return;
    await api.delete(`/invites/${invite.id}`);
    await loadData();
  }

  const employeeColumns = useMemo<BrTableColumn<User>[]>(
    () => [
      { key: "name", title: t("common.name"), render: (value) => String(value ?? "-") },
      { key: "email", title: t("common.email"), boldHeading: true },
      {
        key: "id",
        title: t("common.actions"),
        align: "right",
        render: (_value, row) => (
          <div className="tenant-admin__row-actions">
            <BrButton circle icon="edit" onClick={() => void editEmployee(row)} size="small" />
            <BrButton circle color="danger" icon="trash" onClick={() => void deleteEmployee(row)} size="small" />
          </div>
        ),
      },
    ],
    [t],
  );

  const inviteColumns = useMemo<BrTableColumn<Invite>[]>(
    () => [
      { key: "email", title: t("common.email"), boldHeading: true },
      { key: "expiresAt", title: t("superAdmin.invites.expiresAt"), render: (value) => new Date(String(value)).toLocaleDateString("pt-BR") },
      {
        key: "id",
        title: t("common.actions"),
        align: "right",
        render: (_value, row) => (
          <BrButton circle color="danger" icon="trash" onClick={() => void deleteInvite(row)} size="small" />
        ),
      },
    ],
    [t],
  );

  return (
    <section className="tenant-admin">
      <header className="tenant-admin__header">
        <div>
          <h1 className="tenant-admin__title">{t("tenantAdmin.title")}</h1>
          <p className="tenant-admin__description">
            {t("tenantAdmin.description")}
          </p>
        </div>
      </header>

      {!canManage && (
        <div className="tenant-admin__feedback tenant-admin__feedback--error">
          {t("tenantAdmin.permissionDenied")}
        </div>
      )}

      {feedback && (
        <div className={`tenant-admin__feedback tenant-admin__feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {canManage && (
        <>
          <form className="tenant-admin__panel" onSubmit={handleSubmit}>
            <BrInput
              label={t("tenantAdmin.invite.emailLabel")}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder={t("tenantAdmin.invite.placeholder")}
              type="email"
              value={email}
            />
            <div className="tenant-admin__actions">
              <BrButton disabled={loading} icon="paper-plane" primary type="submit">
                {t("common.sendInvite")}
              </BrButton>
            </div>
          </form>

          <div className="tenant-admin__table">
            <BrTable columns={employeeColumns} data={employees} density="small" title={t("tenantAdmin.employees.tableTitle")} />
          </div>

          <div className="tenant-admin__table">
            <BrTable columns={inviteColumns} data={invites} density="small" title={t("tenantAdmin.invites.tableTitle")} />
          </div>
        </>
      )}
    </section>
  );
}
