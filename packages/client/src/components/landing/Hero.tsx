'use client';

import { motion } from 'framer-motion';
import { Music, DoorOpen, Users, Headphones, Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
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
    <section className="relative flex min-h-[auto] items-center justify-center overflow-hidden px-4 pb-8 pt-10 sm:pb-12 sm:pt-14 lg:min-h-[calc(100vh-4rem)] lg:py-14">
      <div className="pointer-events-none absolute inset-0 jukebox-bg" />

      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute left-4 top-20 hidden h-[44vh] w-2 rounded-full jukebox-tube-red animate-tube-glow sm:block lg:left-12" />
        <div className="absolute right-4 top-24 hidden h-[42vh] w-2 rounded-full jukebox-tube-cyan animate-tube-glow sm:block lg:right-12" />
        <div className="absolute bottom-4 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-jukebox-gold to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="font-button mb-4 inline-flex items-center gap-2 rounded-full jukebox-display px-4 py-2 text-[10px] font-bold uppercase tracking-[0.26em] text-jukebox-gold"
          >
            <Headphones className="h-3.5 w-3.5 text-jukebox-cyan" />
            Real-time group listening
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-logo relative text-5xl font-bold uppercase logo-tracking text-jukebox-cream sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl"
          >
            <span className="jukebox-neon-gold">Juke</span>
            <span className="jukebox-neon-red">box</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-heading mt-4 max-w-2xl text-xl font-semibold leading-snug text-jukebox-cream sm:text-2xl"
          >
            Create a private room. Queue songs together. Listen in sync.
          </motion.p>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-body luxury-subtitle mt-3 max-w-2xl text-lg leading-7 text-jukebox-cream/85 sm:text-xl"
          >
            Host a shared YouTube music session where friends can join with a
            room code, add songs to the selection panel, and enjoy a synced
            listening room with a luxury vinyl lounge feel.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-7 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row lg:justify-start"
          >
            <Button
              size="lg"
              className="jukebox-chrome-button font-button w-full gap-2 rounded-full px-8 font-bold uppercase button-tracking sm:w-auto"
              onClick={() => scrollToSection('create-room')}
            >
              <Music size={18} />
              Create Room
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="font-button w-full gap-2 rounded-full border-jukebox-cyan/50 bg-jukebox-black/60 px-8 font-bold uppercase button-tracking text-jukebox-cyan shadow-jukebox-cyan backdrop-blur-xl hover:bg-jukebox-cyan/10 hover:text-jukebox-cream sm:w-auto"
              onClick={() => scrollToSection('join-room')}
            >
              <DoorOpen size={18} />
              Join Room
            </Button>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="font-button mt-4 text-[10px] uppercase tracking-[0.22em] dark:text-jukebox-gold/65 text-jukebox-brass"
          >
            {isAuthenticated
              ? 'Signed in — create a room to become the host.'
              : 'Hosts sign in. Guests join with a nickname.'}
          </motion.p>
        </div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto flex w-full max-w-[330px] justify-center sm:max-w-[360px] lg:max-w-[380px]"
        >
          <div className="relative w-full animate-jukebox-float">
            <div className="jukebox-arch-frame relative min-h-[390px] overflow-hidden px-6 pb-6 pt-10 sm:min-h-[430px] lg:min-h-[460px]">
              <div className="absolute left-1/2 top-5 h-2.5 w-24 -translate-x-1/2 rounded-full jukebox-tube-red" />

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-jukebox-gold/60 bg-black/50 shadow-jukebox-gold sm:h-24 sm:w-24">
                <Radio className="h-9 w-9 text-jukebox-gold sm:h-10 sm:w-10" />
              </div>

              <div className="mt-6 rounded-2xl jukebox-display p-3 text-center">
                <p className="font-button text-[9px] font-bold uppercase tracking-[0.3em] dark:text-jukebox-gold/75 text-jukebox-brass">
                  Now Spinning
                </p>

                <div className="mt-3 overflow-hidden rounded-xl border border-jukebox-gold/30 bg-black/40 p-3">
                  <p className="font-heading truncate text-sm font-semibold text-jukebox-cream">
                    Your Room • Your Queue • Your Sound
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full jukebox-progress-track">
                    <motion.div
                      className="h-full rounded-full jukebox-progress-fill"
                      initial={{ width: '15%' }}
                      animate={{ width: ['15%', '86%', '42%', '72%'] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {['A1', 'A2', 'B1', 'B2'].map((code, index) => (
                  <div
                    key={code}
                    className="rounded-xl border border-jukebox-gold/30 bg-jukebox-black/70 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-roomcode text-lg text-jukebox-gold roomcode-tracking">
                        {code}
                      </span>

                      <Sparkles
                        className={
                          index % 2 === 0
                            ? 'h-3.5 w-3.5 text-jukebox-cyan'
                            : 'h-3.5 w-3.5 text-jukebox-red-bright'
                        }
                      />
                    </div>

                    <div className="mt-2 h-1 rounded-full bg-jukebox-gold/25" />
                    <div className="mt-2 h-1 w-2/3 rounded-full bg-jukebox-cream/20" />
                  </div>
                ))}
              </div>

              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3">
                <div className="h-10 w-10 rounded-full jukebox-chrome-button" />
                <div className="h-14 w-14 rounded-full border border-jukebox-red-bright/70 bg-jukebox-red shadow-jukebox-red" />
                <div className="h-10 w-10 rounded-full jukebox-chrome-button" />
              </div>
            </div>

            <div className="absolute -bottom-5 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-black/80 blur-xl" />
          </div>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2"
        >
          <div className="jukebox-panel rounded-2xl p-5 text-left">
            <Music className="h-5 w-5 text-jukebox-gold" />
            <h3 className="font-heading mt-3 text-sm font-semibold uppercase heading-tracking text-black dark:text-jukebox-cream">
              Host a room
            </h3>
            <p className="font-body mt-2 text-base leading-5 text-black dark:text-jukebox-cream/80">
              Create a private session and control playback as the host.
            </p>
          </div>

          <div className="jukebox-panel rounded-2xl p-5 text-left">
            <DoorOpen className="h-5 w-5 text-jukebox-cyan" />
            <h3 className="font-heading mt-3 text-sm font-semibold uppercase heading-tracking text-black dark:text-jukebox-cream">
              Join instantly
            </h3>
            <p className="font-body mt-2 text-base leading-5 text-black dark:text-jukebox-cream/80">
              Enter a room code, choose a nickname, and start listening.
            </p>
          </div>

          <div className="jukebox-panel rounded-2xl p-5 text-left">
            <Users className="h-5 w-5 text-jukebox-red-bright" />
            <h3 className="font-heading mt-3 text-sm font-semibold uppercase heading-tracking text-black dark:text-jukebox-cream">
              Queue together
            </h3>
            <p className="font-body mt-2 text-base leading-5 text-black dark:text-jukebox-cream/80">
              Everyone can add songs while the room stays synced in real time.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}