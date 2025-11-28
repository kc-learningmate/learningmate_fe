import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QUERY_KEYS } from '@/constants/querykeys';
import { useArticlePreviewsQuery } from '@/features/articles/hooks/useArticlePreviewsQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, PlusIcon, RotateCcwIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createArticle, fetchBatchJobState } from '../api/api';
import type { JobState } from '../types/types';
import ArticleItem from './ArticleItem';

type Props = {
  keywordId: number;
};

const getBatchJobKey = (keywordId: number) => `BATCH_JOBS:${keywordId}`;

export default function ArticleSection({ keywordId }: Props) {
  const queryClient = useQueryClient();
  const { isPending, isError, data } = useArticlePreviewsQuery(keywordId);
  const [jobState, setJobState] = useState<JobState>('unknown');
  const [pollingError, setPollingError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationKey: [QUERY_KEYS.ARTICLE, { action: 'create' }],
    mutationFn: async (keywordId: number) => createArticle(keywordId),
    onSuccess: async (job) => {
      localStorage.setItem(getBatchJobKey(keywordId), job.jobId);
    },
  });

  const handleCreateArticle = () => {
    setJobState('active');
    setPollingError(null);
    mutation.mutate(keywordId);
  };

  const handleRetryPolling = () => {
    setPollingError(null);
    setJobState('active');
  };

  useEffect(() => {
    setJobState('unknown');
    setPollingError(null);
  }, [keywordId]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const batchJobKey = getBatchJobKey(keywordId);

    const existingJobId = localStorage.getItem(batchJobKey);
    if (existingJobId && jobState === 'unknown') {
      setJobState('active');
    }

    if (jobState === 'active') {
      intervalId = setInterval(async () => {
        const jobId = localStorage.getItem(batchJobKey);

        if (!jobId) {
          setJobState('unknown');
          return;
        }

        try {
          const { state: currJobState } = await fetchBatchJobState(jobId);
          console.log('🚀 ~ ArticleSection ~ currJobState:', currJobState);

          if (currJobState === 'completed') {
            localStorage.removeItem(batchJobKey);
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.ARTICLE_PREVIEWS],
            });
            setJobState(currJobState);
            return;
          }

          if (currJobState === 'failed') {
            localStorage.removeItem(batchJobKey);
            setJobState(currJobState);
            setPollingError(
              'Article 생성 상태를 확인하는 중 오류가 발생했습니다.'
            );
            return;
          }
        } catch (error) {
          console.error('Failed to fetch job state:', error);
          setPollingError(
            'Article 생성 상태를 확인하는 중 오류가 발생했습니다.'
          );
          setJobState('unknown');
        }
      }, 10000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobState, queryClient, keywordId]);

  if (isPending) {
    return <ArticleSectionSkeleton />;
  }

  if (isError) {
    return <ArticleSectionError />;
  }

  return (
    <section className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-2'>
          <h2 className='text-3xl font-bold tracking-tight'>Articles</h2>
          <p className='text-sm text-muted-foreground'>
            키워드와 관련된 Article을 관리할 수 있습니다
          </p>
        </div>
        <Button
          type='button'
          variant={'secondary'}
          disabled={
            data.length !== 0 || jobState === 'active' || mutation.isPending
          }
          onClick={handleCreateArticle}
          className='font-semibold shadow-sm hover:shadow transition-all duration-200 shrink-0'
        >
          <PlusIcon className='w-4 h-4' /> Add new Article
        </Button>
      </div>
      {data.length === 0 ? (
        pollingError ? (
          <ArticlePollingError
            message={pollingError}
            onRetry={handleRetryPolling}
          />
        ) : jobState === 'active' ? (
          <ArticleCreatingLoader />
        ) : (
          <div className='flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-muted rounded-lg bg-muted/5'>
            <p className='text-muted-foreground'>등록된 Article이 없습니다.</p>
          </div>
        )
      ) : (
        <ul className='space-y-3'>
          {data.map((article) => (
            <li
              key={article.id}
              className='border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20'
            >
              <ArticleItem
                keywordId={keywordId}
                articleId={article.id}
                title={article.title}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ArticleSectionSkeleton() {
  return (
    <section className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-2'>
          <h2 className='text-3xl font-bold tracking-tight'>Articles</h2>
          <p className='text-sm text-muted-foreground'>
            키워드와 관련된 Article을 관리할 수 있습니다
          </p>
        </div>
        <Button
          type='button'
          variant={'secondary'}
          disabled
          className='font-semibold shrink-0'
        >
          <PlusIcon className='w-4 h-4' /> Add new Article
        </Button>
      </div>
      <ul className='space-y-3'>
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index}>
            <Skeleton className='h-16 w-full rounded-lg' />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArticleSectionError() {
  return (
    <section className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-2'>
          <h2 className='text-3xl font-bold tracking-tight'>Articles</h2>
          <p className='text-sm text-muted-foreground'>
            키워드와 관련된 Article을 관리할 수 있습니다
          </p>
        </div>
        <Button
          type='button'
          variant={'secondary'}
          disabled
          className='font-semibold shrink-0'
        >
          <PlusIcon className='w-4 h-4' /> Add new Article
        </Button>
      </div>
      <div className='flex flex-col items-center justify-center py-16 px-4 border border-destructive/20 rounded-lg bg-destructive/5'>
        <AlertCircle className='w-10 h-10 text-destructive mb-3' />
        <p className='text-destructive font-medium'>
          예상치 못한 에러가 발생했습니다.
        </p>
      </div>
    </section>
  );
}

function ArticleCreatingLoader() {
  return (
    <div className='space-y-4 border rounded-lg p-6 bg-muted/5'>
      <div className='flex items-center justify-center gap-2 text-muted-foreground'>
        <div className='w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin' />
        <span className='font-medium'>Article을 생성하고 있습니다...</span>
      </div>
      <ul className='space-y-3'>
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index}>
            <Skeleton className='h-16 w-full rounded-lg' />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArticlePollingError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center space-y-4 py-12 px-6 border border-destructive/20 rounded-lg bg-destructive/5 shadow-sm'>
      <div className='flex justify-center'>
        <AlertCircle className='w-12 h-12 text-destructive' />
      </div>
      <p className='text-destructive font-medium text-center'>{message}</p>
      <Button
        type='button'
        variant={'primary_semibold'}
        onClick={onRetry}
        className='shadow-sm hover:shadow transition-all duration-200'
      >
        재시도 <RotateCcwIcon strokeWidth={3} className='w-4 h-4' />
      </Button>
    </div>
  );
}
