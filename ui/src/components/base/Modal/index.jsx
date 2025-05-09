import { X } from "lucide-react"

const Modal = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl flex flex-col items-center space-y-4 animate-fade-in w-full max-w-xs text-center">
        <button
          onClick={() => onClose(null)}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
