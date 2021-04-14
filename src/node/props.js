import { safeHandler } from '../errors.js'

export async function getPageProps({ functions, router, url }, event) {
  const { propsGetter, ...extra } = router.resolve(url.pathname) || {}
  const fnMeta = functions[propsGetter]

  if (fnMeta) {
    const { data, ...options } = await safeHandler(() =>
      fnMeta.handler({
        ...event,
        ...extra,
        url,
      })
    )

    return { data, options }
  } else {
    return {}
  }
}
