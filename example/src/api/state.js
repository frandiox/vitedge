export default function getStateProps({ params = {} }) {
  return {
    server: true,
    msg: 'This is page ' + (params.name || '').toUpperCase(),
  }
}
