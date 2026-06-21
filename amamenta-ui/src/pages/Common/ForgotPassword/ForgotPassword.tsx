import { useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BrButton, BrInput } from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./ForgotPassword.css";

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setEmailError("Informe seu e-mail.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setFeedback({
        type: "success",
        message:
          "Se o e-mail estiver cadastrado, voce recebera as instrucoes para redefinir a senha.",
      });
    } catch (error) {
      let message = "Nao foi possivel solicitar a redefinicao de senha.";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? message;
      }

      setFeedback({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="forgot-password">
      <section className="forgot-password__panel">
        <div>
          <h1 className="forgot-password__title">Recuperar senha</h1>
          <p className="forgot-password__description">
            Informe o e-mail da conta para receber o link de redefinicao.
          </p>
        </div>

        {feedback && (
          <div
            className={`forgot-password__feedback forgot-password__feedback--${feedback.type}`}
          >
            {feedback.message}
          </div>
        )}

        <form className="forgot-password__form" onSubmit={handleSubmit}>
          <BrInput
            feedbackText={emailError}
            label="E-mail"
            onChange={(event) => {
              setEmail(event.currentTarget.value);
              setEmailError("");
            }}
            placeholder="seu.email@hospital.gov.br"
            status={emailError ? "danger" : undefined}
            type="email"
            value={email}
          />

          <div className="forgot-password__actions">
            <BrButton disabled={loading} icon="paper-plane" primary type="submit">
              {loading ? "Enviando..." : "Enviar link"}
            </BrButton>
            <BrButton icon="arrow-left" onClick={() => navigate("/login")} secondary>
              Voltar ao login
            </BrButton>
          </div>
        </form>
      </section>
    </main>
  );
}
