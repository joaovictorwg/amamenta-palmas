import { ROLES } from "@/constants/roles";
import type { UserRole } from "@/types/auth";

export type AppSectionId = "overview" | "donations" | "donators" | "visits";

export type SideNavItem = {
  labelKey: string;
  icon: string;
  path: string;
  roles?: UserRole[];
};

export type AppSection = {
  id: AppSectionId;
  labelKey: string;
  path: string;
  sideNav: SideNavItem[];
};

export const appSections: AppSection[] = [
  {
    id: "overview",
    labelKey: "navigation.overview",
    path: "/visao-geral",
    sideNav: [
      { labelKey: "navigation.summary", icon: "chart-line", path: "/visao-geral" },
      { labelKey: "navigation.alerts", icon: "exclamation-triangle", path: "/visao-geral/alertas" },
      { labelKey: "navigation.metrics", icon: "chart-bar", path: "/visao-geral/metricas" },
      { labelKey: "navigation.team", icon: "users", path: "/visao-geral/equipe", roles: [ROLES.ADMIN] },
    ],
  },
  {
    id: "donations",
    labelKey: "navigation.donations",
    path: "/doacoes",
    sideNav: [
      { labelKey: "navigation.overview", icon: "chart-pie", path: "/doacoes" },
      { labelKey: "navigation.collections", icon: "tint", path: "/doacoes/coletas" },
      { labelKey: "navigation.batches", icon: "layer-group", path: "/doacoes/lotes" },
      { labelKey: "navigation.stock", icon: "archive", path: "/doacoes/estoque" },
      { labelKey: "navigation.metrics", icon: "chart-bar", path: "/doacoes/metricas" },
    ],
  },
  {
    id: "donators",
    labelKey: "navigation.donators",
    path: "/doadoras",
    sideNav: [
      { labelKey: "navigation.overview", icon: "chart-pie", path: "/doadoras" },
      { labelKey: "navigation.donators", icon: "user", path: "/doadoras/lista" },
      { labelKey: "navigation.registration", icon: "user-plus", path: "/doadoras/cadastro" },
      { labelKey: "navigation.pendingExams", icon: "vial", path: "/doadoras/exames-pendentes" },
      { labelKey: "navigation.exports", icon: "file-export", path: "/doadoras/exportacoes" },
    ],
  },
  {
    id: "visits",
    labelKey: "navigation.visits",
    path: "/visitas",
    sideNav: [
      { labelKey: "navigation.schedule", icon: "calendar-days", path: "/visitas" },
      { labelKey: "navigation.today", icon: "calendar-day", path: "/visitas/hoje" },
      { labelKey: "navigation.history", icon: "clock-rotate-left", path: "/visitas/historico" },
    ],
  },
];

export function getSectionByPath(pathname: string): AppSection {
  return (
    appSections.find((section) => pathname.startsWith(section.path)) ??
    appSections[0]
  );
}
