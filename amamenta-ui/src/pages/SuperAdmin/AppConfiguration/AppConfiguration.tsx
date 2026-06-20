import { useTranslation } from "react-i18next"

export default function AppConfiguration() {
    const { t } = useTranslation();

    return (
        <div style={{ padding: 20 }}>
            <h1>{t("amamenta.home.welcome")}</h1>
        </div>
    )
}