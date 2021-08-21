import type { Plugin, RollupOptions } from 'rollup'
import type { RollupJsonOptions } from '@rollup/plugin-json'
import type { RollupCommonJSOptions } from '@rollup/plugin-commonjs'
import type { Options as ESbuildPluginOptions } from 'rollup-plugin-esbuild'
import type { BuildOptions as ESBuildOptions } from 'esbuild'
import type { UserConfig } from 'vite'

interface VitedgeOptions {
  functions?: Pick<UserConfig, 'resolve' | 'define'> & {
    json?: RollupJsonOptions
    esbuild?: ESbuildPluginOptions
    plugins?: Plugin[]
    build?: {
      rollupOptions?: Omit<RollupOptions, 'input' | 'watch'>
      commonjsOptions?: RollupCommonJSOptions
      target: ESBuildOptions['target']
      minify: boolean
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
