'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, Disc3, Sun, Moon } from 'lucide-react';
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
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, isGuest, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    router.push('/');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-50 border-b border-jukebox-gold/35 bg-jukebox-black/88 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-jukebox-cyan/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-jukebox-gold/55 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center">
            <div className="absolute inset-0 rounded-[999px_999px_14px_14px] border border-jukebox-gold/70 bg-gradient-to-b from-jukebox-red via-jukebox-black to-jukebox-black shadow-jukebox-red" />
            <div className="absolute left-1 top-2 h-7 w-1 rounded-full jukebox-tube-cyan" />
            <div className="absolute right-1 top-2 h-7 w-1 rounded-full jukebox-tube-red" />

            <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-jukebox-gold/60 bg-jukebox-black">
              <Disc3 className="h-3.5 w-3.5 text-jukebox-gold transition-transform duration-500 group-hover:rotate-180" />
            </div>

            <div className="absolute bottom-1 h-1.5 w-6 rounded-full bg-jukebox-gold/80" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="font-logo text-xl font-bold uppercase logo-tracking text-jukebox-cream">
              <span className="jukebox-neon-gold">Juke</span>
              <span className="jukebox-neon-red">box</span>
            </span>

            <span className="font-button mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.32em] text-jukebox-cyan/80 sm:block">
              Listen Together
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-3 sm:flex">

          <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-jukebox-gold/30 bg-white/[0.04] text-jukebox-gold transition-all hover:border-jukebox-cyan/60 hover:bg-jukebox-gold/10"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated || isGuest ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-2 rounded-full border border-jukebox-gold/30 bg-white/[0.04] px-2 py-1 outline-none transition-all hover:border-jukebox-cyan/60 hover:bg-white/[0.07]">
                  <Avatar className="h-8 w-8 border border-jukebox-gold/50">
                    <AvatarFallback className="font-button bg-jukebox-red text-xs font-bold text-jukebox-cream">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <span className="font-body max-w-[140px] truncate text-base font-semibold text-jukebox-cream/85">
                    {user?.username ?? 'Guest'}
                  </span>

                  <Disc3 className="h-3.5 w-3.5 text-jukebox-cyan/70 transition-transform group-hover:rotate-45" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="jukebox-panel min-w-48 rounded-xl border-jukebox-gold/40 bg-jukebox-black/95 p-1 text-jukebox-cream backdrop-blur-xl"
              >
                <DropdownMenuItem className="font-button cursor-pointer gap-2 rounded-lg text-jukebox-cream/80 focus:bg-jukebox-gold/10 focus:text-jukebox-gold">
                  <User size={14} />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-jukebox-gold/20" />

                <DropdownMenuItem
                  className="font-button cursor-pointer gap-2 rounded-lg text-jukebox-red-bright focus:bg-jukebox-red/10 focus:text-jukebox-red-bright"
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
                <Button
                  variant="ghost"
                  className="font-button rounded-full border border-transparent text-jukebox-cream/75 hover:border-jukebox-gold/30 hover:bg-jukebox-gold/10 hover:text-jukebox-gold"
                >
                  Login
                </Button>
              </Link>

              <Link href="/signup">
                <Button className="jukebox-chrome-button font-button rounded-full px-5 font-bold uppercase button-tracking hover:bg-jukebox-gold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-full border border-jukebox-gold/30 bg-white/[0.04] p-2 text-jukebox-cream transition-colors hover:bg-jukebox-gold/10 sm:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-jukebox-gold/25 sm:hidden"
          >
            <div className="jukebox-panel mx-3 mb-3 mt-2 space-y-2 rounded-2xl p-3">
              <div className="mb-2 flex justify-end">
                <button
                  onClick={toggleTheme}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-jukebox-gold/30 bg-white/[0.04] text-jukebox-gold transition-all hover:border-jukebox-cyan/60 hover:bg-jukebox-gold/10"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>

              {isAuthenticated || isGuest ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl border border-jukebox-gold/25 bg-black/30 px-3 py-2">
                    <Avatar className="h-9 w-9 border border-jukebox-gold/50">
                      <AvatarFallback className="font-button bg-jukebox-red text-xs font-bold text-jukebox-cream">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-body truncate text-base font-semibold text-jukebox-cream">
                        {user?.username ?? 'Guest'}
                      </p>
                      <p className="font-button text-[10px] uppercase tracking-widest text-jukebox-gold/70">
                        Active Listener
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="font-button flex w-full items-center gap-2 rounded-xl border border-jukebox-red/25 px-3 py-2 text-sm text-jukebox-red-bright transition-colors hover:bg-jukebox-red/10"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className="font-button w-full justify-start rounded-xl text-jukebox-cream/80 hover:bg-jukebox-gold/10 hover:text-jukebox-gold"
                    >
                      Login
                    </Button>
                  </Link>

                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="jukebox-chrome-button font-button w-full rounded-xl font-bold uppercase button-tracking">
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