'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DoorOpen, ClipboardPaste, Ticket, Radio } from 'lucide-react';
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
    if (error) setError('');
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
      className="group relative h-full"
    >
      <div className="jukebox-panel relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300 group-hover:border-jukebox-cyan/70 group-hover:shadow-jukebox-cyan">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-1 rounded-full jukebox-tube-cyan opacity-80" />
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-jukebox-cyan/20 blur-3xl" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-jukebox-cyan/50 bg-jukebox-black/70 shadow-jukebox-cyan">
          <DoorOpen className="h-6 w-6 text-blue dark:text-jukebox-cyan" />
        </div>

        <p className="mt-5 text-center text-[10px] font-black uppercase tracking-[0.32em] text-blue dark:text-jukebox-cyan/80">
          Guest Entry
        </p>

        <h3 className="mt-2 text-center text-xl font-black uppercase tracking-[0.12em] text-jukebox-cream">
          Join a Room
        </h3>

        <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-jukebox-cream/55">
          Enter the room code and your nickname to step into the listening booth.
        </p>

        <div className="mt-5 space-y-3">
          <div className="jukebox-display rounded-2xl p-2">
            <div className="relative">
              <Input
                placeholder="ABC123"
                value={roomCode}
                onChange={handleRoomCodeChange}
                maxLength={6}
                className="h-12 border-jukebox-cyan/20 bg-black/40 pr-10 text-center font-mono text-xl font-black uppercase tracking-[0.34em] text-blue dark:text-jukebox-cyan placeholder:text-blue dark:text-jukebox-cyan/25 focus-visible:ring-jukebox-cyan/40"
              />

              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-jukebox-gold/30 bg-black/40 text-jukebox-gold transition-colors hover:bg-jukebox-gold/10 hover:text-jukebox-cream"
                title="Paste from clipboard"
              >
                <ClipboardPaste size={15} />
              </button>
            </div>
          </div>

          <div className="jukebox-display rounded-2xl p-2">
            <Input
              placeholder="Your nickname"
              value={nickname}
              onChange={handleNicknameChange}
              maxLength={20}
              minLength={2}
              required
              className="h-11 border-jukebox-gold/20 bg-black/40 text-center text-sm font-semibold text-black dark:text-jukebox-cream placeholder:text-black/40 dark:placeholder:text-jukebox-cream/30 focus-visible:ring-jukebox-gold/40"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-jukebox-red-bright/30 bg-jukebox-red/10 px-3 py-2 text-center text-xs font-semibold text-jukebox-red-bright">
              {error}
            </div>
          )}

          <Button
            onClick={handleJoin}
            disabled={!canJoin}
            className="w-full rounded-full border border-jukebox-cyan/60 bg-jukebox-black/70 font-black uppercase tracking-[0.18em] text-blue dark:text-jukebox-cyan shadow-jukebox-cyan transition-all hover:bg-jukebox-cyan/10 hover:text-jukebox-cream disabled:cursor-not-allowed disabled:opacity-50 disabled:text-black/40 dark:disabled:text-jukebox-cream/40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-jukebox-cyan/30 border-t-jukebox-cyan" />
                Joining
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Ticket size={16} />
                Join Room
              </span>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black dark:text-jukebox-cream/35">
            <Radio className="h-3 w-3 text-blue dark:text-jukebox-cyan/60" />
            Room code required
          </div>
        </div>
      </div>
    </motion.div>
  );
}