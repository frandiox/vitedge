export default function getPageProps({ params = {}, query = {} }) {
  return {
    server: true,
    msg: 'This is an EXAMPLE page ',
  }
}
