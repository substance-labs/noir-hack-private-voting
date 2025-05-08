import { createContext, useContext, useState } from "react"

const AppContext = createContext()

export const SidebarProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)
  const closeSidebar = () => setSidebarOpen(false)
  const openSidebar = () => setSidebarOpen(true)

  return (
    <AppContext.Provider
      value={{
        closeSidebar,
        sidebarOpen,
        openSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error("useSidebar must be used within SidebarProvider")
  return context
}
