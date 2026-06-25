export type AppSectionId = "overview" | "donations" | "donators" | "visits";

export type SideNavItem = {
  label: string;
  path: string;
};

export type AppSection = {
  id: AppSectionId;
  label: string;
  path: string;
  sideNav: SideNavItem[];
};

export const appSections: AppSection[] = [
  {
    id: "overview",
    label: "Visao Geral",
    path: "/visao-geral",
    sideNav: [
      { label: "Resumo", path: "/visao-geral" },
      { label: "Alertas", path: "/visao-geral/alertas" },
      { label: "Metricas", path: "/visao-geral/metricas" },
      { label: "Equipe", path: "/visao-geral/equipe" },
    ],
  },
  {
    id: "donations",
    label: "Doacoes",
    path: "/doacoes",
    sideNav: [
      { label: "Visao Geral", path: "/doacoes" },
      { label: "Coletas", path: "/doacoes/coletas" },
      { label: "Lotes", path: "/doacoes/lotes" },
      { label: "Estoque", path: "/doacoes/estoque" },
      { label: "Metricas", path: "/doacoes/metricas" },
    ],
  },
  {
    id: "donators",
    label: "Doadoras",
    path: "/doadoras",
    sideNav: [
      { label: "Visao Geral", path: "/doadoras" },
      { label: "Doadoras", path: "/doadoras/lista" },
      { label: "Cadastro", path: "/doadoras/cadastro" },
      { label: "Exames Pendentes", path: "/doadoras/exames-pendentes" },
      { label: "Exportacoes", path: "/doadoras/exportacoes" },
    ],
  },
  {
    id: "visits",
    label: "Visitas",
    path: "/visitas",
    sideNav: [
      { label: "Agenda", path: "/visitas" },
      { label: "Hoje", path: "/visitas/hoje" },
      { label: "Historico", path: "/visitas/historico" },
    ],
  },
];

export function getSectionByPath(pathname: string): AppSection {
  return (
    appSections.find((section) => pathname.startsWith(section.path)) ??
    appSections[0]
  );
}
