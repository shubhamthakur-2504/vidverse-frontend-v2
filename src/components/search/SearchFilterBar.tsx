"use client"

import Link from 'next/link'
import { Check, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DURATIONS, SORTS, UPLOAD_DATES, resultsHref, type SearchFilters } from '@/lib/search'

type Option = { id: string; label: string }

const chip = 'inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-medium transition-colors'
const chipIdle = 'bg-elevated text-fg hover:bg-line-strong'
const chipActive = 'bg-fg text-bg hover:opacity-90'

// one filter as a chip that opens a menu of links, so every choice is a URL (reload, back and share keep it)
function FilterMenu({ name, options, value, anyLabel, hrefFor }: {
  name: string
  options: readonly Option[]
  value: string | undefined
  anyLabel?: string
  hrefFor: (id: string | undefined) => string
}) {
  const selected = options.find((option) => option.id === value)
  const items: { id: string | undefined; label: string }[] = anyLabel ? [{ id: undefined, label: anyLabel }, ...options] : [...options]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={`${chip} ${selected && anyLabel ? chipActive : chipIdle}`}>
        {selected && anyLabel ? selected.label : selected ? `${name}: ${selected.label}` : name}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44 border-line-default bg-elevated p-1">
        {items.map(({ id, label }) => {
          const isSelected = id === value || (!id && !value)
          return (
            <DropdownMenuItem key={id ?? 'any'} asChild>
              <Link href={hrefFor(id)} aria-current={isSelected ? 'true' : undefined} className="h-9 cursor-pointer rounded-md px-2 text-sm text-fg">
                <Check className={`h-4 w-4 ${isSelected ? 'text-brand-fg' : 'invisible'}`} aria-hidden />
                {label}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SearchFilterBar({ filters }: { filters: SearchFilters }) {
  const hrefWith = (change: Partial<SearchFilters>) => resultsHref({ ...filters, ...change })
  const hasFilters = Boolean(filters.sort || filters.uploaded || filters.duration)

  return (
    <div role="group" aria-label="Search filters" className="flex flex-wrap items-center gap-2">
      <FilterMenu
        name="Upload date"
        anyLabel="Any time"
        options={UPLOAD_DATES}
        value={filters.uploaded}
        hrefFor={(id) => hrefWith({ uploaded: id as SearchFilters['uploaded'] })}
      />
      <FilterMenu
        name="Duration"
        anyLabel="Any length"
        options={DURATIONS}
        value={filters.duration}
        hrefFor={(id) => hrefWith({ duration: id as SearchFilters['duration'] })}
      />
      <FilterMenu
        name="Sort by"
        options={SORTS}
        value={filters.sort ?? 'newest'}
        hrefFor={(id) => hrefWith({ sort: id === 'views' ? 'views' : undefined })}
      />
      {hasFilters && (
        <Link href={resultsHref({ q: filters.q })} className="px-2 text-xs font-medium text-brand-fg hover:underline">
          Clear filters
        </Link>
      )}
    </div>
  )
}
