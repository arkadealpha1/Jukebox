'use client';

import { motion } from 'framer-motion';
import { Music, DoorOpen, Users, Headphones } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

function scrollToSection(primaryId: string, fallbackId = 'get-started') {
  const target =
    document.getElementById(primaryId) ||
    document.getElementById(fallbackId);

  target?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function Hero() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-purple-200 backdrop-blur-xl"
        >
          <Headphones className="h-3.5 w-3.5" />
          Real-time group listening
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Jukebox
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-5 text-lg font-medium text-gray-200 sm:text-xl md:text-2xl"
        >
          Create a private room. Queue songs together. Listen in sync.
        </motion.p>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base"
        >
          Jukebox lets you host a shared YouTube music session where friends can
          join with a room code, add songs to the queue, and enjoy a synchronized
          listening experience across devices.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-9 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:justify-center"
        >
          <Button
            size="lg"
            className="w-full gap-2 rounded-full bg-purple-600 px-7 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 sm:w-auto"
            onClick={() => scrollToSection('create-room')}
          >
            <Music size={18} />
            Create Room
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 rounded-full border-white/10 bg-white/5 px-7 text-white backdrop-blur-xl hover:bg-white/10 sm:w-auto"
            onClick={() => scrollToSection('join-room')}
          >
            <DoorOpen size={18} />
            Join Room
          </Button>
        </motion.div>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-4 text-xs text-gray-500"
        >
          {isAuthenticated
            ? 'You are signed in. Create a room to become the host.'
            : 'Hosts need to log in. Guests can join with a nickname.'}
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-xl">
            <Music className="h-5 w-5 text-purple-300" />
            <h3 className="mt-3 text-sm font-semibold text-white">
              Host a room
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-400">
              Create a private session and control playback as the host.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-xl">
            <DoorOpen className="h-5 w-5 text-pink-300" />
            <h3 className="mt-3 text-sm font-semibold text-white">
              Join instantly
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-400">
              Enter a room code, choose a nickname, and start listening.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-xl">
            <Users className="h-5 w-5 text-blue-300" />
            <h3 className="mt-3 text-sm font-semibold text-white">
              Queue together
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-400">
              Everyone can add songs while the room stays synced in real time.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}