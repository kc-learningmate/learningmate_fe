import { memo, useState, useRef, useEffect } from 'react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFormattedDate } from '@/features/reviews/hooks/useFormattedDate';
import type { ReviewListItem } from '@/features/reviews/types/types';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  review: ReviewListItem;
  onToggleLike?: () => void;
  likeIsLoading?: boolean;
  likeReadOnly?: boolean;
};

function ReviewCardImpl({
  review,
  onToggleLike,
  likeIsLoading,
  likeReadOnly = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLParagraphElement | null>(null);

  const nickname = review.nickname || '알 수 없는 사용자';
  const dateStr = review.updatedAt ?? review.createdAt ?? '';
  const formatted = useFormattedDate(dateStr, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: '2-digit',
    hour12: false,
  });

  const liked = likeReadOnly ? true : !!review.likedByMe;
  const likeCount = review.likeCount ?? 0;
  const idBadgeBg = (review as any).imageColor ?? '#FDBA4D';

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (expanded) return;

    const rAF = requestAnimationFrame(() => {
      const overflowing = el.scrollHeight > el.clientHeight + 1;
      setIsOverflowing(overflowing);
    });
    return () => cancelAnimationFrame(rAF);
  }, [review.content1, expanded]);

  return (
    <article className='w-full max-w-full overflow-hidden'>
      <Card
        className='group relative w-full overflow-hidden border border-border/60 bg-background/60 backdrop-blur-[2px] transition-all duration-200 hover:shadow-lg hover:border-primary/30 focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-2'
        role='region'
        aria-label={`리뷰: ${review.title}`}
      >
        <div className='pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 to-primary/0 blur-2xl' />
        <CardHeader className='pb-1'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <div className='inline-flex items-center gap-2'>
                <span className='inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium bg-muted/60'>
                  #{review.id}
                </span>
                <span
                  className='inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-black/80'
                  style={{ backgroundColor: idBadgeBg }}
                >
                  <svg
                    className='h-3.5 w-3.5'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    aria-hidden
                  >
                    <path d='M20 21a8 8 0 1 0-16 0' />
                    <circle cx='12' cy='7' r='4' />
                  </svg>
                  <span className='truncate max-w-[14rem] md:max-w-[20rem]'>
                    {nickname}
                  </span>
                </span>
              </div>

              <CardTitle>
                <h2 className='mt-1 text-base md:text-lg font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary'>
                  {review.title}
                </h2>
              </CardTitle>

              <CardDescription className='mt-1 flex items-center gap-2 text-xs text-muted-foreground md:text-[13px]'>
                <svg
                  className='h-3.5 w-3.5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden
                >
                  <circle cx='12' cy='12' r='10' />
                  <polyline points='12 6 12 12 16 14' />
                </svg>
                <span>{formatted}</span>
              </CardDescription>
            </div>

            <figure className='shrink-0 pt-1'>
              <Avatar className='h-14 w-14 rounded-full shadow-sm'>
                <AvatarImage
                  src={review.imageUrl ?? 'https://github.com/shadcn.png'}
                  alt={`${nickname} 프로필 이미지`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://github.com/shadcn.png';
                  }}
                />
              </Avatar>
            </figure>
          </div>
        </CardHeader>

        <div className='mx-6 h-px bg-border/80' />

        <CardContent className='px-6 pt-3 pb-4'>
          <p
            ref={contentRef}
            id={`review-content-${review.id}`}
            className={[
              'text-sm leading-relaxed whitespace-pre-wrap break-words text-muted-foreground transition-all',
              expanded ? 'line-clamp-none' : 'line-clamp-5',
            ].join(' ')}
          >
            {review.content1}
          </p>

          {isOverflowing && (
            <button
              type='button'
              aria-expanded={expanded}
              aria-controls={`review-content-${review.id}`}
              aria-label={expanded ? '간략히 보기' : '자세히 보기'}
              onClick={() => setExpanded((v) => !v)}
              className='mt-3 inline-flex items-center gap-1 text-sm font-medium opacity-90 transition-opacity hover:opacity-100'
            >
              <span className='underline underline-offset-4'>
                {expanded ? '간략히' : '자세히'}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${
                  expanded ? 'rotate-180' : ''
                }`}
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden
              >
                <polyline points='6 9 12 15 18 9' />
              </svg>
            </button>
          )}
        </CardContent>

        <CardFooter className='px-6 pt-0 pb-4'>
          <div className='mt-1 flex w-full items-center border-t pt-3'>
            <span className='relative inline-grid h-8 w-8 place-items-center'>
              {likeReadOnly ? (
                <FaHeart className='text-xl drop-shadow-sm' color='#FF2D55' />
              ) : (
                <>
                  <AnimatePresence initial={false}>
                    {liked && (
                      <motion.span
                        key='burst'
                        className='pointer-events-none absolute inset-0 rounded-full border-2 border-rose-400/70'
                        initial={{ scale: 0, opacity: 0.7 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.button
                    type='button'
                    onClick={onToggleLike}
                    disabled={likeIsLoading}
                    aria-pressed={liked}
                    aria-label={liked ? '좋아요 취소' : '좋아요'}
                    className='grid h-8 w-8 place-items-center rounded-full transition-transform disabled:cursor-not-allowed disabled:opacity-60 active:scale-95'
                    initial={false}
                    whileTap={{ scale: 0.95 }}
                  >
                    {liked ? (
                      <FaHeart
                        className='text-xl drop-shadow-sm'
                        color='#FF2D55'
                      />
                    ) : (
                      <FaRegHeart className='text-xl text-muted-foreground' />
                    )}
                  </motion.button>
                </>
              )}
            </span>

            <span className='ml-2 select-none text-sm' aria-live='polite'>
              {likeCount}
            </span>
          </div>
        </CardFooter>
      </Card>
    </article>
  );
}

export default memo(ReviewCardImpl, (prev, next) => {
  const a = prev.review;
  const b = next.review;
  return (
    a.id === b.id &&
    a.content1 === b.content1 &&
    a.likedByMe === b.likedByMe &&
    a.likeCount === b.likeCount &&
    prev.likeIsLoading === next.likeIsLoading &&
    prev.likeReadOnly === next.likeReadOnly
  );
});
