export default {
  handler({ params = {}, query = {}, name = '' }) {
    return {
      data: {
        server: true,
        msg: 'This is page ' + name.toUpperCase(),
      },
    }
  },
  options: {
    cache: {
      api: 90,
      html: 90,
    },
  },
}
