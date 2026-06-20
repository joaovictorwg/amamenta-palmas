import { useState, type FormEvent } from "react";
import axios from "axios";
import { BrButton, BrInput } from "@govbr-ds/react-components";

import { useAuth } from "@/contexts/AuthContext/useAuth";
import { api } from "@/services/api";

import "./TenantAdminPanel.css";

type InviteResponse = {
  id: string;
  email: string;
  role: "employee";
  tenantId: string;
  expiresAt: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function TenantAdminPanel() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const canInvite = user?.role === "admin";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Informe o e-mail do colaborador.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await api.post<InviteResponse>("/invites/employee", {
        email: email.trim(),
      });

      setFeedback({
        type: "success",
        message: `Convite enviado para ${response.data.email}.`,
      });
      setEmail("");
    } catch (requestError) {
      let message = "Nao foi possivel enviar o convite.";

      if (axios.isAxiosError(requestError)) {
        message = requestError.response?.data?.message ?? message;
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
    <section className="tenant-admin">
      <header className="tenant-admin__header">
        <div>
          <h1 className="tenant-admin__title">Equipe</h1>
          <p className="tenant-admin__description">
            Convide colaboradores para acessar o sistema dentro deste hospital.
          </p>
        </div>
      </header>

      {!canInvite && (
        <div className="tenant-admin__feedback tenant-admin__feedback--error">
          Apenas administradores do hospital podem enviar convites.
        </div>
      )}

      {feedback && (
        <div
          className={`tenant-admin__feedback tenant-admin__feedback--${feedback.type}`}
        >
          {feedback.message}
        </div>
      )}

      {canInvite && (
        <form className="tenant-admin__panel" onSubmit={handleSubmit}>
          <BrInput
            feedbackText={error}
            label="E-mail do colaborador"
            onChange={(event) => {
              setEmail(event.currentTarget.value);
              setError("");
            }}
            placeholder="colaborador@hospital.gov.br"
            status={error ? "danger" : undefined}
            type="email"
            value={email}
          />

          <div className="tenant-admin__actions">
            <BrButton disabled={loading} icon="paper-plane" primary type="submit">
              {loading ? "Enviando..." : "Enviar convite"}
            </BrButton>
          </div>
        </form>
      )}
    </section>
  );
}
