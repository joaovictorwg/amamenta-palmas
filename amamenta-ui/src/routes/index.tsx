import { createBrowserRouter } from "react-router-dom"
import RootLayout from "../layouts/RootLayout"
import HomePage from "../pages/HomePage/HomePage"
import AboutPage from "../pages/AboutPage/AboutPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        handle: {
          titleKey: "amamenta.home",
        },
      },
      {
        path: "about",
        element: <AboutPage />,
        handle: {
          titleKey: "amamenta.about",
        },
      },
    ],
  },
])