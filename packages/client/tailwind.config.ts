import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        jukebox: {
          black: '#050406',
          softBlack: '#0d0a0b',
          red: '#b11226',
          brightRed: '#ff334d',
          gold: '#d6a84f',
          brightGold: '#ffd36a',
          cyan: '#00e5ff',
          pink: '#ff4fd8',
          cream: '#ffe9b7',
          brass: '#8a5a22',
          wood: '#26120d',
        },
      },

      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      boxShadow: {
        'jukebox-gold': '0 0 24px rgba(214, 168, 79, 0.24)',
        'jukebox-red': '0 0 28px rgba(255, 51, 77, 0.28)',
        'jukebox-cyan': '0 0 28px rgba(0, 229, 255, 0.28)',
        'jukebox-panel':
          '0 24px 70px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.11)',
        'jukebox-chrome':
          '0 10px 28px rgba(0, 0, 0, 0.38), 0 0 18px rgba(255, 211, 106, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.75)',
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        arch: '999px 999px 32px 32px',
      },

      backgroundImage: {
        'jukebox-radial':
          'radial-gradient(circle at 20% 10%, rgba(255, 51, 77, 0.18), transparent 26rem), radial-gradient(circle at 80% 15%, rgba(0, 229, 255, 0.14), transparent 28rem), radial-gradient(circle at 50% 95%, rgba(255, 211, 106, 0.12), transparent 30rem), linear-gradient(180deg, #070405 0%, #12080a 48%, #050406 100%)',
        'jukebox-gold':
          'linear-gradient(180deg, #ffe6a3 0%, #d6a84f 42%, #8a5a22 100%)',
        'jukebox-red':
          'linear-gradient(180deg, #ff5a70 0%, #b11226 58%, #5e0711 100%)',
        'jukebox-cyan':
          'linear-gradient(180deg, #e9ffff 0%, #00e5ff 48%, #007f91 100%)',
        'jukebox-panel':
          'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), radial-gradient(circle at top, rgba(177,18,38,0.16), transparent 70%), rgba(5,4,6,0.88)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },

        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
          },
          '50%': {
            boxShadow: '0 0 40px hsl(var(--primary) / 0.6)',
          },
        },

        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },

        'neon-pulse': {
          '0%, 100%': {
            opacity: '0.82',
            filter: 'brightness(1)',
            boxShadow:
              '0 0 10px rgba(255, 51, 77, 0.55), 0 0 24px rgba(0, 229, 255, 0.22)',
          },
          '50%': {
            opacity: '1',
            filter: 'brightness(1.25)',
            boxShadow:
              '0 0 18px rgba(255, 51, 77, 0.82), 0 0 42px rgba(0, 229, 255, 0.35)',
          },
        },

        'tube-glow': {
          '0%, 100%': {
            filter: 'brightness(1)',
            boxShadow:
              '0 0 10px rgba(0, 229, 255, 0.65), 0 0 28px rgba(0, 229, 255, 0.32)',
          },
          '50%': {
            filter: 'brightness(1.22)',
            boxShadow:
              '0 0 16px rgba(255, 211, 106, 0.72), 0 0 38px rgba(255, 51, 77, 0.38)',
          },
        },

        'chrome-shine': {
          '0%': {
            backgroundPosition: '-200% center',
          },
          '100%': {
            backgroundPosition: '200% center',
          },
        },

        'jukebox-float': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
        },

        'marquee-left': {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(-50%)',
          },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',

        'neon-pulse': 'neon-pulse 2.4s ease-in-out infinite',
        'tube-glow': 'tube-glow 2.8s ease-in-out infinite',
        'chrome-shine': 'chrome-shine 2.5s linear infinite',
        'jukebox-float': 'jukebox-float 5s ease-in-out infinite',
        'marquee-left': 'marquee-left 16s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;