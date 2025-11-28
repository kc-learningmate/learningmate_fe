import ReviewCard from '@/components/ui/ReviewCard';
import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/context/useSession';
import { useToggleReviewLike } from '@/features/reviews/hooks/useToggleReviewLike';
import type {
  ReviewListItem,
  ReviewListPageResponse,
} from '@/features/reviews/types/types';
import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const MOBILE_BREAKPOINT = 768;
const THROTTLE_DELAY = 500;

type ReviewListQuery = UseInfiniteQueryResult<
  InfiniteData<ReviewListPageResponse, number>,
  Error
>;

type ReviewListProps = {
  title?: string;
  query: ReviewListQuery;
  queryKey?: QueryKey;
  extraKeys?: QueryKey[];
  excludeMine?: boolean;
};

export default function ReviewList({
  title,
  query,
  queryKey,
  extraKeys = [],
  excludeMine = true,
}: ReviewListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage: _hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = query;

  const session = useSession();
  const myId = session?.member?.id;

  const keys = useMemo<QueryKey[]>(
    () => (queryKey ? [queryKey, ...extraKeys] : [...extraKeys]),
    [queryKey, extraKeys]
  );

  const toggleLike = useToggleReviewLike(keys);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const throttleRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const hasNextPage = Boolean(_hasNextPage);

  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return;

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

    observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [isMobile, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const pages = Array.isArray(data?.pages) ? data.pages : [];
  const allReviews: ReviewListItem[] = useMemo(
    () => pages.flatMap((pg) => pg.items),
    [pages]
  );

  const displayedReviews: ReviewListItem[] = useMemo(() => {
    if (!excludeMine || typeof myId !== 'number') return allReviews;
    return allReviews.filter((r) => r.memberId == null || r.memberId !== myId);
  }, [allReviews, excludeMine, myId]);

  const isPending = isLoading || isFetchingNextPage;

  const handleToggle = useCallback(
    (r: ReviewListItem) => {
      setPendingId(r.id);
      toggleLike.mutate(
        { reviewId: r.id, currentLiked: r.likedByMe },
        { onSettled: () => setPendingId(null) }
      );
    },
    [toggleLike]
  );

  if (isError) {
    const msg = error?.message ?? '알 수 없는 오류가 발생했습니다.';
    return <div role='alert'>Error: {msg}</div>;
  }

  return (
    <article className='w-full'>
      {!!title && (
        <aside className='mb-2'>
          <div>
            <h3 className='text-base font-semibold mb-2 tracking-tight'>
              {title}
            </h3>
            <p className='text-sm text-muted-foreground mb-1.5'>
              다른 사용자들의 후기를 확인하고 경험을 공유해보세요.
            </p>
          </div>
        </aside>
      )}

      <section className='flex flex-col gap-4'>
        {displayedReviews.length === 0 && isPending ? (
          <div>Loading...</div>
        ) : (
          displayedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onToggleLike={() => handleToggle(review)}
              likeIsLoading={pendingId === review.id && toggleLike.isPending}
            />
          ))
        )}

        <div
          ref={loadMoreRef}
          className='my-3 flex justify-center items-center'
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

          {!hasNextPage && displayedReviews.length > 0 && (
            <span className='text-gray-400 ml-2'>마지막 리뷰입니다.</span>
          )}
        </div>
      </section>
    </article>
  );
}
