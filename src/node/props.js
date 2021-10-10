import { safeHandler } from '../errors.js'
import { findRouteValue } from '../utils/api-routes.js'

export async function getPageProps({ functions, router, url }, event) {
  const { propsGetter, ...extra } = router.resolve(url) || {}
  const resolvedFn = findRouteValue(propsGetter, functions, {
    onlyStatic: true,
  })

  if (resolvedFn) {
    const { data, ...dynamicOptions } = await safeHandler(() =>
      resolvedFn.value.handler({
        ...event,
        ...extra,
        url,
      })
    )

    return { data, options: { ...resolvedFn.value.options, ...dynamicOptions } }
  } else {
    return {}
  }
}
