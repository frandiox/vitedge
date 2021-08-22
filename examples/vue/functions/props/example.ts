import { defineEdgeProps } from 'vitedge/define'

export default defineEdgeProps({
  handler({ params = {}, query = {} }) {
    console.log('KV instance:', globalThis.TEST_NAMESPACE1)

    return {
      data: {
        server: true,
        msg: `This is an EXAMPLE page ${params.resource || ''}`,
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
