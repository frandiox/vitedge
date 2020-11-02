export default function getStateProps({ request }) {
  return {
    server: true,
    msg: 'This is page ' + (request.query.name || '').toUpperCase(),
  }
}
