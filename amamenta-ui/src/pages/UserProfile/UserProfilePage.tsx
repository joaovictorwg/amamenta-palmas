import { useState, type FormEvent } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { BrButton, BrInput } from "@govbr-ds/react-components";

import { useAuth } from "@/contexts/AuthContext/useAuth";
import { api } from "@/services/api";

import "./UserProfilePage.css";

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

export default function UserProfilePage() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    setFeedback(null);

    try {
      const response = await api.patch(`/users/${user.id}`, {
        name: name || null,
        email,
      });
      setUser(response.data);
      setFeedback({ type: "success", message: t("userProfile.profileSuccess") });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, t("userProfile.profileError")),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await api.patch("/users/me/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setFeedback({ type: "success", message: t("userProfile.passwordSuccess") });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, t("userProfile.passwordError")),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="user-profile">
      <header className="user-profile__header">
        <div>
          <h1 className="user-profile__title">{t("userProfile.title")}</h1>
          <p className="user-profile__description">
            {t("userProfile.description")}
          </p>
        </div>
      </header>

      {feedback && (
        <div className={`user-profile__feedback user-profile__feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="user-profile__grid">
        <form className="user-profile__panel" onSubmit={handleProfileSubmit}>
          <h2>{t("userProfile.basicData.title")}</h2>
          <BrInput label={t("common.name")} onChange={(event) => setName(event.currentTarget.value)} value={name} />
          <BrInput label={t("common.email")} onChange={(event) => setEmail(event.currentTarget.value)} type="email" value={email} />
          <div className="user-profile__actions">
            <BrButton disabled={loading} icon="save" primary type="submit">{t("common.save")}</BrButton>
          </div>
        </form>

        <form className="user-profile__panel" onSubmit={handlePasswordSubmit}>
          <h2>{t("userProfile.password.title")}</h2>
          <BrInput label={t("userProfile.currentPassword")} onChange={(event) => setCurrentPassword(event.currentTarget.value)} type="password" value={currentPassword} />
          <BrInput label={t("userProfile.newPassword")} onChange={(event) => setNewPassword(event.currentTarget.value)} type="password" value={newPassword} />
          <div className="user-profile__actions">
            <BrButton disabled={loading} icon="key" primary type="submit">{t("userProfile.password.title")}</BrButton>
          </div>
        </form>
      </div>
    </section>
  );
}
