<template>
  <h1>This is the homepage. Server's getProps works: {{ server }}</h1>
  <p>Message from server: {{ msg }}</p>

  <p><strong>API:</strong></p>
  <div style="display: flex; justify-content: center">
    <button @click="callApi('GET:hello/world')" style="margin: 0 6px">
      GET:hello/world
    </button>
    <button
      @click="callApi('POST:hello/moto', { boomerang: true })"
      style="margin: 0 6px"
    >
      POST:hello/moto
    </button>
  </div>
  <p>{{ apiResult }}</p>
</template>

<script>
import { ref } from 'vue'
import { useHead } from '@vueuse/head'

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
  async setup() {
    useHead({
      html: { lang: 'en' },
      meta: [{ name: 'description', content: 'this should be moved to head' }],
    })

    const apiResult = ref(null)

    const callApi = async function (resource, json) {
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
    }

    // This will be awaited in both browser and server with Suspense
    await callApi('GET:hello/world')

    return {
      apiResult,
      callApi,
    }
  },
}
</script>
