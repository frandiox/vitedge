export default {
  handler({ query, body, request }) {
    if (request.method !== 'GET') {
      throw new Error('Method not supported!')
    }

    return {
      data: {
        msg: 'Hello world!',
      },
    }
  },
  options: {
    cache: {
      api: 85,
    },
  },
}
