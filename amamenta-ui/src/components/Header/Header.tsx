import { BrHeader, type BrHeaderProps } from "@govbr-ds/react-components";
import { useTranslation } from "react-i18next";

export default function Header(props: BrHeaderProps) {
    const { title, subTitle, urlLogo } = props
    const { t, i18n } = useTranslation()

    function changeLanguage(lang: string) {
        i18n.changeLanguage(lang)
        localStorage.setItem("lang", lang)
    }

    return (
        <BrHeader
            signature="Amamenta Palmas"
            title={title}
            subTitle={subTitle}
            urlLogo={urlLogo}
            quickAccessLinks={[
                {
                    label: t("amamenta.language.ptBR"),
                    onClick: () => changeLanguage("pt-BR")
                },
                {
                    label: t("amamenta.language.en"),
                    onClick: () => changeLanguage("en")
                }
            ]}
            features={[
                {
                    label: "Configurações",
                    icon: "cog",
                }
            ]}
        />
    )
};