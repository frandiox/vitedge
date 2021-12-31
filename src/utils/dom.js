// True when the current browser page has been rendered in server beforehand
export const IS_SSR_PAGE = Boolean(
  typeof document !== 'undefined' &&
    // @ts-ignore
    ((document.getElementById(__CONTAINER_ID__) || {}).dataset || {})
      .serverRendered
)
