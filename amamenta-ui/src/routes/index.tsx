import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import HomePage from "../pages/HomePage/HomePage";
import AboutPage from "../pages/AboutPage/AboutPage";
import ProtectedRoute from "./ProtectedRoute";

import {
  ALLOWED_DASHBOARD_ROLES,
  ALLOWED_SUPERADMIN_ROLES,
} from "../constants/roles";

import LoginPage from "../pages/Login/Login";
import AppConfiguration from "@/pages/AppConfiguration/AppConfiguration";
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
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "about",
        element: (
          <ProtectedRoute
            allowedRoles={ALLOWED_DASHBOARD_ROLES}
          >
            <AboutPage />
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