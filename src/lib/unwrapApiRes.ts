import { ApiSuccess, ApiError } from './types/apiType'

export function unwrapApiResponse<T>(
  json: ApiSuccess<T> | ApiError
): T {
  if (!json.success) {
    const error = new Error(json.message) as Error & {
      statusCode?: number
    }

    error.statusCode = json.statusCode
    throw error
  }

  return json.data
}
