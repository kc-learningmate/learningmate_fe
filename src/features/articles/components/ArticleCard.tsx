import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ROUTE_PATHS } from '@/constants/routepaths';
import { useFormattedDate } from '@/features/reviews/hooks/useFormattedDate';
import { Link } from 'react-router';
import type { ArticlePreview } from '../types/types';
import type { Keyword } from '@/features/keywords/types/types';

type Props = {
  articlePreview: ArticlePreview;
  keyword: Keyword;
};

export default function ArticleCard({ articlePreview, keyword }: Props) {
  const date = useFormattedDate(articlePreview.publishedAt, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <article className='w-full'>
      <Link
        to={ROUTE_PATHS.ARTICLE_DETAIL(articlePreview.id)}
        aria-label={`Open article: ${articlePreview.title}`}
        className='group block focus:outline-none'
      >
        <Card className='relative overflow-hidden border border-border/60 transition-all duration-200 hover:shadow-lg hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 bg-background/60'>
          <div className='pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 to-primary/0 blur-2xl' />

          <CardHeader className='gap-2'>
            <div className='inline-flex max-w-full items-center gap-2'>
              <span className='inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium text-foreground/90 bg-muted/60'>
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
                  <path d='M19 20H5a2 2 0 0 1-2-2V7' />
                  <path d='M19 20a2 2 0 0 0 2-2V5H7v13' />
                  <path d='M3 7h4' />
                  <path d='M7 7v13' />
                  <path d='M11 10h6' />
                  <path d='M11 14h6' />
                </svg>
                {keyword.name}
              </span>
            </div>

            <CardTitle>
              <h2 className='text-base md:text-lg font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary'>
                {articlePreview.title}
              </h2>
            </CardTitle>

            <CardDescription className='mt-1 flex items-center gap-2 text-xs md:text-[13px] text-muted-foreground'>
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
              <span>{date}</span>
            </CardDescription>
          </CardHeader>

          <div className='mx-6 h-px bg-border/80' />

          <CardContent className='px-6 py-4 text-sm leading-relaxed'>
            <p className='line-clamp-3 text-muted-foreground'>
              {articlePreview.content}
            </p>

            <div className='mt-3 inline-flex items-center gap-1 text-sm font-medium opacity-90 group-hover:opacity-100'>
              <span className='underline underline-offset-4'>Read more</span>
              <svg
                className='h-4 w-4 transition-transform group-hover:translate-x-0.5'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden
              >
                <path d='M9 18l6-6-6-6' />
              </svg>
            </div>
          </CardContent>
        </Card>
      </Link>
    </article>
  );
}
