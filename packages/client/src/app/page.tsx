'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Music, Users, Headphones } from 'lucide-react';
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute left-1/2 top-3/4 h-[300px] w-[300px] animate-pulse rounded-full bg-pink-500/10 blur-[80px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
      </div>

      <Hero />

      {isAuthenticated && user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto max-w-7xl px-4 pb-4 sm:px-6"
        >
          <Card className="border-purple-500/20 bg-white/5 backdrop-blur-xl">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20">
                <Headphones className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  Welcome back, <span className="font-semibold text-white">{user.username}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {activeRooms.length > 0
                    ? `You have ${activeRooms.length} active room${activeRooms.length > 1 ? 's' : ''}`
                    : 'Start a new listening session'}
                </p>
              </div>
              {activeRooms.length > 0 && (
                <div className="flex gap-2">
                  {activeRooms.slice(0, 3).map((room) => (
                    <button
                      key={room.id}
                      onClick={() => router.push(`/room/${room.id}`)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-purple-300 transition-colors hover:border-purple-500/30 hover:bg-purple-500/10"
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
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        variants={stagger}
        className="relative z-10 mx-auto max-w-5xl px-4 pb-24 sm:px-6"
      >
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Get Started
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Create a room to host a session, or join one with a code
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          <motion.div variants={fadeUp}>
            <CreateRoomCard />
          </motion.div>
          <motion.div variants={fadeUp}>
            <JoinRoomCard />
          </motion.div>
        </div>

        <motion.div variants={fadeUp} className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-gray-400">
              Listen together in real-time with unlimited friends
            </span>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
