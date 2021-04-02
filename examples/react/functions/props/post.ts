import { defineEdgeProps } from 'vitedge/define'

export default defineEdgeProps({
  async handler({ params = {}, query = {} }) {
    return {
      data: {
        server: true,
        params,
      },
    }
  },
  options: {
    cache: {
      api: 90,
      html: 90,
    },
  },
})
