import React from 'react'
import { usePageProps } from 'vitedge/react'

function Child() {
  const pageProps = usePageProps()

  return (
    <>
      Child component has access to usePageProps:
      <br />
      {JSON.stringify(pageProps || {})}
    </>
  )
}

export default function About(props) {
  return (
    <>
      <h1>About</h1>
      <p>{JSON.stringify(props, null, 2)}</p>
      <br />
      <Child />
    </>
  )
}
