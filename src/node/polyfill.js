import nodeFetch from 'node-fetch'

globalThis.fetch = globalThis.fetch || nodeFetch
globalThis.Request = globalThis.Request || nodeFetch.Request
globalThis.Response = globalThis.Response || nodeFetch.Response
