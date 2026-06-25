import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  BrButton,
  BrInput,
  BrTable,
  type BrTableColumn,
} from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./AppConfiguration.css";

type Tenant = {
  id: string;
  name: string;
  domain: string;
  autoJoinByDomain: boolean;
  isActive: boolean;
};

type User = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  tenantId?: string | null;
};

type Invite = {
  id: string;
  email: string;
  role: "admin" | "employee";
  tenantId: string;
  used: boolean;
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

export default function AppConfiguration() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [tenantName, setTenantName] = useState("");
  const [tenantDomain, setTenantDomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [tenantIdentifier, setTenantIdentifier] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const [tenantResponse, adminResponse, inviteResponse] = await Promise.all([
      api.get<{ data: Tenant[] }>("/tenants"),
      api.get<User[]>("/users", { params: { role: "admin" } }),
      api.get<{ data: Invite[] }>("/invites", {
        params: { role: "admin", pending: true },
      }),
    ]);

    setTenants(tenantResponse.data.data);
    setAdmins(adminResponse.data);
    setInvites(inviteResponse.data.data);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateTenant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await api.post("/tenants", {
        name: tenantName.trim(),
        domain: tenantDomain.trim(),
        autoJoinByDomain: false,
      });
      setTenantName("");
      setTenantDomain("");
      setFeedback({ type: "success", message: t("superAdmin.createTenant.success") });
      await loadData();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, t("superAdmin.createTenant.error")),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await api.post("/invites/admin", {
        email: adminEmail.trim(),
        tenantIdentifier: tenantIdentifier.trim(),
      });
      setAdminEmail("");
      setTenantIdentifier("");
      setFeedback({ type: "success", message: t("superAdmin.inviteAdmin.success") });
      await loadData();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, t("superAdmin.inviteAdmin.error")),
      });
    } finally {
      setLoading(false);
    }
  }

  async function editTenant(tenant: Tenant) {
    const name = window.prompt(t("superAdmin.tenants.promptName"), tenant.name);
    if (!name) return;
    const domain = window.prompt(t("superAdmin.tenants.promptDomain"), tenant.domain);
    if (!domain) return;

    await api.patch(`/tenants/${tenant.id}`, { name, domain });
    await loadData();
  }

  async function deleteTenant(tenant: Tenant) {
    if (!window.confirm(t("superAdmin.tenants.confirmDelete", { name: tenant.name }))) return;
    await api.delete(`/tenants/${tenant.id}`);
    await loadData();
  }

  async function editAdmin(admin: User) {
    const name = window.prompt(t("common.prompt.name"), admin.name ?? "");
    if (name === null) return;
    const email = window.prompt(t("common.prompt.email"), admin.email);
    if (!email) return;

    await api.patch(`/users/${admin.id}`, { name, email });
    await loadData();
  }

  async function deleteUser(user: User) {
    if (!window.confirm(t("superAdmin.admins.confirmDelete", { email: user.email }))) return;
    await api.delete(`/users/${user.id}`);
    await loadData();
  }

  async function deleteInvite(invite: Invite) {
    if (!window.confirm(t("superAdmin.invites.confirmDelete", { email: invite.email }))) return;
    await api.delete(`/invites/${invite.id}`);
    await loadData();
  }

  const tenantColumns = useMemo<BrTableColumn<Tenant>[]>(
    () => [
      { key: "name", title: t("superAdmin.tenants.hospital"), boldHeading: true },
      { key: "domain", title: t("superAdmin.tenants.domain") },
      { key: "isActive", title: t("superAdmin.tenants.active"), render: (value) => (value ? t("common.yes") : t("common.no")) },
      {
        key: "id",
        title: t("common.actions"),
        align: "right",
        render: (_value, row) => (
          <div className="app-configuration__row-actions">
            <BrButton circle icon="edit" onClick={() => void editTenant(row)} size="small" />
            <BrButton circle color="danger" icon="trash" onClick={() => void deleteTenant(row)} size="small" />
          </div>
        ),
      },
    ],
    [t],
  );

  const adminColumns = useMemo<BrTableColumn<User>[]>(
    () => [
      { key: "name", title: t("common.name"), render: (value) => String(value ?? "-") },
      { key: "email", title: t("common.email"), boldHeading: true },
      {
        key: "id",
        title: t("common.actions"),
        align: "right",
        render: (_value, row) => (
          <div className="app-configuration__row-actions">
            <BrButton circle icon="edit" onClick={() => void editAdmin(row)} size="small" />
            <BrButton circle color="danger" icon="trash" onClick={() => void deleteUser(row)} size="small" />
          </div>
        ),
      },
    ],
    [t],
  );

  const inviteColumns = useMemo<BrTableColumn<Invite>[]>(
    () => [
      { key: "email", title: t("common.email"), boldHeading: true },
      { key: "tenantId", title: t("superAdmin.invites.tenant") },
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
    <section className="app-configuration">
      <header className="app-configuration__header">
        <div>
          <h1 className="app-configuration__title">{t("superAdmin.title")}</h1>
          <p className="app-configuration__description">
            {t("superAdmin.description")}
          </p>
        </div>
      </header>

      {feedback && (
        <div className={`app-configuration__feedback app-configuration__feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="app-configuration__forms">
        <form className="app-configuration__panel" onSubmit={handleCreateTenant}>
          <h2>{t("superAdmin.createTenant.title")}</h2>
          <div className="app-configuration__form-grid">
            <BrInput label={t("superAdmin.createTenant.nameLabel")} onChange={(event) => setTenantName(event.currentTarget.value)} value={tenantName} />
            <BrInput label={t("superAdmin.createTenant.domainLabel")} onChange={(event) => setTenantDomain(event.currentTarget.value)} value={tenantDomain} />
          </div>
          <div className="app-configuration__actions">
            <BrButton disabled={loading} icon="plus" primary type="submit">{t("common.create")}</BrButton>
          </div>
        </form>

        <form className="app-configuration__panel" onSubmit={handleInviteAdmin}>
          <h2>{t("superAdmin.inviteAdmin.title")}</h2>
          <div className="app-configuration__form-grid">
            <BrInput label={t("superAdmin.inviteAdmin.emailLabel")} onChange={(event) => setAdminEmail(event.currentTarget.value)} type="email" value={adminEmail} />
            <BrInput label={t("superAdmin.inviteAdmin.tenantLabel")} onChange={(event) => setTenantIdentifier(event.currentTarget.value)} value={tenantIdentifier} />
          </div>
          <div className="app-configuration__actions">
            <BrButton disabled={loading} icon="paper-plane" primary type="submit">{t("common.sendInvite")}</BrButton>
          </div>
        </form>
      </div>

      <div className="app-configuration__table"><BrTable columns={tenantColumns} data={tenants} density="small" title={t("superAdmin.tenants.tableTitle")} /></div>
      <div className="app-configuration__table"><BrTable columns={adminColumns} data={admins} density="small" title={t("superAdmin.admins.tableTitle")} /></div>
      <div className="app-configuration__table"><BrTable columns={inviteColumns} data={invites} density="small" title={t("superAdmin.invites.tableTitle")} /></div>
    </section>
  );
}
