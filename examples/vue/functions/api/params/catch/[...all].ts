import { ApiEndpoint } from 'vitedge'

export default <ApiEndpoint>{
  async handler({ params }) {
    return {
      data: {
        catchAll: true,
        ...params,
      },
    }
  },
}
