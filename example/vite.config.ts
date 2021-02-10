import { UserConfig } from 'vite'
import vitedge from 'vitedge/plugin.cjs'
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [vitedge(), vue()],
} as UserConfig
