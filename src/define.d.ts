import { ApiEndpoint, EdgeProps } from '.'
export { ApiEndpoint, EdgeProps } from '.'

declare module 'vitedge/define' {
  export const defineApiEndpoint: (apiEndpoint: ApiEndpoint) => ApiEndpoint
  export const defineEdgeProps: (edgeProps: EdgeProps) => EdgeProps
}

declare module 'vitedge/define.js' {
  export const defineApiEndpoint: (apiEndpoint: ApiEndpoint) => ApiEndpoint
  export const defineEdgeProps: (edgeProps: EdgeProps) => EdgeProps
}
