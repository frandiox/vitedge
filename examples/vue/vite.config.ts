import { UserConfig } from 'vite'
import vitedge from 'vitedge/plugin.js'
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [vitedge(), vue()],
} as UserConfig
