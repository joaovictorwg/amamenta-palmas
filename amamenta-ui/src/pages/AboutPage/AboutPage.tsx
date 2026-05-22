import { useTranslation } from "react-i18next"

export default function AboutPage() {
    const { t } = useTranslation();
    return (
        <div style={{ padding: 20 }}>
            <h1>{t("amamenta.about")}</h1>
        </div>
    )
}