import type { UserConfig, BuildOptions, ESBuildOptions } from 'vite'

interface VitedgeOptions {
  functions?: {
    build?: {
      rollupOptions?: BuildOptions['rollupOptions']
      commonjsOptions?: BuildOptions['commonjsOptions']
      esbuild?: ESBuildOptions
      resolve?: UserConfig['resolve']
    }
  }
}

declare module 'vitedge/plugin' {
  import { Plugin } from 'vite'

  const plugin: (options?: VitedgeOptions) => Plugin
  export default plugin
}

declare module 'vitedge/plugin.js' {
  import { Plugin } from 'vite'

  const plugin: (options?: VitedgeOptions) => Plugin
  export default plugin
}
