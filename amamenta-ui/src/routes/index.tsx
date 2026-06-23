import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "@/layouts/AppShell/AppShell";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import AcceptInvite from "@/pages/AcceptInvite/AcceptInvite";
import AppConfiguration from "@/pages/SuperAdmin/AppConfiguration/AppConfiguration";
import DonatorFormPage from "@/pages/Donators/DonatorFormPage";
import DonatorsOverviewPage from "@/pages/Donators/DonatorsOverviewPage";
import DonatorProfilePage from "@/pages/Donators/DonatorProfilePage";
import DonatorsListPage from "@/pages/Donators/DonatorsListPage";
import PendingExamsPage from "@/pages/Donators/PendingExamsPage";
import VisitsPage from "@/pages/Visits/VisitsPage";
import GeneralViewPage from "@/pages/Default/GeneralView/GeneralViewPage";
import ForgotPassword from "@/pages/Common/ForgotPassword/ForgotPassword";
import LoginPage from "@/pages/Common/Login/Login";
import ResetPassword from "@/pages/Common/ResetPassword/ResetPassword";
import ModulePlaceholder from "@/pages/ModulePlaceholder/ModulePlaceholder";
import TenantAdminPanel from "@/pages/TenantAdmin/TenantAdminPanel";
import RawMilkCollectionsPage from "@/pages/Default/Donations/RawMilkCollectionsPage";
import DonationsPage from "@/pages/Default/Donations/DonationsPage";

import {
  ALLOWED_DASHBOARD_ROLES,
  ALLOWED_SUPERADMIN_ROLES,
} from "../constants/roles";
import ProtectedRoute from "./ProtectedRoute";



export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={ALLOWED_DASHBOARD_ROLES}>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/visao-geral" replace />,
      },
      {
        path: "visao-geral",
        element: <GeneralViewPage />,
      },
      {
        path: "visao-geral/alertas",
        element: (
          <ModulePlaceholder
            moduleName="Visao Geral"
            title="Alertas"
            description="Alertas e pendencias operacionais do hospital."
          />
        ),
      },
      {
        path: "visao-geral/metricas",
        element: (
          <ModulePlaceholder
            moduleName="Visao Geral"
            title="Metricas"
            description="Indicadores consolidados da operacao."
          />
        ),
      },
      {
        path: "visao-geral/equipe",
        element: <TenantAdminPanel />,
      },
      {
        path: "doacoes",
        element: <DonationsPage />,
      },
      {
        path: "doacoes/coletas",
       element: <RawMilkCollectionsPage />,
        
      },
      {
        path: "doacoes/lotes",
        element: (
          <ModulePlaceholder
            moduleName="Doacoes"
            title="Lotes"
            description="Controle dos lotes de pasteurizacao."
          />
        ),
      },
      {
        path: "doacoes/estoque",
        element: (
          <ModulePlaceholder
            moduleName="Doacoes"
            title="Estoque"
            description="Disponibilidade e distribuicao do leite pasteurizado."
          />
        ),
      },
      {
        path: "doacoes/metricas",
        element: (
          <ModulePlaceholder
            moduleName="Doacoes"
            title="Metricas"
            description="Indicadores do fluxo de doacoes."
          />
        ),
      },
      {
        path: "doadoras",
        element: <DonatorsOverviewPage />,
      },
      {
        path: "doadoras/lista",
        element: <DonatorsListPage />,
      },
      {
        path: "doadoras/cadastro",
        element: <DonatorFormPage />,
      },
      {
        path: "doadoras/:id",
        element: <DonatorProfilePage />,
      },
      {
        path: "doadoras/:id/editar",
        element: <DonatorFormPage />,
      },
      {
        path: "doadoras/exames-pendentes",
        element: <PendingExamsPage />,
      },
      {
        path: "doadoras/exportacoes",
        element: (
          <ModulePlaceholder
            moduleName="Doadoras"
            title="Exportacoes"
            description="Geracao de documentos oficiais de cadastro."
          />
        ),
      },
      {
        path: "visitas",
        element: <VisitsPage />,
      },
      {
        path: "visitas/hoje",
        element: <VisitsPage todayOnly />,
      },
      {
        path: "visitas/historico",
        element: <VisitsPage />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={ALLOWED_SUPERADMIN_ROLES}>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "app-configuration",
        element: <AppConfiguration />,
      },
    ],
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "reset-password",
    element: <ResetPassword />,
  },
  {
    path: "accept-invite",
    element: <AcceptInvite />,
  },
]);
