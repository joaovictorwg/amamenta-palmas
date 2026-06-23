import { useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BrButton, BrInput } from "@govbr-ds/react-components";

import { api } from "@/services/api";

import "./ResetPassword.css";

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [token, setToken] = useState(tokenFromUrl);
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
      nextErrors.token = "Informe o token de redefinicao.";
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
      await api.post("/auth/reset-password", {
        token: token.trim(),
        newPassword: password,
      });

      setFeedback({
        type: "success",
        message: "Senha redefinida com sucesso. Voce ja pode fazer login.",
      });
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      let message = "Nao foi possivel redefinir a senha.";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? message;
      }

      setFeedback({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="reset-password">
      <section className="reset-password__panel">
        <div>
          <h1 className="reset-password__title">Redefinir senha</h1>
          <p className="reset-password__description">
            Defina uma nova senha para sua conta.
          </p>
        </div>

        {feedback && (
          <div
            className={`reset-password__feedback reset-password__feedback--${feedback.type}`}
          >
            {feedback.message}
          </div>
        )}

        <form className="reset-password__form" onSubmit={handleSubmit}>
          <BrInput
            feedbackText={errors.token}
            label="Token"
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
            label="Nova senha"
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
            label="Confirmar nova senha"
            onChange={(event) => {
              setConfirmPassword(event.currentTarget.value);
              setErrors((current) => ({ ...current, confirmPassword: "" }));
            }}
            status={errors.confirmPassword ? "danger" : undefined}
            type="password"
            value={confirmPassword}
          />

          <div className="reset-password__actions">
            <BrButton disabled={loading} icon="check" primary type="submit">
              {loading ? "Salvando..." : "Redefinir senha"}
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
