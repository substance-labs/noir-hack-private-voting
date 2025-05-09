import { useCallback, useEffect, useState } from "react"

import Sidebar from "../../base/Sidebar"
import Header from "../../base/Header"
import { useAppStore } from "../../../store"

const Settings = () => {
  const { devMode, setDevMode } = useAppStore()

  const toggleDevMode = useCallback(() => {
    const newValue = !devMode
    setDevMode(newValue)
  }, [devMode, setDevMode])

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto space-y-4">
        <Header title={"Home"} />

        <div className="px-4 w-full">
          <div className="flex items-center justify-between border border-white/10 p-4 rounded-md bg-white/5 ">
            <span className="text-sm font-medium">zkPassport Developer Mode</span>
            <button
              onClick={toggleDevMode}
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${devMode ? "bg-green-500" : "bg-gray-600"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  devMode ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings
