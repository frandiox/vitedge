<template>
  <h1>Page B - Message from server: {{ msg }}</h1>

  Descendants can access server data with usePageProps hook:
  <ChildComponent />
</template>

<script>
import { h, defineComponent } from 'vue'
import { usePageProps } from 'vitedge'

const ChildComponent = defineComponent({
  setup() {
    const pageProps = usePageProps()
    return () => h('div', JSON.stringify(pageProps))
  },
})

export default defineComponent({
  name: 'PageB',
  components: { ChildComponent },
  props: {
    msg: String,
  },
})
</script>
