import * as styled from "./styles"
import { useTranslation } from "react-i18next"

export default function DonationsPage() {
    const { t } = useTranslation();
    return (
        <styled.DonationsPage data-testid="donations-page">
            <styled.Content data-testid="donations-page-content">
                <h1>{t("amamenta.donations")}</h1>
            </styled.Content>
        </styled.DonationsPage>
    )
}