import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext/useAuth";
import { BrAvatar, BrButton, BrNotification } from "@govbr-ds/react-components";
import { useTranslation } from "react-i18next";

import * as styled from "./styles";

export default function AvatarMenu() {
    const { user, logout } = useAuth();

    const navigate = useNavigate();
    const { t } = useTranslation();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <BrButton
            icon="chevron-down"
            closeIcon="chevron-up"
            circle
            dropdownDirection="left"
            dropdownItems={
                <styled.AvatarMenuDropdown>
                    <BrNotification
                        title={user?.email}
                        subtitle={user?.role}
                        items={[
                            {
                                content: t("amamenta.profile"),
                                icon: "user",
                                onClick: () =>
                                    window.alert("/profile"),
                                closeOnClick: true,
                            },
                            {
                                content: t("amamenta.logout"),
                                icon: "sign-out-alt",
                                isDanger: true,
                                onClick: handleLogout,
                                closeOnClick: true,
                            },
                        ]}
                    />
                </styled.AvatarMenuDropdown>
            }
        >
            <BrAvatar
                src="https://picsum.photos/id/517/400"
                type="image"
            />
        </BrButton>
    );
}