// search results filters (GET /v2/videos): kept in the /results URL so reload, back and sharing keep them

export const SORTS = [
  { id: 'newest', label: 'Upload date' },
  { id: 'views', label: 'View count' },
] as const

export const UPLOAD_DATES = [
  { id: 'hour', label: 'Last hour' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
] as const

export const DURATIONS = [
  { id: 'short', label: 'Under 4 minutes' },
  { id: 'medium', label: '4–20 minutes' },
  { id: 'long', label: 'Over 20 minutes' },
] as const

type Id<T extends readonly { id: string }[]> = T[number]['id']

export type SearchFilters = {
  q: string
  sort?: Exclude<Id<typeof SORTS>, 'newest'>
  uploaded?: Id<typeof UPLOAD_DATES>
  duration?: Id<typeof DURATIONS>
}

// the API caps the search text at 100 characters
export const MAX_QUERY_LENGTH = 100

const pick = <T extends readonly { id: string }[]>(options: T, value: string | string[] | undefined) =>
  options.find((option) => option.id === value)?.id as Id<T> | undefined

// unknown or repeated values are dropped, so a hand-edited URL never turns into an API error
export const parseSearchFilters = (params: Record<string, string | string[] | undefined>): SearchFilters => {
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, MAX_QUERY_LENGTH) : ''
  const sort = pick(SORTS, params.sort)
  const uploaded = pick(UPLOAD_DATES, params.uploaded)
  const duration = pick(DURATIONS, params.duration)
  // newest is the API default, so it stays out of the URL
  return { q, ...(sort && sort !== 'newest' && { sort }), ...(uploaded && { uploaded }), ...(duration && { duration }) }
}

// the API query for these filters (the search text is `query` there)
export const searchApiParams = ({ q, ...filters }: SearchFilters) => ({ query: q, ...filters })

export const resultsHref = ({ q, sort, uploaded, duration }: SearchFilters) => {
  const params = new URLSearchParams({ q })
  if (sort) params.set('sort', sort)
  if (uploaded) params.set('uploaded', uploaded)
  if (duration) params.set('duration', duration)
  return `/results?${params.toString()}`
}
