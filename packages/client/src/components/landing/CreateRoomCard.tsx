'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
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
        className="group relative"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]">
          <Music className="mx-auto h-8 w-8 text-purple-400" />
          <h3 className="mt-3 text-center text-lg font-semibold text-white">
            Create a Room
          </h3>
          <p className="mt-1 text-center text-sm text-gray-400">
            Sign in to create a listening room.
          </p>
          <Link href="/login">
            <Button className="mt-4 w-full">Sign In</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]">
        <Music className="mx-auto h-8 w-8 text-purple-400" />
        <h3 className="mt-3 text-center text-lg font-semibold text-white">
          Create a Room
        </h3>
        <p className="mt-1 text-center text-sm text-gray-400">
          Start a new listening session.
        </p>

        <div className="mt-4 space-y-3">
          <Input
            placeholder="Room name (optional)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
          />

          {error && (
            <p className="text-center text-xs text-red-400">{error}</p>
          )}

          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Music size={16} />
                Create a Room
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
