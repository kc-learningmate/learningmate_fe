import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/querykeys';
import {
  fetchMyReviews,
  type MyReviewsParams,
} from '@/features/my/api/myReviews';
import type { ReviewListPageResponse } from '@/features/reviews/types/types';

export type InfiniteMyReviewsResult = UseInfiniteQueryResult<
  InfiniteData<ReviewListPageResponse, number>,
  Error
>;
export type MyReviewSort = 'latest' | 'liked';

function hasNext(p: any) {
  return Boolean(p?.hasNext ?? p?.hasNextPage ?? p?.pageInfo?.hasNext);
}

function nextPageFrom(p: any, lastPageParam: unknown) {
  const direct = p?.nextPage ?? p?.pageInfo?.next ?? p?.pageInfo?.nextPage;
  if (typeof direct === 'number') return direct;
  if (typeof lastPageParam === 'number') return lastPageParam + 1;
  if (typeof p?.page === 'number') return p.page + 1;
  return undefined;
}

export function useInfiniteMyReviews(
  sort: MyReviewSort = 'latest',
  size = 10
): InfiniteMyReviewsResult {
  return useInfiniteQuery<
    ReviewListPageResponse,
    Error,
    InfiniteData<ReviewListPageResponse, number>,
    QueryKey,
    number
  >({
    queryKey: [QUERY_KEYS.REVIEWS, 'me', { sort, size }],
    queryFn: ({ pageParam = 0 }) =>
      fetchMyReviews({ page: pageParam, size, sort } as MyReviewsParams),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      hasNext(lastPage) ? nextPageFrom(lastPage, lastPageParam) : undefined,

    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
}
