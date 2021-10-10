import { html } from '../utils'

export default function (context) {
  return {
    headTags: '<title>About</title>',
    body: html`
      <h1>About page</h1>
      <p>Something cool here</p>
      <div>This is the initial state from the server:</div>
      <code>${JSON.stringify(context.initialState)}</code>
    `,
  }
}
