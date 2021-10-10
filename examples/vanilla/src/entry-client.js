import './index.css'
import vitedge from 'vitedge/core/entry-client'

export default vitedge((context) => {
  const { initialState } = context
  console.log('Serialized state from server:', initialState)

  // Hydrate page if necessary
  const clockNode = document.querySelector('#clock')
  if (clockNode) {
    const { clock = {} } = initialState

    setInterval(() => {
      clockNode.innerHTML = new Date().toLocaleTimeString(
        clock.locale,
        clock.options
      )
    }, 200)
  }
})
