import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import environmentPlugin from "vite-plugin-environment"
import { nodePolyfills } from "vite-plugin-node-polyfills"

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  define: {
    "process.browser": "true",
    "process.version": '"v16.0.0"',
  },
  plugins: [react(), tailwindcss(), environmentPlugin(["NODE_DEBUG"]), nodePolyfills()],
})
