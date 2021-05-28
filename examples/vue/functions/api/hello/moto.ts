import { ApiEndpoint } from 'vitedge'
import { MethodNotAllowedError } from 'vitedge/errors'

export default <ApiEndpoint>{
  async handler({ query, request, headers }) {
    if (request.method !== 'POST') {
      throw new MethodNotAllowedError('Method not supported!')
    }

    const body = await request.json()

    return {
      // Actual data returned to frontend
      data: {
        msg: 'Hello moto!',
        ...body,
      },
    }
  },
}
