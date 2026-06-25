import { BrTab } from "@govbr-ds/react-components";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import Header from "@/components/Header/Header";
import { useAuth } from "@/contexts/AuthContext/useAuth";
import { appSections, getSectionByPath } from "@/navigation/appNavigation";

import "./AppShell.css";

export default function AppShell() {
  const { t } = useTranslation();
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeSection = getSectionByPath(location.pathname);
  const activeIndex = appSections.findIndex(
    (section) => section.id === activeSection.id,
  );
  const visibleSideNav = activeSection.sideNav.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  function handleTabChange(index: number) {
    const section = appSections[index];

    if (section) {
      navigate(section.path);
    }
  }

  return (
    <div className="app-shell">
      <Header title="" subTitle="" />

      <div className="app-shell__tabs">
        <BrTab
          items={appSections.map((section) => t(section.labelKey))}
          activeIndex={activeIndex}
          onChange={handleTabChange}
          children={undefined}
        />
      </div>

      <div className={`app-shell__body${isSideNavCollapsed ? " app-shell__body--collapsed" : ""}`}>
        <aside className="app-shell__side-nav" aria-label={t(activeSection.labelKey)}>
          <button
            aria-label={
              isSideNavCollapsed
                ? t("navigation.expandSidePanel")
                : t("navigation.collapseSidePanel")
            }
            className="app-shell__side-toggle"
            onClick={() => setIsSideNavCollapsed((current) => !current)}
            title={
              isSideNavCollapsed
                ? t("navigation.expandSidePanel")
                : t("navigation.collapseSidePanel")
            }
            type="button"
          >
            <i
              aria-hidden="true"
              className={`fas fa-${isSideNavCollapsed ? "chevron-right" : "chevron-left"}`}
            />
          </button>
          <ul className="app-shell__side-list">
            {visibleSideNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  className={({ isActive }) =>
                    [
                      "app-shell__side-link",
                      isActive ? "app-shell__side-link--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                  end={item.path === activeSection.path}
                  to={item.path}
                  title={isSideNavCollapsed ? t(item.labelKey) : undefined}
                >
                  <i aria-hidden="true" className={`fas fa-${item.icon}`} />
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
