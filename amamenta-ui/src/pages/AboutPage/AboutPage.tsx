import { useTranslation } from "react-i18next"

export default function AboutPage() {
    const { t } = useTranslation();
    return (
        <div style={{ padding: 20 }}>
            <h1>{t("amamenta.about")}</h1>

            <p>Este é um exemplo de página "Sobre".</p>

            <p>
                Aqui você pode colocar informações sobre o projeto, equipe ou aplicação.
            </p>
        </div>
    )
}