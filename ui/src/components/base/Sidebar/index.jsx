import { Home, Settings } from "lucide-react"
import { X } from "lucide-react"
import { useLocation, useNavigate } from "react-router"

import { version } from "../../../../package.json"
import { useSidebar } from "../../contexts/SidebarContext"

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar()
  const mobileSidebarClass = isSidebarOpen ? "translate-x-0" : "-translate-x-full"

  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => closeSidebar()}
      />

      <aside
        className={`fixed z-50 md:static top-0 left-0 w-64 min-h-screen bg-[#0B0F19] border-r border-white/10 backdrop-blur-md p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${mobileSidebarClass} md:translate-x-0`}
      >
        {/* Mobile close button */}
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
          {/* Desktop logo */}
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

        <div className="text-xs text-gray-600 mt-10">
          <p>v{version} • by @SubstanceLabs</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
