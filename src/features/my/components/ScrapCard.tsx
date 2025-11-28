import { useMemo } from 'react';
import { Bookmark, BookmarkCheck, CalendarDays, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ScrapItem } from '@/features/my/types/scraps';
import { Button } from '@/components/ui/button';
import ArticleDetailDialog from '@/features/articles/components/ArticleDetailDialog';

type Props = {
  item: ScrapItem;
  onToggleScrap: (id: number, next: boolean) => void;
};

export default function ScrapCard({ item, onToggleScrap }: Props) {
  const dateLabel = useMemo(() => {
    const raw = (item as any).publishedAt ?? item.date;
    if (!raw) return '';
    return format(new Date(raw), 'yyyy.MM.dd.', { locale: ko });
  }, [item]);

  const scrapped = Boolean(item.scrappedByMe);

  return (
    <article className='rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md'>
      <h2 className='line-clamp-2 text-lg font-bold leading-snug'>
        {item.title}
      </h2>

      <div className='mt-1 flex items-center gap-4 text-sm text-zinc-600'>
        {dateLabel && (
          <span className='inline-flex items-center gap-1.5 leading-none'>
            <CalendarDays className='h-4 w-4 translate-y-[1px] text-zinc-500' />
            {dateLabel}
          </span>
        )}
        <span className='inline-flex items-center gap-1.5 leading-none'>
          <Eye className='h-4 w-4 translate-y-[1px] text-zinc-500' />
          {item.views ?? 0}
        </span>
        <span className='inline-flex items-center gap-1.5 leading-none'>
          <Bookmark className='h-4 w-4 translate-y-[1px] text-zinc-500' />
          {item.scrapCount ?? 0}
        </span>
      </div>

      {item.content && (
        <p className='mt-3 line-clamp-3 whitespace-pre-line text-sm text-zinc-700'>
          {item.content}
        </p>
      )}

      <div className='mt-4 flex items-center justify-between'>
        <ArticleDetailDialog
          articleId={item.id}
          onScrapChange={onToggleScrap}
          trigger={
            <Button variant='outline' size='sm' className='h-8'>
              더보기
            </Button>
          }
        />

        <button
          onClick={() => onToggleScrap(item.id, !scrapped)}
          aria-pressed={scrapped}
          className='inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-zinc-50'
        >
          {scrapped ? (
            <BookmarkCheck className='h-4 w-4 text-yellow-500' />
          ) : (
            <Bookmark className='h-4 w-4 text-zinc-500' />
          )}
          {scrapped ? '스크랩됨' : '스크랩'}
        </button>
      </div>
    </article>
  );
}
