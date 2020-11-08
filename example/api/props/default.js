export default {
  handler({ params = {}, query = {}, name = '' }) {
    return {
      server: true,
      msg: 'This is page ' + name.toUpperCase(),
    }
  },
}
