import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { fetchIncorrectQuizzes } from '@/features/my/api/quiz';
import type { IncorrectQuizPage } from '@/features/my/types/quiz';

function getHasNext(p: any): boolean {
  return Boolean(
    p?.hasNext ??
      p?.hasNextPage ??
      p?.pageInfo?.hasNext ??
      p?.pageInfo?.hasNextPage ??
      false
  );
}
function getNextPage(p: any, lastPageParam: unknown): number | undefined {
  const direct =
    p?.nextPage ?? p?.pageInfo?.next ?? p?.pageInfo?.nextPage ?? undefined;

  if (typeof direct === 'number') return direct;

  if (typeof lastPageParam === 'number') return lastPageParam + 1;

  if (typeof p?.page === 'number') return p.page + 1;

  return undefined;
}

export type InfiniteIncorrectResult = UseInfiniteQueryResult<
  InfiniteData<IncorrectQuizPage, number>,
  Error
>;

export function useInfiniteIncorrectQuizzes(
  size = 10
): InfiniteIncorrectResult {
  return useInfiniteQuery<
    IncorrectQuizPage,
    Error,
    InfiniteData<IncorrectQuizPage, number>,
    QueryKey,
    number
  >({
    queryKey: ['my', 'quiz', 'incorrect', { size }],
    queryFn: ({ pageParam = 0 }) => fetchIncorrectQuizzes(pageParam, size),
    initialPageParam: 0,
    getNextPageParam: (last, _pages, lastPageParam) =>
      getHasNext(last) ? getNextPage(last, lastPageParam) : undefined,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
