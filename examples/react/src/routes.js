import { lazy } from 'react'
import Home from './pages/Home'
import About from './pages/About'
import Post from './pages/post'

export default [
  {
    path: '/',
    name: 'home',
    exact: true,
    component: Home,
  },
  {
    path: '/about',
    name: 'about',
    component: About,
  },
  {
    path: '/post/:postId',
    name: 'post',
    component: Post,
    meta: {
      propsGetter: 'post',
    },
  },
]
