'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DoorOpen, ClipboardPaste } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { roomService } from '@/services/room';

const ROOM_CODE_REGEX = /^[a-zA-Z0-9]{6}$/;
const INVITE_URL_REGEX = /room\/([a-zA-Z0-9]{6})/i;
const NICKNAME_REGEX = /^[a-zA-Z0-9_ ]+$/;

export function JoinRoomCard() {
  const router = useRouter();

  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cleanNickname = nickname.trim();

  const isNicknameValid =
    cleanNickname.length >= 2 && NICKNAME_REGEX.test(cleanNickname);

  const canJoin = roomCode.length === 6 && isNicknameValid && !loading;

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomCode(value);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    if (error) setError('');
  };

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const match = text.match(INVITE_URL_REGEX);

      if (match) {
        setRoomCode(match[1].toUpperCase());
        return;
      }

      const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '');

      if (clean.length === 6) {
        setRoomCode(clean);
      }
    } catch {
      const match = roomCode.match(INVITE_URL_REGEX);

      if (match) {
        setRoomCode(match[1].toUpperCase());
      }
    }
  }, [roomCode]);

  const handleJoin = async () => {
    if (!ROOM_CODE_REGEX.test(roomCode)) {
      setError('Room code must be exactly 6 characters');
      return;
    }

    if (cleanNickname.length < 2) {
      setError('Nickname must be at least 2 characters');
      return;
    }

    if (!NICKNAME_REGEX.test(cleanNickname)) {
      setError('Nickname can only contain letters, numbers, spaces, and underscores');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { room } = await roomService.joinRoom(roomCode, cleanNickname);
      router.push(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
        <DoorOpen className="mx-auto h-8 w-8 text-blue-400" />

        <h3 className="mt-3 text-center text-lg font-semibold text-white">
          Join a Room
        </h3>

        <p className="mt-1 text-center text-sm text-gray-400">
          Enter a room code to join.
        </p>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <Input
              placeholder="ABC123"
              value={roomCode}
              onChange={handleRoomCodeChange}
              maxLength={6}
              className="border-white/10 bg-white/5 text-center font-mono text-lg uppercase tracking-widest text-white placeholder:text-gray-500"
            />

            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              title="Paste from clipboard"
            >
              <ClipboardPaste size={16} />
            </button>
          </div>

          <Input
            placeholder="Your nickname"
            value={nickname}
            onChange={handleNicknameChange}
            maxLength={20}
            minLength={2}
            required
            className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
          />

          {error && (
            <p className="text-center text-xs text-red-400">{error}</p>
          )}

          <Button
            onClick={handleJoin}
            disabled={!canJoin}
            className="w-full gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Joining...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <DoorOpen size={16} />
                Join Room
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}