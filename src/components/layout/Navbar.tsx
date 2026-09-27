"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Settings, LogOut, Clapperboard, X, Upload, LayoutDashboard, UserRound } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

export function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/?query=${encodeURIComponent(searchValue.trim())}`)
    } else {
      router.push('/')
    }
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-[#0a0a0f]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-xl shadow-black/30'
          : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 opacity-0 group-hover:opacity-60 blur-lg transition-all duration-500 scale-150" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <Clapperboard className="h-5 w-5 text-white" strokeWidth={1.75} />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            <span className="gradient-text">Vid</span>
            <span className="text-white/90">Verse</span>
          </span>
        </Link>

        {/* Search Bar */}
        <motion.div
          className="flex-1 max-w-xl"
          animate={{ scale: isSearchFocused ? 1.01 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <form onSubmit={handleSearchSubmit} className={`relative transition-all duration-300 ${isSearchFocused
              ? 'ring-1 ring-violet-500/60 rounded-full shadow-lg shadow-violet-500/10'
              : ''
            }`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${isSearchFocused ? 'text-violet-400' : 'text-white/30'
              }`} />
            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search videos, channels..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-11 pr-10 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-full
                         text-sm text-white placeholder:text-white/30
                         focus:outline-none focus:bg-white/[0.09]
                         transition-all duration-200"
            />
            <AnimatePresence>
              {searchValue && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => setSearchValue('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-white/50" />
                </motion.button>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {user ? (
            <>
              {/* Create: upload a video in the studio (notifications return with roadmap phase 4 step 7) */}
              <Link
                href="/studio/upload"
                className="hidden h-9 items-center gap-2 rounded-full border border-line-default px-4 text-sm font-medium text-fg transition-colors hover:border-line-strong sm:inline-flex"
              >
                <Upload className="h-4 w-4" aria-hidden />
                Create
              </Link>
              <Link href="/studio/upload" aria-label="Upload a video" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg transition-colors hover:bg-elevated sm:hidden">
                <Upload className="h-4 w-4" aria-hidden />
              </Link>
              {/* Avatar Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-full"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 opacity-0 hover:opacity-80 blur-md transition-all duration-300 scale-125" />
                    <Avatar className="h-9 w-9 ring-2 ring-white/[0.12] ring-offset-2 ring-offset-[#0a0a0f] relative">
                      <AvatarImage src={user?.avatarUrl} alt={user?.userName} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-semibold text-sm">
                        {user?.userName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-[#111118]/95 backdrop-blur-xl border-white/[0.08] shadow-2xl shadow-black/50 p-1.5 rounded-2xl"
                  sideOffset={8}
                >
                  {/* User info header */}
                  <div className="flex items-center gap-3 px-3 py-3 mb-1">
                    <Avatar className="h-10 w-10 ring-1 ring-violet-500/40">
                      <AvatarImage src={user?.avatarUrl} alt={user?.userName} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-semibold">
                        {user?.userName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{user?.fullName}</p>
                      <p className="text-xs text-white/40 truncate">@{user?.userName}</p>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-white/[0.06] -mx-1.5 mb-1" />

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/channel/${user?.userName}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150 text-sm focus:bg-white/[0.06] focus:text-white"
                    >
                      <UserRound className="h-4 w-4 text-white/40" />
                      Your channel
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/studio"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150 text-sm focus:bg-white/[0.06] focus:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4 text-white/40" />
                      Studio
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150 text-sm focus:bg-white/[0.06] focus:text-white"
                    >
                      <Settings className="h-4 w-4 text-white/40" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-150 text-sm focus:bg-red-500/[0.08] focus:text-red-400 mt-0.5"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="h-9 px-4 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.08] rounded-full transition-all duration-200"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="h-9 px-5 text-sm font-semibold rounded-full btn-gradient text-white hover:text-white border-0 shadow-lg shadow-violet-500/25"
                  >
                    <span>Sign Up</span>
                  </Button>
                </motion.div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}