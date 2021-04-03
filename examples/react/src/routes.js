import { createElement } from 'react'

export default [
  {
    path: '/',
    name: 'home',
    exact: true,
    component: () => import('./pages/Home'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./pages/About'),
  },
  {
    path: '/post/:postId',
    name: 'post',
    component: () => import('./pages/post'),
    meta: {
      propsGetter: 'post',
    },
  },
].map(({ component: fn, ...route }) => {
  let component = null
  return {
    ...route,
    component: (props) => {
      if (!component) {
        const loadingComponent = fn().then(({ default: page }) => {
          component = page
        })
        // Suspense will re-render when component is ready
        throw loadingComponent
      }

      return createElement(component, props)
    },
  }
})
