export default {
  handler({ params = {}, query = {} }) {
    return {
      server: true,
      msg: 'This is an EXAMPLE page ',
    }
  },
}
