import { useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BrButton, BrInput } from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./AcceptInvite.css";

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = useMemo(
    () => searchParams.get("inviteToken") ?? searchParams.get("token") ?? "",
    [searchParams],
  );
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errors, setErrors] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });

  function validate() {
    const nextErrors = {
      token: "",
      password: "",
      confirmPassword: "",
    };

    if (!token.trim()) {
      nextErrors.token = "Informe o token do convite.";
    }

    if (password.length < 6) {
      nextErrors.password = "A senha deve ter no minimo 6 caracteres.";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "As senhas nao conferem.";
    }

    setErrors(nextErrors);

    return (
      !nextErrors.token &&
      !nextErrors.password &&
      !nextErrors.confirmPassword
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      await api.post("/invites/accept", {
        token: token.trim(),
        password,
      });

      setFeedback({
        type: "success",
        message: "Convite aceito. A conta ja pode acessar o sistema.",
      });
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      let message = "Nao foi possivel aceitar o convite.";

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
    <main className="accept-invite">
      <section className="accept-invite__panel">
        <div>
          <h1 className="accept-invite__title">Aceitar convite</h1>
          <p className="accept-invite__description">
            Defina uma senha para concluir o acesso ao Amamenta Brasil.
          </p>
        </div>

        {feedback && (
          <div
            className={`accept-invite__feedback accept-invite__feedback--${feedback.type}`}
          >
            {feedback.message}
          </div>
        )}

        <form className="accept-invite__form" onSubmit={handleSubmit}>
          <BrInput
            feedbackText={errors.token}
            label="Token do convite"
            onChange={(event) => {
              setToken(event.currentTarget.value);
              setErrors((current) => ({ ...current, token: "" }));
            }}
            placeholder="Token recebido por e-mail"
            status={errors.token ? "danger" : undefined}
            value={token}
          />
          <BrInput
            feedbackText={errors.password}
            label="Senha"
            onChange={(event) => {
              setPassword(event.currentTarget.value);
              setErrors((current) => ({ ...current, password: "" }));
            }}
            status={errors.password ? "danger" : undefined}
            type="password"
            value={password}
          />
          <BrInput
            feedbackText={errors.confirmPassword}
            label="Confirmar senha"
            onChange={(event) => {
              setConfirmPassword(event.currentTarget.value);
              setErrors((current) => ({ ...current, confirmPassword: "" }));
            }}
            status={errors.confirmPassword ? "danger" : undefined}
            type="password"
            value={confirmPassword}
          />

          <div className="accept-invite__actions">
            <BrButton disabled={loading} icon="check" primary type="submit">
              {loading ? "Confirmando..." : "Aceitar convite"}
            </BrButton>
            <BrButton icon="sign-in-alt" onClick={() => navigate("/login")} secondary>
              Ir para login
            </BrButton>
          </div>
        </form>
      </section>
    </main>
  );
}
