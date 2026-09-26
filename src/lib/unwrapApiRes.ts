import { ApiSuccess, ApiError } from './types/apiType'

export function unwrapApiResponse<T>(
  json: ApiSuccess<T> | ApiError | unknown
): T {
  if (!json || typeof json !== 'object' || !('success' in json)) {
    const error = new Error('Invalid API response') as Error & { statusCode?: number }
    throw error
  }

  const resp = json as ApiSuccess<T> | ApiError

  if (!resp.success) {
    const message = (resp as ApiError).message || 'Unknown API error'
    const error = new Error(message) as Error & { statusCode?: number }
    if ((resp as ApiError).statusCode) error.statusCode = (resp as ApiError).statusCode
    throw error
  }

  return (resp as ApiSuccess<T>).data
}
