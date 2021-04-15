const isDev = process.env.NODE_ENV === 'development'

let transformError = (error) => ({
  error: {
    status: error.status || 500,
    message: error.message,
    title: error.name,
    details: error.details,
    stack: isDev ? error.stack : undefined,
  },
})

export function setErrorTransformer(fn) {
  // TODO rethink this so it doesn't need
  // to be repeated in front and back ends.
  // E.g. Expose it from entry-server.
  transformError = fn
}

export async function safeHandler(fn) {
  try {
    const result = await fn()
    if (!result.status) {
      result.status = 200
    }

    return result
  } catch (error) {
    const data = transformError(error)
    return { data, status: error.status || 500 }
  }
}

export class RestError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.details = details
  }

  toJSON() {
    return JSON.stringify(transformError(this))
  }
}

export class BadRequestError extends RestError {
  constructor(message, details) {
    super(message, 400, details)
  }
}

export class UnauthorizedError extends RestError {
  constructor(message, details) {
    super(message, 401, details)
  }
}

export class ForbiddenError extends RestError {
  constructor(message, details) {
    super(message, 403, details)
  }
}

export class NotFoundError extends RestError {
  constructor(message, details) {
    super(message, 404, details)
  }
}

export class MethodNotAllowedError extends RestError {
  constructor(message, details) {
    super(message, 405, details)
  }
}

export class UnknownError extends RestError {
  constructor(message, details) {
    super(message, 500, details)
  }
}

export class ExternalServiceError extends RestError {
  constructor(message, details) {
    super(message, 503, details)
  }
}
