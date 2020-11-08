export default function getPageProps({ params = {}, query = {}, name = '' }) {
  return {
    server: true,
    msg: 'This is page ' + name.toUpperCase(),
  }
}
