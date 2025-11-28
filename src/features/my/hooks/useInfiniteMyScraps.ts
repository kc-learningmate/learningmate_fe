import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { fetchMyScraps, type MyScrapSort } from '@/features/my/api/scraps';
import type { ScrapPage } from '@/features/my/types/scraps';

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

export type InfiniteScrapsResult = UseInfiniteQueryResult<
  InfiniteData<ScrapPage, number>,
  Error
>;

export function useInfiniteMyScraps(
  size = 12,
  sort: MyScrapSort = 'latest'
): InfiniteScrapsResult {
  return useInfiniteQuery<
    ScrapPage,
    Error,
    InfiniteData<ScrapPage, number>,
    QueryKey,
    number
  >({
    queryKey: ['my', 'scraps', { size, sort }],
    queryFn: ({ pageParam = 0 }) => fetchMyScraps(pageParam, size, sort),
    initialPageParam: 0,
    getNextPageParam: (last, _pages, lastParam) =>
      hasNext(last) ? nextPageFrom(last, lastParam) : undefined,

    refetchOnMount: 'always',
    staleTime: 0,
  });
}
