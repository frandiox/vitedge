declare module 'vitedge/errors' {
  interface ExtendedErrorInstance<T> extends Error {
    status: number
    name: string
    details: T
  }

  interface ExtendedError<T = any> {
    new (message: string, details?: T): ExtendedErrorInstance<T>
  }

  export const RestError: {
    new (
      message: string,
      status: number,
      details?: any
    ): ExtendedErrorInstance<any>
  }

  export const BadRequestError: ExtendedError
  export const UnauthorizedError: ExtendedError
  export const ForbiddenError: ExtendedError
  export const NotFoundError: ExtendedError
  export const MethodNotAllowedError: ExtendedError
  export const UnknownError: ExtendedError
  export const ExternalServiceError: ExtendedError
  // export const setErrorTransformer: (
  //   fn: (error: Error | ExtendedError) => any
  // ) => void
}
