'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useThemeStore } from '@/store/themeStore';

import Vibrant from 'node-vibrant';
import type { ThemeColors } from '@/types';

interface ExtractedColors {
  isExtracting: boolean;
  colors: ThemeColors;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function swatchToHex(
  swatch: { getRgb: () => [number, number, number] } | null | undefined,
  fallback: string,
): string {
  if (!swatch) return fallback;
  const [r, g, b] = swatch.getRgb();
  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

const FALLBACK_COLORS: ThemeColors = {
  primary: '#7c3aed',
  secondary: '#4f46e5',
  accent: '#a78bfa',
  background: '#0f0a1a',
  surface: '#1a122e',
};

export function useThemeColors(imageUrl: string | null): ExtractedColors {
  const [isExtracting, setIsExtracting] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(FALLBACK_COLORS);
  const { setColors: setThemeStoreColors } = useThemeStore();
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastUrl = useRef<string | null>(null);

  const extract = useCallback(async (url: string) => {
    setIsExtracting(true);
    try {
      const palette = await Vibrant.from(url).getPalette();
      const extracted: ThemeColors = {
        primary: swatchToHex(palette.Vibrant, FALLBACK_COLORS.primary),
        secondary: swatchToHex(palette.DarkVibrant, FALLBACK_COLORS.secondary),
        accent: swatchToHex(palette.LightVibrant, FALLBACK_COLORS.accent),
        background: swatchToHex(palette.DarkMuted, FALLBACK_COLORS.background),
        surface: swatchToHex(palette.Muted, FALLBACK_COLORS.surface),
      };
      setColors(extracted);
      setThemeStoreColors({
        primaryColor: extracted.primary,
        secondaryColor: extracted.secondary,
        accentColor: extracted.accent,
        backgroundColor: extracted.background,
        surfaceColor: extracted.surface,
      });
    } catch {
      setColors(FALLBACK_COLORS);
      setThemeStoreColors({
        primaryColor: FALLBACK_COLORS.primary,
        secondaryColor: FALLBACK_COLORS.secondary,
        accentColor: FALLBACK_COLORS.accent,
        backgroundColor: FALLBACK_COLORS.background,
        surfaceColor: FALLBACK_COLORS.surface,
      });
    } finally {
      setIsExtracting(false);
    }
  }, []);

  useEffect(() => {
    if (!imageUrl || imageUrl === lastUrl.current) return;
    lastUrl.current = imageUrl;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      extract(imageUrl);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [imageUrl, extract]);

  return { isExtracting, colors };
}
