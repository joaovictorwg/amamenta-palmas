import { BrTab } from "@govbr-ds/react-components";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import Header from "@/components/Header/Header";
import { useAuth } from "@/contexts/AuthContext/useAuth";
import { appSections, getSectionByPath } from "@/navigation/appNavigation";

import "./AppShell.css";

export default function AppShell() {
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
          items={appSections.map((section) => section.label)}
          activeIndex={activeIndex}
          onChange={handleTabChange}
          children={undefined}
        />
      </div>

      <div className="app-shell__body">
        <aside className="app-shell__side-nav" aria-label={activeSection.label}>
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
                >
                  {item.label}
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
