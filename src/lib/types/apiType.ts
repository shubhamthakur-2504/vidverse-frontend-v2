export type ApiSuccess<T> = {
  success: true
  statusCode: number
  message: string
  data: T
}

// one page of a cursor-paginated list; pass nextCursor back as ?cursor= (null on the last page)
export type Page<T> = {
  items: T[]
  nextCursor: string | null
}

export type ApiError = {
  success: false
  statusCode: number
  message: string
  errors?: unknown[]
}

