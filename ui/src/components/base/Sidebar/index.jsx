import { Home, Settings, Terminal } from "lucide-react"
import { X } from "lucide-react"
import { useLocation, useNavigate } from "react-router"

import { version } from "../../../../package.json"
import { useAppStore } from "../../../store"

const Sidebar = () => {
  const { devMode, sidebarOpen, closeSidebar } = useAppStore()

  const mobileSidebarClass = sidebarOpen ? "translate-x-0" : "-translate-x-full"

  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => closeSidebar()}
      />

      <aside
        className={`fixed z-50 md:static top-0 left-0 w-64 min-h-screen bg-[#0B0F19] border-r border-white/10 backdrop-blur-md p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${mobileSidebarClass} md:translate-x-0`}
      >
        <div className="flex items-center justify-between md:hidden mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🛡️</div>
            <div className="text-xl font-semibold text-white tracking-tight">Revelio</div>
          </div>
          <button onClick={() => closeSidebar()} className="text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-2xl">🛡️</div>
            <div className="text-xl font-semibold text-white tracking-tight">Revelio</div>
          </div>

          <nav className="flex flex-col space-y-2 mt-6">
            <button
              className={`flex items-center space-x-3 ${
                pathname === "/" ? "text-white" : "text-gray-400"
              } hover:text-white hover:bg-white/5 px-3 py-2 rounded-md transition-colors duration-150 cursor-pointer`}
              onClick={() => {
                navigate("/")
                closeSidebar()
              }}
            >
              <Home className="w-5 h-5" />
              <span className="text-sm">Home</span>
            </button>
            <button
              className={`flex items-center space-x-3 ${
                pathname === "/settings" ? "text-white" : "text-gray-400"
              } hover:text-white hover:bg-white/5 px-3 py-2 rounded-md transition-colors duration-150 cursor-pointer`}
              onClick={() => {
                navigate("/settings")
                closeSidebar()
              }}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </button>
          </nav>
        </div>

        <div className="space-y-2 mt-10 text-xs text-gray-400">
          <div className="flex items-center space-x-2 text-sm">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className={devMode ? "text-green-400" : "text-gray-500"}>Dev Mode: {devMode ? "ON" : "OFF"}</span>
          </div>
          <div className="border-t border-white/10 my-3" />
          <p>v{version} • by @SubstanceLabs</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
