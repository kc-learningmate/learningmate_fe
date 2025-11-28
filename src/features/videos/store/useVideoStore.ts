import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nowKstDateKey } from '@/lib/timezone';

export const MISSION_TARGET = 60 as const;

type VideoState = {
  kstDateKey: string;
  todaysKeywordId: number | null;
  watchedSeconds: number;
  lastTime: number;
  duration: number | null;
  isCompleted: boolean;

  ensureKstDay: () => void;
  setTodaysKeywordId: (id: number) => void;

  setWatchedSeconds: (inc: number) => void;
  setLastTime: (time: number) => void;
  setDuration: (dur: number) => void;

  completeOnce: () => boolean;

  resetAll: () => void;
};

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      kstDateKey: nowKstDateKey(),
      todaysKeywordId: null,

      watchedSeconds: 0,
      lastTime: 0,
      duration: null,
      isCompleted: false,

      ensureKstDay: () => {
        const nowKey = nowKstDateKey();
        if (get().kstDateKey !== nowKey) {
          set({
            kstDateKey: nowKey,
            todaysKeywordId: null,
            watchedSeconds: 0,
            lastTime: 0,
            duration: null,
            isCompleted: false,
          });
        }
      },

      setTodaysKeywordId: (id) => {
        const nowKey = nowKstDateKey();
        const s = get();
        if (s.kstDateKey !== nowKey || s.todaysKeywordId !== id) {
          set({
            kstDateKey: nowKey,
            todaysKeywordId: id,
            watchedSeconds: 0,
            lastTime: 0,
            duration: null,
            isCompleted: false,
          });
        }
      },

      setWatchedSeconds: (inc) => {
        if (get().isCompleted) return;
        const add = Math.max(0, Math.floor(inc || 0));
        if (!add) return;
        set((s) => ({ watchedSeconds: s.watchedSeconds + add }));
      },

      setLastTime: (time) => {
        if (get().isCompleted) return;
        set({ lastTime: Math.max(0, Math.floor(time || 0)) });
      },

      setDuration: (dur) =>
        set({ duration: Math.max(0, Math.floor(dur || 0)) }),

      completeOnce: () => {
        const s = get();
        if (s.isCompleted) return false;
        const clamped = Math.max(s.watchedSeconds, MISSION_TARGET);
        set({ watchedSeconds: clamped, isCompleted: true });
        return true;
      },

      resetAll: () =>
        set({
          kstDateKey: nowKstDateKey(),
          todaysKeywordId: null,
          watchedSeconds: 0,
          lastTime: 0,
          duration: null,
          isCompleted: false,
        }),
    }),
    {
      name: 'watchVideoStatus',
      version: 3,
    }
  )
);
