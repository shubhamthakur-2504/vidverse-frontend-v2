"use client"

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, Search, Upload, User, Settings, LogOut, Bell, History, PlaySquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function Navbar() {
  const { user, logout } = useAuth()
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 backdrop-blur-lg"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-lg blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
            <Play className="h-8 w-8 text-white relative z-10 fill-white" />
          </motion.div>
          <span className="text-xl font-bold gradient-text hidden sm:block">
            VidVerse
          </span>
        </Link>

        {/* Search Bar */}
        <motion.div
          className="flex-1 max-w-2xl"
          animate={{
            scale: isSearchFocused ? 1.02 : 1
          }}
        >
          <div className={`relative group ${isSearchFocused ? 'glass' : ''} rounded-full transition-all`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search videos..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full 
                       focus:outline-none focus:border-blue-500/50 focus:bg-white/10
                       transition-all duration-300 placeholder:text-muted-foreground"
            />
          </div>
        </motion.div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Upload Button */}
              <Link href="/upload">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity blur" />
                  <Upload className="h-5 w-5 relative z-10" />
                </Button>
              </Link>

              {/* Notifications */}
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-background">
                      <AvatarImage src={user?.avatarUrl} alt={user?.userName} />
                      <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500">
                        {user?.userName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/10">
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatarUrl} alt={user?.userName} />
                      <AvatarFallback>{user?.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{user?.userName}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user?.userName}`} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Your Channel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Watch History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/playlists" className="flex items-center gap-2">
                      <PlaySquare className="h-4 w-4" />
                      Your Playlists
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-red-400 focus:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="glass-hover">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}