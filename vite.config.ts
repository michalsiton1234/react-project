import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path" // זה חשוב כדי לזהות נתיבים

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // כאן אנחנו מגדירים ש-@ תמיד יצביע על תיקיית src
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: true
  }
})