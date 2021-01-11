import { ApiEndpoint } from 'vitedge'

export default <ApiEndpoint>{
  async handler({ query, request, headers }) {
    if (request.method !== 'POST') {
      throw new Error('Method not supported!')
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error(error)
      body = {}
    }

    return {
      // Actual data returned to frontend
      data: {
        msg: 'Hello moto!',
        ...body,
      },
    }
  },
}
