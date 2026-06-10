'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, Radio, Sparkles } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { roomService } from '@/services/room';
import { useAuthStore } from '@/store/authStore';

export function CreateRoomCard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    setLoading(true);

    try {
      const { room } = await roomService.createRoom(roomName || undefined);
      router.push(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative h-full"
      >
        <div className="jukebox-panel relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300 group-hover:border-jukebox-gold/70 group-hover:shadow-jukebox-red">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-1 rounded-full jukebox-tube-red opacity-80" />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full jukebox-chrome-button">
            <Music className="h-6 w-6 text-jukebox-black" />
          </div>

          <p className="mt-5 text-center text-[10px] font-black uppercase tracking-[0.32em] dark:text-jukebox-gold/75 text-jukebox-brass">
            Host Control
          </p>

          <h3 className="mt-2 text-center text-xl font-black uppercase tracking-[0.12em] text-jukebox-cream">
            Create a Room
          </h3>

          <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-jukebox-cream/55">
            Sign in to start a private listening room and control the jukebox.
          </p>

          <Link href="/login">
            <Button className="jukebox-chrome-button mt-6 w-full rounded-full font-black uppercase tracking-[0.18em]">
              Sign In
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative h-full"
    >
      <div className="jukebox-panel relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300 group-hover:border-jukebox-gold/70 group-hover:shadow-jukebox-red">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-1 rounded-full jukebox-tube-red opacity-80" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-jukebox-red/20 blur-3xl" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full jukebox-chrome-button">
          <Radio className="h-6 w-6 text-jukebox-black" />
        </div>

        <p className="mt-5 text-center text-[10px] font-black uppercase tracking-[0.32em] dark:text-jukebox-gold/75 text-jukebox-brass">
          Start Machine
        </p>

        <h3 className="mt-2 text-center text-xl font-black uppercase tracking-[0.12em] text-jukebox-cream">
          Create a Room
        </h3>

        <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-jukebox-cream/55">
          Name your session and become the host of the room.
        </p>

        <div className="mt-5 space-y-3">
          <div className="jukebox-display rounded-2xl p-2">
            <Input
              placeholder="Room name (optional)"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="h-11 border-jukebox-gold/20 bg-black/40 text-center text-sm font-semibold text-black dark:text-jukebox-cream placeholder:text-black/40 dark:placeholder:text-jukebox-cream/30 focus-visible:ring-jukebox-gold/40"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-jukebox-red-bright/30 bg-jukebox-red/10 px-3 py-2 text-center text-xs font-semibold text-jukebox-red-bright">
              {error}
            </div>
          )}

          <Button
            onClick={handleCreate}
            disabled={loading}
            className="jukebox-chrome-button w-full rounded-full font-black uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-jukebox-black/30 border-t-jukebox-black" />
                Creating
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={16} />
                Create Room
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}