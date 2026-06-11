import {
    Outlet,
    useMatches,
    useNavigate,
    useLocation,
} from "react-router-dom"

import { useTranslation } from "react-i18next"
import Header from "../components/Header/Header"
import { BrTab } from "@govbr-ds/react-components"

type Handle = {
    titleKey?: string
}

export default function RootLayout() {
    const { t } = useTranslation()

    const matches = useMatches()
    const navigate = useNavigate()
    const location = useLocation()

    const currentRoute = matches[matches.length - 1] as {
        handle?: Handle
    }

    const title = currentRoute?.handle?.titleKey
        ? t(currentRoute.handle.titleKey)
        : ""

    const tabIndex = location.pathname === "/about" ? 1 : 0

    const handleTabChange = (index: number) => {
        if (index === 0) {
            navigate("/")
        }

        if (index === 1) {
            navigate("/about")
        }
    }

    return (
        <div>
            <Header
                title={title}
                subTitle={""}
            />

            <BrTab
                items={[t("amamenta.home"), t("amamenta.about"),]}
                activeIndex={tabIndex}
                onChange={handleTabChange}
                children={undefined}
            />

            <main style={{ padding: 20 }}>
                <Outlet />
            </main>
        </div>
    )
}