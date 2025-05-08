import { Bell } from "lucide-react"
import { Menu } from "lucide-react"
import { useAppStore } from "../../../store"

const Header = ({ title }) => {
  const { openSidebar } = useAppStore()

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm z-50 ">
      <button className="md:hidden text-white p-2" onClick={() => openSidebar()}>
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex items-center space-x-2">
        <h1 className="text-white text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center space-x-6">
        <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

export default Header
