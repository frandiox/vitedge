<template>
  <Helmet
    :html-attrs="{ lang: 'en' }"
    :meta="[{ name: 'description', content: 'this should be moved to head' }]"
  />

  <h1>This is the homepage. Server's getProps works: {{ server }}</h1>
  <p>Message from server: {{ msg }}</p>

  <p><strong>API:</strong></p>
  <div style="display: flex; justify-content: center">
    <button @click="api('GET:hello/world')" style="margin: 0 6px">
      GET:hello/world
    </button>
    <button
      @click="api('POST:hello/moto', { boomerang: true })"
      style="margin: 0 6px"
    >
      POST:hello/moto
    </button>
  </div>
  <p>{{ apiResult }}</p>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Homepage',
  props: {
    server: {
      type: Boolean,
      default: false,
    },
    msg: {
      type: String,
      default: '',
    },
  },
  setup() {
    const apiResult = ref(null)

    return {
      apiResult,
      async api(resource, json) {
        const [method, endpoint] = resource.split(':')

        try {
          const res = await fetch('/api/' + endpoint, {
            method,
            headers: { 'content-type': 'application/json' },
            body: json && JSON.stringify(json),
          })

          apiResult.value = await res.json()
        } catch (error) {
          apiResult.value = error.message
        }
      },
    }
  },
}
</script>
