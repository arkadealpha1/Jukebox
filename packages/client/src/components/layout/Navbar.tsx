'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Menu, X, LogOut, User } from 'lucide-react';
import {
  Button,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, isGuest, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    router.push('/');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Music className="h-6 w-6 text-purple-400" />
          <span className="text-lg font-bold text-white">Jukebox</span>
        </Link>

        <div className="hidden items-center gap-3 sm:flex">
          {isAuthenticated || isGuest ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-600 text-xs text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-300">
                    {user?.username ?? 'Guest'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-white/10 bg-gray-900/95 backdrop-blur-xl"
              >
                <DropdownMenuItem className="cursor-pointer gap-2 text-gray-300 focus:bg-white/5 focus:text-white">
                  <User size={14} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-400 focus:bg-white/5 focus:text-red-300"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-purple-600 text-white hover:bg-purple-500">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-300 hover:text-white sm:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 sm:hidden"
          >
            <div className="space-y-2 bg-black/60 px-4 pb-4 pt-2 backdrop-blur-2xl">
              {isAuthenticated || isGuest ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-600 text-xs text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white">
                      {user?.username ?? 'Guest'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full bg-purple-600 text-white hover:bg-purple-500">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
