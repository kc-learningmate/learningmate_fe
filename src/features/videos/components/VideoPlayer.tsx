import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Award, Film, Tag } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { useVideoStore, MISSION_TARGET } from '../store/useVideoStore';
import { useSaveVideoMission } from '../hooks/useSaveVideoMission';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type Keyword = { id: number; name: string };

type Props = {
  todaysKeyword: Keyword;
  videoId: string;
  keywordIconSrc?: string;
};

const toMMSS = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.max(0, s % 60);
  return `${String(m)}:${String(sec).padStart(2, '0')}`;
};

function ConfettiBurst({ show }: { show: boolean }) {
  const PARTICLES = 30;
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];
  return (
    <AnimatePresence>
      {show && (
        <motion.div className='pointer-events-none absolute inset-0 overflow-hidden'>
          {Array.from({ length: PARTICLES }).map((_, i) => (
            <motion.div
              key={i}
              className='absolute left-1/2 top-1/2 h-2 w-2 rounded-sm'
              style={{ background: COLORS[i % COLORS.length] }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 320,
                y: (Math.random() - 0.5) * 320,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.25, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function VideoPlayer({
  todaysKeyword,
  videoId,
  keywordIconSrc,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const startTimeRef = useRef<number | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasSavedRef = useRef(false);

  const watchedSeconds = useVideoStore((s) => s.watchedSeconds);
  const duration = useVideoStore((s) => s.duration);
  const lastTime = useVideoStore((s) => s.lastTime);
  const isCompleted = useVideoStore((s) => s.isCompleted);

  const setTodaysKeywordId = useVideoStore((s) => s.setTodaysKeywordId);
  const setWatchedSeconds = useVideoStore((s) => s.setWatchedSeconds);
  const setLastTime = useVideoStore((s) => s.setLastTime);
  const setDuration = useVideoStore((s) => s.setDuration);
  const ensureKstDay = useVideoStore((s) => s.ensureKstDay);
  const completeOnce = useVideoStore((s) => s.completeOnce);

  const { mutate: saveMission, isPending: saving } = useSaveVideoMission(
    todaysKeyword.id
  );

  const [confetti, setConfetti] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => {
    ensureKstDay();
    setTodaysKeywordId(todaysKeyword.id);
  }, [todaysKeyword.id, ensureKstDay, setTodaysKeywordId]);

  const liveDiff = startTimeRef.current
    ? Math.floor((Date.now() - startTimeRef.current) / 1000)
    : 0;
  const liveWatched = isCompleted
    ? MISSION_TARGET
    : Math.min(MISSION_TARGET, watchedSeconds + liveDiff);
  const progress = Math.min(
    100,
    Math.round((liveWatched / MISSION_TARGET) * 100)
  );
  const remainingSec = Math.max(0, MISSION_TARGET - liveWatched);
  const remainingMMSS = useMemo(() => toMMSS(remainingSec), [remainingSec]);
  const durationMMSS = useMemo(
    () => (duration ? toMMSS(duration) : '0:00'),
    [duration]
  );

  const startRafTick = useCallback(() => {
    if (rafRef.current) return;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      forceTick((v) => v + 1);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);
  const stopRafTick = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const safeGetCurrentTime = (player: any): number => {
    try {
      const v =
        player?.getCurrentTime?.() ??
        playerRef.current?.getCurrentTime?.() ??
        0;
      return Number.isFinite(v) ? v : 0;
    } catch {
      return 0;
    }
  };
  const safeGetDuration = (player: any): number | null => {
    try {
      const v =
        player?.getDuration?.() ?? playerRef.current?.getDuration?.() ?? null;
      return Number.isFinite(v) ? Math.floor(v) : null;
    } catch {
      return null;
    }
  };

  const finishOnce = useCallback(() => {
    const didComplete = completeOnce();
    if (!didComplete) return;

    if (!hasSavedRef.current && !saving) {
      hasSavedRef.current = true;
      saveMission();
    }

    alert('오늘의 영상 시청 미션을 성공하셨습니다');
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1600);
  }, [completeOnce, saveMission, saving]);

  const startWatchdog = useCallback(() => {
    if (watchdogRef.current) return;
    if (useVideoStore.getState().isCompleted) return;

    watchdogRef.current = setInterval(() => {
      if (useVideoStore.getState().isCompleted) {
        clearInterval(watchdogRef.current!);
        watchdogRef.current = null;
        return;
      }
      const diff = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;
      const total = useVideoStore.getState().watchedSeconds + diff;
      if (total >= MISSION_TARGET) {
        finishOnce();
        clearInterval(watchdogRef.current!);
        watchdogRef.current = null;
      }
    }, 800);
  }, [finishOnce]);

  const stopWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const initPlayer = useCallback(() => {
    const YT = (window as any).YT;
    if (!YT?.Player || !containerRef.current) return;

    playerRef.current = new YT.Player(containerRef.current, {
      videoId,
      host: 'https://www.youtube.com',
      playerVars: {
        playsinline: 1,
        modestbranding: 1,
        rel: 0,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (e: any) => {
          const dur = safeGetDuration(e.target);
          if (dur !== null) setDuration(dur);
          if (lastTime) e.target.seekTo(lastTime, true);
        },
        onStateChange: (e: any) => {
          const S = window.YT.PlayerState;
          if (e.data === S.PLAYING) {
            if (useVideoStore.getState().isCompleted) return;

            if (!startTimeRef.current) startTimeRef.current = Date.now();
            startWatchdog();
            startRafTick();
          } else if (e.data === S.PAUSED || e.data === S.ENDED) {
            if (!useVideoStore.getState().isCompleted && startTimeRef.current) {
              const diff = Math.floor(
                (Date.now() - startTimeRef.current) / 1000
              );
              if (diff > 0) setWatchedSeconds(diff);
              setLastTime(safeGetCurrentTime(e.target));
            }
            startTimeRef.current = null;
            stopWatchdog();
            stopRafTick();
          }
        },
      },
    });
  }, [
    lastTime,
    setDuration,
    setLastTime,
    setWatchedSeconds,
    startRafTick,
    startWatchdog,
    stopRafTick,
    stopWatchdog,
    videoId,
  ]);

  useEffect(() => {
    if (window.YT?.Player) initPlayer();
    else {
      if (
        !document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        )
      ) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }
    return () => {
      if (startTimeRef.current) {
        const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (diff > 0 && !useVideoStore.getState().isCompleted)
          setWatchedSeconds(diff);
        startTimeRef.current = null;
      }
      stopWatchdog();
      stopRafTick();
    };
  }, [initPlayer, setWatchedSeconds, stopRafTick, stopWatchdog]);

  const tone = useMemo(() => {
    if (isCompleted || progress >= 100) {
      return {
        chip: 'bg-emerald-600 text-white',
        icon: 'text-white',
        animated: false,
        label: '성공',
      };
    }
    if (progress >= 30) {
      return {
        chip: 'bg-blue-100 text-blue-700',
        icon: 'text-blue-500',
        animated: true,
        label: '진행중',
      };
    }
    return {
      chip: 'bg-gray-100 text-gray-700',
      icon: 'text-gray-500',
      animated: true,
      label: '진행중',
    };
  }, [isCompleted, progress]);

  return (
    <>
      <div>
        <h3 className='text-base font-semibold mb-2 tracking-tight'>
          오늘의 영상
        </h3>
        <p className='text-sm text-muted-foreground mb-1.5'>
          오늘의 키워드를 확인하고, 영상을 60초 이상 시청해 미션을 완료하세요.
        </p>
      </div>

      <Card className='relative w-full overflow-hidden border-0 shadow-lg'>
        <ConfettiBurst show={confetti} />

        <CardHeader className='pt-1 pb-0'>
          <div className='flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs'>
            <div className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-gray-700'>
              {keywordIconSrc ? (
                <img
                  src={keywordIconSrc}
                  alt='keyword'
                  className='h-4 w-4 rounded-sm object-cover'
                />
              ) : (
                <Tag className='h-4 w-4 text-purple-500' />
              )}
              <span>{todaysKeyword.name}</span>
            </div>

            {isCompleted || progress >= 100 ? (
              <motion.span
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tone.chip}`}
              >
                <CheckCircle2 className={`h-4 w-4 ${tone.icon}`} />
                성공
              </motion.span>
            ) : (
              <motion.span
                animate={tone.animated ? { opacity: [0.7, 1, 0.7] } : undefined}
                transition={
                  tone.animated
                    ? { duration: 1.6, repeat: Infinity }
                    : undefined
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${tone.chip}`}
              >
                <Clock className={`h-4 w-4 ${tone.icon}`} />
                {tone.label}
              </motion.span>
            )}

            <div className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-gray-700'>
              <Award className='h-4 w-4 text-amber-500' />
              <span>미션: {MISSION_TARGET}s</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-2 pb-2'>
          <div className='relative aspect-video overflow-hidden rounded-2xl ring-1 ring-black/5'>
            <div ref={containerRef} className='h-full w-full' />
          </div>
        </CardContent>

        <CardFooter className='flex flex-col gap-2 pt-2'>
          <div className='flex items-center justify-between text-xs text-gray-500'>
            <span>진행률 {progress}%</span>
          </div>
          <Progress value={progress} aria-label='미션 진행률' className='h-2' />

          <div className='flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-700'>
            <div className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1'>
              <Clock className='h-4 w-4 text-blue-500' />
              남은 시간: {remainingMMSS}
            </div>
            <div className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1'>
              <Film className='h-4 w-4 text-pink-500' />
              영상 길이: {durationMMSS}
            </div>
          </div>

          {!isCompleted && (
            <p className='text-[11px] text-muted-foreground'>
              60초 달성 시 자동으로 완료 처리돼요.
            </p>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
