export default {
  handler({ params = {}, query = {} }) {
    return {
      server: true,
      msg: 'This is an EXAMPLE page ',
    }
  },
  options: {
    cache: {
      props: 30,
      html: 30,
    },
  },
}
