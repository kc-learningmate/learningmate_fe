import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSession } from '@/features/auth/context/useSession';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  CheckIcon,
  XIcon,
  ShieldCheck,
  AlarmClock,
  ListOrdered,
  HelpCircle,
  Loader2,
  ChevronRight,
  Trophy,
  PartyPopper,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { solveQuiz } from '../../api/api';
import { useQuizQuery } from '../../hooks/useQuizQuery';
import { type QuizChoiceArr, type QuizSolveResponse } from '../../types/types';

type Props = { isOpen: boolean; onClose: () => void };

export default function QuizModal({ isOpen, onClose }: Props) {
  const { member } = useSession();
  if (!member) return null;

  const memberId = member.id;
  const { articleId } = useParams();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [currentResult, setCurrentResult] = useState<QuizSolveResponse | null>(
    null
  );

  if (!articleId) return <div>ArticleID Error</div>;

  const { isPending, data = [], isError, error } = useQuizQuery(+articleId);

  if (isError) {
    const ax = error as AxiosError<any>;
    const msg = ax.response?.data?.message ?? ax.message ?? '알 수 없는 오류';
    return <div className='text-red-500'>{msg}</div>;
  }

  const baseKey = `quiz:${memberId}:${articleId}`;
  const progressKey = `${baseKey}:idx`;
  const finishedKey = `${baseKey}:finished`;

  const retryKey = `quizRetryUsed:v2:${memberId}:${articleId}`;

  useEffect(() => {
    try {
      localStorage.removeItem('quizRetryUsed');
      localStorage.removeItem(`quizRetryUsed:${memberId}`);
      const legacyPerArticle = localStorage.getItem(
        `quizRetryUsed:${memberId}:${articleId}`
      );
      if (legacyPerArticle === '1') {
        localStorage.setItem(retryKey, '1');
        localStorage.removeItem(`quizRetryUsed:${memberId}:${articleId}`);
      }
    } catch {}
  }, [memberId, articleId]);

  const quizzes: QuizChoiceArr[] = useMemo(() => {
    const list = data ?? [];
    return list.map((q) => ({
      id: q.id,
      description: q.description,
      choices: [q.question1, q.question2, q.question3, q.question4],
    }));
  }, [data]);

  const total = quizzes.length;

  const [idx, setIdx] = useState<number>(() => {
    try {
      const s = localStorage.getItem(progressKey);
      return s ? Math.max(0, parseInt(s, 10) || 0) : 0;
    } catch {
      return 0;
    }
  });

  const [finished, setFinished] = useState<boolean>(() => {
    try {
      return localStorage.getItem(finishedKey) === '1';
    } catch {
      return false;
    }
  });

  const [retryUsed, setRetryUsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(retryKey) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    try {
      const s = localStorage.getItem(progressKey);
      setIdx(s ? Math.max(0, parseInt(s, 10) || 0) : 0);
      setFinished(localStorage.getItem(finishedKey) === '1');
      setRetryUsed(localStorage.getItem(retryKey) === '1');
    } catch {}
  }, [isOpen, progressKey, finishedKey, retryKey]);

  const current = quizzes[idx];

  const solvedCount = idx + (currentResult ? 1 : 0);
  const progressPct = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

  const goNext = () => {
    if (idx === total - 1) {
      setFinished(true);
      try {
        localStorage.setItem(finishedKey, '1');
        localStorage.setItem(progressKey, String(total));
      } catch {}
      setSelectedChoice(null);
      setCurrentResult(null);
      return;
    }
    const next = idx + 1;
    setIdx(next);
    try {
      localStorage.setItem(progressKey, String(next));
    } catch {}
    setSelectedChoice(null);
    setCurrentResult(null);
  };

  const resetAll = () => {
    if (retryUsed) return;
    try {
      localStorage.setItem(retryKey, '1');
    } catch {}
    setRetryUsed(true);

    setIdx(0);
    setFinished(false);
    setSelectedChoice(null);
    setCurrentResult(null);
    try {
      localStorage.setItem(progressKey, '0');
      localStorage.removeItem(finishedKey);
    } catch {}
  };

  const solveMutation = useMutation({
    mutationFn: (choiceIdx: number) =>
      solveQuiz(
        {
          memberId: +memberId,
          memberAnswer: (choiceIdx + 1).toString(),
        },
        +articleId!,
        current.id
      ),
    onSuccess: (result) => {
      setCurrentResult({
        answer: result.answer,
        explanation: result.explanation,
        status: result.status,
      });
    },
    onError: () => alert('퀴즈 제출 중 오류가 발생했습니다.'),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen || !current || finished) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!currentResult) {
          if (selectedChoice == null) return;
          solveMutation.mutate(selectedChoice);
        } else {
          goNext();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, current, currentResult, selectedChoice, solveMutation, finished]);

  const isAnswered = Boolean(currentResult);
  const userCorrect = isAnswered && currentResult?.status === '정답';
  const correctIdx = isAnswered ? Number(currentResult!.answer) - 1 : -1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-xl md:max-w-2xl'>
        <DialogHeader className='space-y-1'>
          <DialogTitle className='flex items-center gap-2 text-xl font-extrabold'>
            <ShieldCheck className='h-5 w-5 text-amber-500' />
            실시간 퀴즈
          </DialogTitle>
          {!finished && (
            <DialogDescription className='flex items-center gap-3'>
              <span className='inline-flex items-center gap-1 text-zinc-600'>
                <AlarmClock className='h-4 w-4' />
                최근 기사 기반 학습
              </span>
              <span className='inline-flex items-center gap-1 text-zinc-600'>
                <ListOrdered className='h-4 w-4' />총 {total}문제
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        {!finished && (
          <div className='mt-1'>
            <div className='mb-1 flex items-center justify-between text-xs text-zinc-500'>
              <span>
                {Math.min(idx + 1, total)} / {total}
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-zinc-100'>
              <div
                className='h-full rounded-full bg-amber-400 transition-[width] duration-300'
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {isPending ? (
          <div className='flex h-32 items-center justify-center text-zinc-500'>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            로딩 중...
          </div>
        ) : finished ? (
          <div className='relative py-10'>
            <div className='pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(40%_40%_at_50%_0%,#f59e0b,transparent_70%)]' />
            <div className='relative flex flex-col items-center gap-4'>
              <div className='inline-flex items-center justify-center rounded-full bg-amber-100 p-4 shadow-inner'>
                <Trophy className='h-10 w-10 text-amber-500' />
              </div>
              <h3 className='text-xl font-extrabold tracking-tight'>
                모든 퀴즈를 다 푸셨습니다. 고생하셨어요!
              </h3>
              <p className='text-sm text-zinc-600 -mt-2'>
                🎉 꾸준함이 실력을 만듭니다. 다음 학습도 이어가볼까요?
              </p>

              <div className='mt-2 flex items-center gap-2'>
                <Button onClick={onClose} className='px-5'>
                  닫기
                </Button>
                {!retryUsed && (
                  <Button
                    variant='outline'
                    onClick={resetAll}
                    className='px-5'
                    title='처음부터 다시 풀기 (이 기사에서 1회)'
                  >
                    다시 풀기
                  </Button>
                )}
              </div>
            </div>

            <PartyPopper className='pointer-events-none absolute -left-2 top-2 h-5 w-5 rotate-12 text-amber-400 opacity-70' />
            <PartyPopper className='pointer-events-none absolute -right-2 top-2 h-5 w-5 -rotate-12 text-amber-400 opacity-70' />
          </div>
        ) : !current ? (
          <div className='py-10 text-center text-sm text-zinc-500'>
            퀴즈가 없습니다.
          </div>
        ) : (
          <div className='mt-4 space-y-4'>
            <div className='flex items-start gap-2'>
              <HelpCircle className='mt-0.5 h-5 w-5 shrink-0 text-amber-500' />
              <h3 className='text-lg font-bold leading-7'>
                {current.description}
              </h3>
            </div>

            <div className='grid gap-2'>
              {current.choices.map((c, i) => {
                const isSelected = selectedChoice === i;

                const showCorrect =
                  isAnswered && userCorrect && i === correctIdx;
                const showWrong = isAnswered && !userCorrect && isSelected;

                return (
                  <button
                    key={i}
                    type='button'
                    onClick={() => !isAnswered && setSelectedChoice(i)}
                    className={[
                      'group flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition',
                      isAnswered
                        ? showCorrect
                          ? 'border-emerald-400 bg-emerald-50'
                          : showWrong
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-zinc-200 bg-white opacity-70'
                        : isSelected
                          ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100'
                          : 'border-zinc-200 bg-white hover:border-amber-300 hover:bg-amber-50/40',
                    ].join(' ')}
                    aria-pressed={isSelected}
                    disabled={isAnswered}
                  >
                    <span
                      className={[
                        'grid h-6 w-6 place-items-center rounded-full text-xs font-semibold',
                        isAnswered
                          ? showCorrect
                            ? 'bg-emerald-500 text-white'
                            : showWrong
                              ? 'bg-rose-500 text-white'
                              : 'bg-zinc-200 text-zinc-600'
                          : isSelected
                            ? 'bg-amber-500 text-white'
                            : 'bg-zinc-200 text-zinc-600',
                      ].join(' ')}
                    >
                      {i + 1}
                    </span>

                    <span className='flex-1'>{c}</span>

                    {showCorrect && (
                      <span className='inline-flex items-center gap-1 text-xs font-medium text-emerald-600'>
                        <CheckIcon className='h-4 w-4' />
                        정답
                      </span>
                    )}
                    {showWrong && (
                      <span className='inline-flex items-center gap-1 text-xs font-medium text-rose-600'>
                        <XIcon className='h-4 w-4' />내 선택
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {currentResult && (
              <div className='space-y-3'>
                {currentResult.status === '정답' ? (
                  <div className='flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-700'>
                    <CheckIcon className='h-4 w-4' />
                    정답입니다!
                  </div>
                ) : (
                  <div className='flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700'>
                    <XIcon className='h-4 w-4' />
                    오답입니다.
                  </div>
                )}

                {currentResult.status === '정답' && (
                  <div className='rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm'>
                    <div className='mb-1 font-semibold'>해설</div>
                    <p className='whitespace-pre-wrap'>
                      {currentResult.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!isPending && !finished && (
          <DialogFooter className='mt-4'>
            {!currentResult ? (
              <Button
                onClick={() => {
                  if (selectedChoice == null) {
                    alert('답을 선택해주세요!');
                    return;
                  }
                  solveMutation.mutate(selectedChoice);
                }}
                disabled={solveMutation.isPending || !current}
                className='gap-2'
              >
                {solveMutation.isPending && (
                  <Loader2 className='h-4 w-4 animate-spin' />
                )}
                제출
              </Button>
            ) : (
              <Button onClick={goNext} className='gap-2'>
                {idx === total - 1 ? '다음' : '다음 문제'}
                <ChevronRight className='h-4 w-4' />
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
