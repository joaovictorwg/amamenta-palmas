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
import PasteurizedStockPage from "@/pages/Default/Donations/PasteurizedStockPage";
import UserProfilePage from "@/pages/UserProfile/UserProfilePage";

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
            moduleNameKey="navigation.overview"
            titleKey="navigation.alerts"
            descriptionKey="modulePlaceholder.overviewAlerts"
          />
        ),
      },
      {
        path: "visao-geral/metricas",
        element: (
          <ModulePlaceholder
            moduleNameKey="navigation.overview"
            titleKey="navigation.metrics"
            descriptionKey="modulePlaceholder.overviewMetrics"
          />
        ),
      },
      {
        path: "visao-geral/equipe",
        element: <TenantAdminPanel />,
      },
      {
        path: "perfil",
        element: <UserProfilePage />,
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
            moduleNameKey="navigation.donations"
            titleKey="navigation.batches"
            descriptionKey="modulePlaceholder.donationBatches"
          />
        ),
      },
      {
        path: "doacoes/estoque",
        element: <PasteurizedStockPage />,
      },
      {
        path: "doacoes/metricas",
        element: (
          <ModulePlaceholder
            moduleNameKey="navigation.donations"
            titleKey="navigation.metrics"
            descriptionKey="modulePlaceholder.donationMetrics"
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
            moduleNameKey="navigation.donators"
            titleKey="navigation.exports"
            descriptionKey="modulePlaceholder.donatorExports"
          />
        ),
      },
      {
        path: "visitas",
        element: <VisitsPage />,
      },
      {
        path: "visitas/hoje",
        element: <VisitsPage mode="today" />,
      },
      {
        path: "visitas/historico",
        element: <VisitsPage mode="history" />,
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
