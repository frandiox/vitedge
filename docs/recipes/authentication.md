# Authentication, JWT and Cookies

Authentication in an SSR context can be challenging, especially if you rely on [JSON Web Tokens](https://en.wikipedia.org/wiki/JSON_Web_Token) instead of cookies. The JWT can be passed in `fetch` requests without issues but, in SSR requests (i.e. when the browser makes the first page request to the backend), the browser cannot be instructed to find your JWT in local storage.

On the other hand, HTTP cookies are passed **automatically** by the browser when making an SSR request. Therefore, the simplest solution to authentication with JWT is to store it in an [HTTP-only cookie](shttps://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).

In order to do this, you need to create an endpoint in your API that is called right after your user is authenticated, receiving the new JWT (access token) in the body, querystring or headers. Then, simply set the `Set-Cookie` header in the response:

```js
import { defineApiEndpoint } from 'vitedge/define'

export default defineApiEndpoint({
  async handler({ request }) {
    // JWT is passed in the body after the user is logged in
    // (assuming you use some third party JWT provider like Auth0)
    const { jwt } = await request.json()

    // Here you can validate the JWT and extract the expiration date
    const expires = '...'

    return {
      data: {},
      headers: {
        // This should add the expiration date from the actual JWT and ensure domain security:
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
        'Set-Cookie': `my_auth_key=${jwt}; Path=/; Expires=${expires}; HttpOnly; Secure`,
      },
    }
  }
})
```

After calling this endpoint, the browser will keep a copy of the JWT in a cookie that cannot be accessed programmatically (i.e. it is resistant to some type of attacks), and it will add it to every request automatically (including `fetch` requests).

Instead of `my_auth_key`, you can call the cookie `bearer` or any other name. Just make sure to use the same cookie name to read it later in your Page Props Handlers:

```js
import { defineEdgeProps } from 'vitedge/define'
import { UnauthorizedError } from 'vitedge/errors'
// This is just a library example to parse cookies easily
import { parse } from 'worktop/cookie'

export default defineEdgeProps({
  handler({ headers }) {
    const cookies = parse(headers.get('cookie'))
    
    const jwt = cookies['my_auth_key']

    if (!jwt) {
      throw new UnauthorizedError('This route is private, are you logged in?')
    }

    // Verify that the JWT is valid and not expired.
    // Throw Unauthenticated / Forbidden errors if needed.
    // ...
    
    // Return page data using JWT info
    return { data: {} }
  },
})
```
