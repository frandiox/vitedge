# Cache

Caching at the edge is only available when running in Cloudflare workers and Vercel (Netlify's edge is still in closed beta).

In Vitedge, rendering a page consists of 2 steps:

1. Get page props. This is a function that can make subrequests or any type of computation.
2. Build the output HTML using the page props from the previous step.

Both steps can be cached separately depending on your needs. For example, if the output HTML depends on props and current time, it is possible to cache the props but always render the HTML since the current time will be different for each request.

A normal `cache` configuration (in page props or API) looks like this:

```
cache: {
  api: <number>
  html: <number>
}
```

Where the `api` bit specifies the cache's max-age for the "get page props" call and the `html` for the output HTML rendering. Most common scenarios will only need caching `html`.

Note that, when running on Cloudflare workers, the minimum max-age allowed is 60 seconds.
