declare module 'vitedge/plugin.cjs' {
  import { Plugin } from 'vite'

  const plugin: () => Plugin
  export default plugin
}
