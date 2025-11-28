import { useMemo } from 'react';
import type { IncorrectQuizItem } from '@/features/my/types/quiz';
import * as Accordion from '@radix-ui/react-accordion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Newspaper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ArticleDetailDialog from '@/features/articles/components/ArticleDetailDialog';

type Props = {
  item: IncorrectQuizItem;
  value: string;
  onScrapChange?: (articleId: number, next: boolean) => void;
};

export default function IncorrectQuizItem({
  item,
  value,
  onScrapChange,
}: Props) {
  const options = useMemo(
    () =>
      [item.question1, item.question2, item.question3, item.question4].filter(
        Boolean
      ) as string[],
    [item]
  );

  const correctIdx = Number(item.answer) - 1;
  const myIdx = Number(item.memberAnswer) - 1;
  const isCorrectAll = item.answer === item.memberAnswer;

  return (
    <Accordion.Item value={value} className='rounded-xl border bg-white'>
      <Accordion.Header asChild>
        <Accordion.Trigger
          className='
            flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition
            hover:bg-zinc-50 data-[state=open]:bg-zinc-50
            [&[data-state=open]>svg.chev]:rotate-180
          '
        >
          <span className='shrink-0'>
            {isCorrectAll ? (
              <CheckCircle2 className='h-5 w-5 text-emerald-500' />
            ) : (
              <XCircle className='h-5 w-5 text-rose-500' />
            )}
          </span>

          <span className='min-w-0 flex-1 truncate font-semibold'>
            {item.article.title}
          </span>

          <span className='hidden sm:inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] text-yellow-800'>
            <Newspaper className='h-3.5 w-3.5' />
            {item.article.keyword?.name ?? '키워드'}
          </span>

          {item.article.keyword?.date && (
            <span className='ml-2 text-[11px] text-zinc-500'>
              {format(new Date(item.article.keyword.date), 'yyyy-MM-dd (E)', {
                locale: ko,
              })}
            </span>
          )}

          <svg
            className='chev ml-2 h-4 w-4 transition-transform'
            viewBox='0 0 24 24'
            fill='none'
          >
            <path
              d='M6 9l6 6 6-6'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content
        className='
          px-3 pb-3 transition-all duration-300 ease-out
          data-[state=closed]:-translate-y-1 data-[state=open]:translate-y-0
          data-[state=closed]:opacity-0 data-[state=open]:opacity-100
        '
      >
        <div className='rounded-xl border bg-white p-4 shadow-sm'>
          <div className='mb-3 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800'>
            <div className='font-semibold text-yellow-900'>
              {item.article.keyword?.name ?? '키워드'}
            </div>
            <div className='text-xs text-yellow-800/80'>
              {item.article.keyword?.description ?? '키워드 설명'}
            </div>
          </div>

          <p className='mt-1 text-[15px] leading-6 text-zinc-800'>
            <span className='mr-1 font-extrabold'>Q.</span>
            <span className='font-medium'>{item.description}</span>
          </p>

          <ul className='mt-3 grid gap-2 sm:grid-cols-2'>
            {options.map((opt, i) => {
              const isCorrect = i === correctIdx;
              const isMine = i === myIdx;

              let cls =
                'flex items-start gap-2 rounded-xl border px-3 py-2 text-sm';
              if (isCorrect) cls += ' border-emerald-500 bg-emerald-50';
              else if (isMine) cls += ' border-rose-400 bg-rose-50';
              else cls += ' border-zinc-200';

              return (
                <li key={i} className={cls}>
                  <span className='mt-0.5 inline-grid h-5 w-5 place-items-center rounded-full bg-zinc-100 text-[11px] text-zinc-600'>
                    {i + 1}
                  </span>
                  <span className='min-w-0 flex-1'>{opt}</span>
                  {isCorrect && (
                    <span className='inline-flex items-center gap-1 text-xs font-medium text-emerald-600'>
                      <CheckCircle2 className='h-4 w-4' /> 정답
                    </span>
                  )}
                  {isMine && !isCorrect && (
                    <span className='inline-flex items-center gap-1 text-xs font-medium text-rose-600'>
                      <XCircle className='h-4 w-4' /> 내 답
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className='mt-3 rounded-xl bg-zinc-50 p-3 text-sm leading-6 text-zinc-700'>
            <span className='inline-flex items-center gap-1 font-semibold'>
              <BookOpen className='h-4 w-4' /> 해설
            </span>
            <p className='mt-1'>{item.explanation}</p>
          </div>

          <div className='mt-3'>
            <ArticleDetailDialog
              articleId={item.article.id}
              onScrapChange={onScrapChange}
              trigger={
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7 px-2 text-xs'
                >
                  기사 바로가기 <ExternalLink className='ml-1 h-4 w-4' />
                </Button>
              }
            />
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
