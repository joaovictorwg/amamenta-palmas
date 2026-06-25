import { useState } from "react";
import { Link } from "react-router-dom";

import { BrButton, BrCard, BrInput, BrLoading } from "@govbr-ds/react-components";
import { useTranslation } from "react-i18next";

import * as styled from "./styles"
import PasswordVisibilityButton from "./components/PasswordVisibilityButton/PasswordVisibilityButton";
import { useLogin } from "./hook";

export default function LoginPage() {
    const {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        errors,
        clearError,
        handleLogin,
    } = useLogin();

    const { t } = useTranslation();

    const [visibility, setVisibility] = useState(false)

    return (
        <styled.LoginPage>
            {
                loading
                    ? <BrLoading label={t("amamenta.loading")} />

                    : <BrCard>
                        <styled.CardContent>
                            <h3>Login</h3>
                            <form onSubmit={handleLogin}>
                                <BrInput
                                    type="email"
                                    label={t("amamenta.input.email")}
                                    placeholder={t("amamenta.input.email.placeholder")}
                                    value={email}
                                    status={errors.email ? "danger" : undefined}
                                    feedbackText={errors.email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        clearError("email");
                                    }
                                    }
                                />
                                <BrInput
                                    type={visibility ? "text" : "password"}
                                    label={t("amamenta.input.password")}
                                    placeholder={t("amamenta.input.password.placeholder")}
                                    value={password}
                                    status={errors.password ? "danger" : undefined}
                                    feedbackText={errors.password}
                                    button={
                                        <styled.VisibilityButton $errorVisible={!!errors.password}>
                                            <PasswordVisibilityButton
                                                visibility={visibility}
                                                setVisibility={setVisibility}
                                            />
                                        </styled.VisibilityButton>
                                    }
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        clearError("password");
                                    }
                                    }
                                />
                                <styled.ForgotPasswordLink>
                                    <Link to="/forgot-password">Esqueci minha senha</Link>
                                </styled.ForgotPasswordLink>
                                <BrButton type="submit" primary >
                                    {t("amamenta.login")}
                                </BrButton>
                            </form>
                        </styled.CardContent>
                    </BrCard>
            }
        </styled.LoginPage >
    );
}
