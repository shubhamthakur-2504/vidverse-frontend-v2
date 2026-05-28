export type ApiSuccess<T> = {
  success: true
  statusCode: number
  message: string
  data: T
}

export type ApiError = {
  success: false
  statusCode: number
  message: string
  errors?: unknown[]
}

