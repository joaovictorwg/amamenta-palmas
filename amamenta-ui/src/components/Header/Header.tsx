import { BrHeader, type BrHeaderProps } from "@govbr-ds/react-components";
import { useTranslation } from "react-i18next";
import AvatarMenu from "./components/AvatarMenu/AvatarMenu";

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
            urlLogo={urlLogo ?? "https://www.gov.br/ds/assets/img/govbr-logo.png"}
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
            loggedIn
            avatar={<AvatarMenu />}
        />
    )
};