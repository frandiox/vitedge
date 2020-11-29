declare module 'vitedge/plugin.cjs' {
  const plugin: {
    alias: Record<string, string>
    configureServer: Function[]
  }
  export default plugin
}
