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

export class MethoNotAllowedError extends RestError {
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
