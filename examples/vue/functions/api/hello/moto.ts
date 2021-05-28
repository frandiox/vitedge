import { ApiEndpoint } from 'vitedge'
import { MethodNotAllowedError } from 'vitedge/errors'

export default <ApiEndpoint>{
  async handler({ query, request, headers }) {
    if (request.method !== 'POST') {
      throw new MethodNotAllowedError('Method not supported!')
    }

    const body = await request.json()

    // Test returning FetchResponse
    return new Response(JSON.stringify({ ...body, msg: 'Hello moto!' }), {
      headers: { 'content-type': 'application/json' },
    })

    // -- This is the equivalent:
    // return {
    //   // Actual data returned to frontend
    //   data: {
    //     ...body,
    //     msg: 'Hello moto!',
    //   },
    // }
  },
}
