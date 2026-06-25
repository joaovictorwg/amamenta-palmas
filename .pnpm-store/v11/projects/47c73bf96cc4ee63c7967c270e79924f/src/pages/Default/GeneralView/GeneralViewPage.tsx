import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export default function GeneralViewPage() {
    const { t } = useTranslation();
    return (
        <div style={{ padding: 20 }}>
            <h1>{t("amamenta.home.welcome")}</h1>

            <nav>
                <Link to="/donations">Ir para Doações</Link>
            </nav>
        </div>
    )
}