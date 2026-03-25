/**
 * Store de playback: estado de reproducción de clips
 * Separado del avatar store para claridad arquitectónica
 */

import { create } from "zustand";
import type { AvatarAnimationClip } from "@/types/motion";

interface PlaybackStoreState {
  // Estado de reproducción
  isPlaying: boolean;
  currentClip: AvatarAnimationClip | null;
  currentTime: number; // ms
  duration: number; // ms

  // Configuración
  playbackRate: number; // 1.0 = normal, 0.5 = mitad velocidad, 2 = doble
  loop: boolean;
  autoPlay: boolean;

  // Métodos
  play: (clip: AvatarAnimationClip, resetTime?: boolean) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (timeMs: number) => void;
  setPlaybackRate: (rate: number) => void;
  setLoop: (loop: boolean) => void;
  setCurrentTime: (time: number) => void;
}

export const usePlaybackStore = create<PlaybackStoreState>((set) => ({
  isPlaying: false,
  currentClip: null,
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  loop: false,
  autoPlay: false,

  play: (clip, resetTime = true) => {
    set({
      currentClip: clip,
      isPlaying: true,
      currentTime: resetTime ? 0 : undefined,
      duration: clip.frames.length > 0 
        ? clip.frames[clip.frames.length - 1].timestampMs 
        : 0,
    });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ isPlaying: false, currentClip: null, currentTime: 0 }),
  seek: (timeMs) => set({ currentTime: timeMs }),
  setPlaybackRate: (rate) => set({ playbackRate: Math.max(0.1, Math.min(3, rate)) }),
  setLoop: (loop) => set({ loop }),
  setCurrentTime: (time) => set({ currentTime: time }),
}));
