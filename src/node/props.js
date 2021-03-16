export async function getPageProps({ functions, router, url }, event) {
  const { propsGetter, ...extra } = router.resolve(url.pathname) || {}
  const fnMeta = functions[propsGetter]

  if (fnMeta) {
    const { data } = await fnMeta.handler({
      ...event,
      ...extra,
      url,
    })

    return data
  } else {
    return {}
  }
}
