import ReviewCard from '@/components/ui/ReviewCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SectionHeader from '@/features/my/components/SectionHeader';
import {
  useInfiniteMyReviews,
  type MyReviewSort,
} from '@/features/my/hooks/useInfiniteMyReviews';
import type { ReviewListItem } from '@/features/reviews/types/types';
import { Check, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TOKENS } from '../config/pageMeta';

const PAGE_SIZE = 10;
const MOBILE_BREAKPOINT = 768;
const THROTTLE_DELAY = 500;

export default function MyReview() {
  const [sortUI, setSortUI] = useState<MyReviewSort>('latest');
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteMyReviews(sortUI, PAGE_SIZE);

  const pages = Array.isArray(data?.pages) ? data.pages : [];
  const items: ReviewListItem[] = useMemo(
    () => pages.flatMap((pg) => pg.items || []),
    [pages]
  );

  const [isMobile, setIsMobile] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const throttleRef = useRef(false);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !throttleRef.current
        ) {
          throttleRef.current = true;
          fetchNextPage().finally(() => {
            setTimeout(() => {
              throttleRef.current = false;
            }, THROTTLE_DELAY);
          });
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [isMobile, fetchNextPage, hasNextPage, isFetchingNextPage, sortUI]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [sortUI]);

  if (isError) {
    return (
      <div
        role='alert'
        className='rounded-xl border border-red-200 bg-red-50 p-3 text-red-600'
      >
        {error?.message ?? '내 리뷰를 불러오지 못했어요.'}
      </div>
    );
  }

  const isPending = isLoading || isFetchingNextPage;

  return (
    <section className={TOKENS.sectionGapY}>
      <div className='flex items-center justify-between'>
        <SectionHeader page='review' />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              aria-label='정렬 선택'
              title='정렬 선택'
            >
              <SlidersHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-36'>
            <DropdownMenuRadioGroup
              value={sortUI}
              onValueChange={(v) => setSortUI(v as MyReviewSort)}
            >
              <DropdownMenuRadioItem
                value='latest'
                className='flex items-center justify-between'
              >
                최신순 {sortUI === 'latest' && <Check className='h-4 w-4' />}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value='liked'
                className='flex items-center justify-between'
              >
                공감순 {sortUI === 'liked' && <Check className='h-4 w-4' />}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='flex flex-col gap-4'>
        {items.length === 0 && isPending ? (
          <div>Loading...</div>
        ) : items.length === 0 ? (
          <div className='text-sm text-zinc-500'>작성한 리뷰가 없습니다.</div>
        ) : (
          items.map((review) => (
            <ReviewCard key={review.id} review={review} likeReadOnly />
          ))
        )}

        <div
          ref={loadMoreRef}
          className='my-3 flex items-center justify-center'
        >
          {isPending && <span className='mr-2'>Loading...</span>}
          {!isMobile && hasNextPage && (
            <Button
              className='w-32 cursor-pointer'
              onClick={() => fetchNextPage()}
              disabled={isPending}
            >
              더보기
            </Button>
          )}
          {!hasNextPage && items.length >= PAGE_SIZE && (
            <span className='ml-2 text-gray-400'>마지막 리뷰입니다.</span>
          )}
        </div>
      </div>
    </section>
  );
}
