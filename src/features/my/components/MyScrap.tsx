import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  deleteArticleScrap,
  postArticleScrap,
  type MyScrapSort,
} from '@/features/my/api/scraps';
import ScrapCard from '@/features/my/components/ScrapCard';
import SectionHeader from '@/features/my/components/SectionHeader';
import { useInfiniteMyScraps } from '@/features/my/hooks/useInfiniteMyScraps';
import type { ScrapItem } from '@/features/my/types/scraps';
import { TOKENS } from '../config/pageMeta';

const GRID_COLS = 'md:grid-cols-2';
const THROTTLE_MS = 400;

export default function MyScrap() {
  const size = 12;
  const [sort, setSort] = useState<MyScrapSort>('latest');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteMyScraps(size, sort);

  const pages = data?.pages ?? [];
  const items: ScrapItem[] = useMemo(
    () => pages.flatMap((p) => p.items ?? []),
    [pages]
  );

  const qc = useQueryClient();
  const queryKey = ['my', 'scraps', { size, sort }] as const;

  const toggleMutation = useMutation({
    mutationFn: async ({ id, next }: { id: number; next: boolean }) =>
      next ? postArticleScrap(id) : deleteArticleScrap(id),
    onMutate: async ({ id, next }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<any>(queryKey);
      const patched = prev && {
        ...prev,
        pages: prev.pages.map((pg: any) => ({
          ...pg,
          items: (pg.items ?? []).map((it: ScrapItem) =>
            it.id === id ? { ...it, scrappedByMe: next } : it
          ),
        })),
      };
      qc.setQueryData(queryKey, patched);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(queryKey, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const onToggleScrap = (id: number, next: boolean) =>
    toggleMutation.mutate({ id, next });

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const throttleRef = useRef(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !throttleRef.current
        ) {
          throttleRef.current = true;
          fetchNextPage().finally(() => {
            setTimeout(() => (throttleRef.current = false), THROTTLE_MS);
          });
        }
      },
      { root: null, rootMargin: '0px 0px 600px 0px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, sort]);

  if (isError) {
    return (
      <div
        role='alert'
        className='rounded-xl border border-red-200 bg-red-50 p-3 text-red-600'
      >
        {error.message}
      </div>
    );
  }

  return (
    <section className={TOKENS.sectionGapY}>
      <div className='flex items-center justify-between'>
        <SectionHeader page='scrap' />
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
          <DropdownMenuContent align='end' className='w-40'>
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(v) => setSort(v as MyScrapSort)}
            >
              <DropdownMenuRadioItem
                value='latest'
                className='flex items-center justify-between'
              >
                최신순 {sort === 'latest' && <Check className='h-4 w-4' />}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value='popular'
                className='flex items-center justify-between'
              >
                스크랩 많은 순{' '}
                {sort === 'popular' && <Check className='h-4 w-4' />}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading && (
        <div className='h-24 animate-pulse rounded-xl bg-zinc-100' />
      )}

      {!isLoading && items.length === 0 && (
        <div className='py-16 text-center text-sm text-zinc-500'>
          스크랩한 기사가 없습니다.
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className={`grid gap-4 ${GRID_COLS}`}>
            {items.map((it) => (
              <ScrapCard
                key={`${it.id}-${it.publishedAt ?? ''}`}
                item={it}
                onToggleScrap={onToggleScrap}
              />
            ))}
          </div>
          <div ref={sentinelRef} className='h-8 w-full' />
          <div className='mt-3 flex items-center justify-center gap-8 text-sm text-zinc-500'>
            {isFetchingNextPage && <span>Loading...</span>}
          </div>
        </>
      )}
    </section>
  );
}
