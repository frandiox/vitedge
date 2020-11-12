export default {
  handler({ params = {}, query = {}, name = '' }) {
    return {
      server: true,
      msg: 'This is page ' + name.toUpperCase(),
    }
  },
  options: {
    cache: {
      api: 90,
      html: 90,
    },
  },
}
