import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import GeneralViewPage from "@/pages/Default/GeneralView/GeneralViewPage";
import DonationsPage from "../pages/Default/Donations/DonationsPage";
import ProtectedRoute from "./ProtectedRoute";

import {
  ALLOWED_DASHBOARD_ROLES,
  ALLOWED_SUPERADMIN_ROLES,
} from "../constants/roles";

import LoginPage from "../pages/Common/Login/Login";
import AppConfiguration from "@/pages/SuperAdmin/AppConfiguration/AppConfiguration";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";

export const router = createBrowserRouter([
  //DEFAULT ROUTES
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute
            allowedRoles={ALLOWED_DASHBOARD_ROLES}
          >
            <GeneralViewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "donations",
        element: (
          <ProtectedRoute
            allowedRoles={ALLOWED_DASHBOARD_ROLES}
          >
            <DonationsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  //SUPER ADMIN ROUTES
  {
    path: "/",
    element: (
      <ProtectedRoute
        allowedRoles={ALLOWED_SUPERADMIN_ROLES}
      >
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
]);