import { UserConfig } from 'vite'
import vitedge from 'vitedge/plugin.js'
import react from '@vitejs/plugin-react'

export default {
  plugins: [vitedge(), react()],
  optimizeDeps: {},
} as UserConfig
