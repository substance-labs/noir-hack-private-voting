import React from "react"
import { createHashRouter, RouterProvider } from "react-router"

import Home from "./components/pages/Home"
import Settings from "./components/pages/Settings"

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
])

const App = () => <RouterProvider router={router} />

export default App
