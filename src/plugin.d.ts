import type { UserConfig, BuildOptions } from 'vite'
import type { BuildOptions as ESBuildOptions } from 'esbuild'

type RollupOptions = Exclude<BuildOptions['rollupOptions'], undefined>

interface VitedgeOptions {
  functions?: Pick<
    UserConfig,
    'resolve' | 'plugins' | 'define' | 'json' | 'esbuild'
  > & {
    build?: Pick<
      BuildOptions,
      'commonjsOptions' | 'minify' | 'target' | 'terserOptions'
    > & {
      rollupOptions?: Omit<RollupOptions, 'input' | 'watch'>
    }
  }
  worker?: {
    build?: Omit<
      ESBuildOptions,
      | 'entryPoints'
      | 'external'
      | 'write'
      | 'watch'
      | 'outdir'
      | 'outfile'
      | 'outbase'
      | 'outExtension'
      | 'metafile'
    >
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
