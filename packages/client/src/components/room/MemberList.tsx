'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Users, ShieldAlert } from 'lucide-react';
import { useRoomStore } from '@/store/roomStore';
import { useAuthStore } from '@/store/authStore';
import { useRoom } from '@/hooks/useRoom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function MemberList({ className }: { className?: string }) {
  const { members, isHost, room } = useRoomStore();
  const user = useAuthStore((s) => s.user);
  const { transferHost } = useRoom(room?.id);
  const [transferTarget, setTransferTarget] = useState<{ id: string; nickname: string } | null>(null);

  const currentUserId = user?.id ?? '';

  const handleTransfer = useCallback(() => {
    if (transferTarget) {
      transferHost(transferTarget.id);
      setTransferTarget(null);
    }
  }, [transferTarget, transferHost]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>
            <span className="text-white">{members.length}</span> member
            {members.length !== 1 ? 's' : ''}
          </span>
        </h3>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-10 h-10 text-white/10 mb-3" />
            <p className="text-white/30 text-sm">No members yet</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {members.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const isMemberHost = member.isHost;

              return (
                <motion.div
                  key={member.userId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10 ring-2 ring-white/10">
                      <AvatarFallback className="bg-white/10 text-white/60 text-xs">
                        {getInitials(member.nickname)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0f0a1a] rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-white/80 truncate">{member.nickname}</p>
                      {isCurrentUser && (
                        <span className="text-[10px] text-white/30">(you)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isMemberHost && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span className="text-[10px] text-yellow-400 font-medium">Host</span>
                      </div>
                    )}

                    {isHost && !isMemberHost && !isCurrentUser && (
                      <button
                        onClick={() =>
                          setTransferTarget({ id: member.userId, nickname: member.nickname })
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-yellow-400 text-xs ml-1"
                        title="Transfer host"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </ScrollArea>

      <Dialog
        open={!!transferTarget}
        onOpenChange={(open) => {
          if (!open) setTransferTarget(null);
        }}
      >
        <DialogContent className="bg-[#1a122e] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Transfer Host</DialogTitle>
            <DialogDescription className="text-white/50">
              Are you sure you want to transfer host privileges to{' '}
              <span className="text-white font-medium">{transferTarget?.nickname}</span>?
              You will no longer be the room host.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setTransferTarget(null)}
              className="text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
