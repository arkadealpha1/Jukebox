'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRoomStore } from '@/store/roomStore';
import { APP_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function InviteButton({ className }: { className?: string }) {
  const { room } = useRoomStore();
  const [copied, setCopied] = useState(false);

  const inviteUrl = room
    ? `${APP_URL}/join?code=${room.roomCode}`
    : '';

  const handleCopy = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Invite link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  }, [inviteUrl]);

  const handleShare = useCallback(async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Jukebox room!',
          text: `Join my room ${room?.roomCode} on Jukebox!`,
          url: inviteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  }, [inviteUrl, handleCopy, room?.roomCode]);

  if (!room) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('flex flex-col items-center gap-3', className)}
    >
      <div className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
          Room Code
        </p>
        <p className="text-3xl md:text-4xl font-bold tracking-[0.2em] text-white font-mono">
          {room.roomCode}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className={cn(
            'border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all',
            copied && 'border-green-500/50 text-green-400 bg-green-500/10',
          )}
        >
          <Copy className="w-4 h-4 mr-1.5" />
          {copied ? 'Copied!' : 'Copy Invite Link'}
        </Button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/10"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            Share
          </Button>
        )}
      </div>
    </motion.div>
  );
}
