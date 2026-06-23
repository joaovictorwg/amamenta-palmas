import { useState, type FormEvent } from "react";
import axios from "axios";
import { BrButton, BrInput } from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./AppConfiguration.css";

type InviteResponse = {
  id: string;
  email: string;
  role: "admin";
  tenantId: string;
  expiresAt: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function AppConfiguration() {
  const [email, setEmail] = useState("");
  const [tenantIdentifier, setTenantIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errors, setErrors] = useState({
    email: "",
    tenantIdentifier: "",
  });

  function validate() {
    const nextErrors = {
      email: "",
      tenantIdentifier: "",
    };

    if (!email.trim()) {
      nextErrors.email = "Informe o e-mail do administrador.";
    }

    if (!tenantIdentifier.trim()) {
      nextErrors.tenantIdentifier = "Informe o hospital ou dominio.";
    }

    setErrors(nextErrors);

    return !nextErrors.email && !nextErrors.tenantIdentifier;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await api.post<InviteResponse>("/invites/admin", {
        email: email.trim(),
        tenantIdentifier: tenantIdentifier.trim(),
      });

      setFeedback({
        type: "success",
        message: `Convite enviado para ${response.data.email}.`,
      });
      setEmail("");
      setTenantIdentifier("");
    } catch (error) {
      let message = "Nao foi possivel enviar o convite.";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? message;
      }

      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="app-configuration">
      <header className="app-configuration__header">
        <div>
          <h1 className="app-configuration__title">Painel Super Admin</h1>
          <p className="app-configuration__description">
            Envie convites para administradores vinculados a um hospital.
          </p>
        </div>
      </header>

      {feedback && (
        <div
          className={`app-configuration__feedback app-configuration__feedback--${feedback.type}`}
        >
          {feedback.message}
        </div>
      )}

      <form className="app-configuration__panel" onSubmit={handleSubmit}>
        <div className="app-configuration__form-grid">
          <BrInput
            feedbackText={errors.email}
            label="E-mail do administrador"
            onChange={(event) => {
              setEmail(event.currentTarget.value);
              setErrors((current) => ({ ...current, email: "" }));
            }}
            placeholder="admin@hospital.gov.br"
            status={errors.email ? "danger" : undefined}
            type="email"
            value={email}
          />
          <BrInput
            feedbackText={errors.tenantIdentifier}
            label="Hospital ou dominio"
            onChange={(event) => {
              setTenantIdentifier(event.currentTarget.value);
              setErrors((current) => ({ ...current, tenantIdentifier: "" }));
            }}
            placeholder="Nome do hospital ou dominio.gov.br"
            status={errors.tenantIdentifier ? "danger" : undefined}
            value={tenantIdentifier}
          />
        </div>

        <div className="app-configuration__actions">
          <BrButton disabled={loading} icon="paper-plane" primary type="submit">
            {loading ? "Enviando..." : "Enviar convite"}
          </BrButton>
        </div>
      </form>
    </section>
  );
}
