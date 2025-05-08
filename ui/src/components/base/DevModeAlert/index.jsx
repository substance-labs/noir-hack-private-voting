import { AlertTriangle, X } from "lucide-react"
import { motion } from "framer-motion"

import { useAppStore } from "../../../store"
import { useState } from "react"

const DevModeAlert = () => {
  const { devMode } = useAppStore()
  const [visible, setVisible] = useState(true)

  if (devMode || !visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 p-4 flex items-start justify-between text-sm relative rounded-2xl"
    >
      <div className="flex space-x-3 pr-6">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Heads up</p>
          <p>
            If you are using the <strong>zkPassport</strong> app in <strong>dev mode</strong>, remember to enable it
            also within <strong>Settings</strong>.
          </p>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-yellow-300 hover:text-yellow-200 transition"
        aria-label="Close alert"
      >
        <X className="w-5 h-5 mr-2" />
      </button>
    </motion.div>
  )
}

export default DevModeAlert
