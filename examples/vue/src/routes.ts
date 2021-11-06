export default [
  {
    path: '/',
    component: () => import('./pages/Homepage.vue'),
    name: 'home',
    meta: {
      propsGetter: 'default',
    },
  },
  {
    path: '/a',
    component: () => import('./pages/PageA.vue'),
    name: 'a',
    meta: {
      propsGetter: 'default',
    },
  },
  {
    path: '/b',
    component: () => import('./pages/PageB.vue'),
    name: 'b',
    meta: {
      propsGetter: 'example',
    },
  },
  {
    path: '/c',
    component: () => import('./pages/PageC.vue'),
    name: 'c',
  },
  {
    path: '/example/:resource',
    component: () => import('./pages/PageB.vue'),
    name: 'example',
  },
  {
    path: '/:catchAll(.*)',
    name: 'not-found',
    component: () => import('./pages/404.vue'),
    meta: {
      propsGetter: false,
    },
  },
]
