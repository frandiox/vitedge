declare module 'vitedge/plugin.cjs' {
  import { UserConfig } from 'vite'

  const plugin: {
    alias: UserConfig['alias']
    configureServer: UserConfig['configureServer']
  }
  export default plugin
}
