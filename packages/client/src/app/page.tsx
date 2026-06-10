'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Music, Users, Headphones, Radio, Disc3 } from 'lucide-react';
import { Hero } from '@/components/landing/Hero';
import { CreateRoomCard } from '@/components/landing/CreateRoomCard';
import { JoinRoomCard } from '@/components/landing/JoinRoomCard';
import { useAuthStore } from '@/store/authStore';
import { roomService } from '@/services/room';
import { Card, CardContent } from '@/components/ui';
import type { Room } from '@/types';

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      roomService.getActiveRooms().then(setActiveRooms).catch(() => {});
    }
  }, [isAuthenticated]);

  return (
    <div className="relative min-h-screen overflow-hidden jukebox-bg">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[12%] h-[440px] w-[440px] rounded-full bg-jukebox-red/15 blur-[120px]" />
        <div className="absolute right-[-8%] top-[18%] h-[420px] w-[420px] rounded-full bg-jukebox-cyan/12 blur-[120px]" />
        <div className="absolute bottom-[-12%] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-jukebox-gold/10 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.08] jukebox-wood-bg" />
      </div>

      <Hero />

      {isAuthenticated && user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto max-w-7xl px-4 pb-6 sm:px-6"
        >
          <Card className="jukebox-panel overflow-hidden rounded-2xl border-jukebox-gold/40 bg-transparent">
            <CardContent className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-jukebox-cyan/60 to-transparent" />

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full jukebox-chrome-button">
                <Headphones className="h-5 w-5 text-jukebox-black" />
              </div>

              <div className="flex-1">
                <p className="text-sm uppercase tracking-[0.18em] dark:text-jukebox-gold/75 text-jukebox-brass">
                  Welcome Back
                </p>
                <p className="mt-1 text-base font-bold text-jukebox-cream">
                  {user.username}
                </p>
                <p className="mt-1 text-xs text-jukebox-cream/55">
                  {activeRooms.length > 0
                    ? `You have ${activeRooms.length} active room${activeRooms.length > 1 ? 's' : ''}`
                    : 'Start a new listening session'}
                </p>
              </div>

              {activeRooms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeRooms.slice(0, 3).map((room) => (
                    <button
                      key={room.id}
                      onClick={() => router.push(`/room/${room.id}`)}
                      className="jukebox-display rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest text-jukebox-cyan transition-all hover:border-jukebox-cyan/60 hover:text-jukebox-cream"
                    >
                      <Music className="mr-1 inline h-3 w-3" />
                      {room.roomCode}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.section
        id="get-started"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        variants={stagger}
        className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6"
      >
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full jukebox-chrome-button">
            <Radio className="h-6 w-6 text-jukebox-black" />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-jukebox-gold/80">
            Select Your Session
          </p>

          <h2 className="mt-2 text-3xl font-black uppercase tracking-[0.16em] text-jukebox-cream sm:text-4xl">
            Get Started
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-jukebox-cream/55">
            Create a room to host the jukebox, or join one with a room code and
            nickname.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          <motion.div id="create-room" variants={fadeUp}>
            <CreateRoomCard />
          </motion.div>

          <motion.div id="join-room" variants={fadeUp}>
            <JoinRoomCard />
          </motion.div>
        </div>

        <motion.div variants={fadeUp} className="mt-12 text-center">
          <div className="jukebox-display inline-flex items-center gap-3 rounded-full px-5 py-3">
            <Disc3 className="h-4 w-4 animate-spin text-jukebox-cyan [animation-duration:4s]" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] dark:text-jukebox-cream/70 text-black/75">
              Listen together in real time with unlimited friends
            </span>
            <Users className="h-4 w-4 text-jukebox-red-bright" />
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}