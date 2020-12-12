import { defineEdgeProps } from 'vitedge/define'

export default defineEdgeProps({
  handler({ params = {}, query = {} }) {
    return {
      data: {
        server: true,
        msg: 'This is an EXAMPLE page ',
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
