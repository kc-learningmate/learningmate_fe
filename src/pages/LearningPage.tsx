import { Skeleton } from '@/components/ui/skeleton';
import ArticleList from '@/features/articles/components/AriticleList';
import TodaysKeywordCard from '@/features/keywords/components/TodaysKeywordCard';
import { useTodaysKeywordQuery } from '@/features/keywords/hooks/useTodaysKeywordQuery';
import ReviewListInLearning from '@/features/reviews/components/ReviewListInLearning';
import VideoPlayer from '@/features/videos/components/VideoPlayer';

import { useKeywordVideo } from '@/hooks/useKeywordVideo';

export default function LearningPage() {
  const {
    isPending,
    isError,
    data: todaysKeyword,
    error,
  } = useTodaysKeywordQuery();

  const keywordId = todaysKeyword?.keyword.id ?? 0;

  const {
    data: videoData,
    isPending: isVideoPending,
    isError: isVideoError,
  } = useKeywordVideo(keywordId);

  if (isError) {
    return <div>에러가 발생했습니다. {error.message}</div>;
  }

  const showSkeleton = isPending;
  const canShowVideo =
    !showSkeleton && !isVideoPending && !isVideoError && !!videoData?.videoId;

  return (
    <div className='max-w-full mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-col items-center gap-10'>
        {showSkeleton ? (
          <div className='w-[90vw] sm:w-full max-w-3xl mx-auto my-5 border-2 px-4 sm:px-6 lg:px-8'>
            <Skeleton className='w-full aspect-video' />
          </div>
        ) : (
          <TodaysKeywordCard
            keywordName={todaysKeyword.keyword.name}
            keywordDesc={todaysKeyword.keyword.description}
          />
        )}

        <article className='flex flex-col lg:flex-row gap-10 lg:gap-20 w-full'>
          <section className='flex flex-col gap-4 w-full lg:w-1/2'>
            {showSkeleton || isVideoPending ? (
              <Skeleton className='flex flex-col gap-4 w-full lg:w-1/2 aspect-video' />
            ) : canShowVideo ? (
              <VideoPlayer
                todaysKeyword={todaysKeyword.keyword}
                videoId={videoData.videoId!}
              />
            ) : (
              <div className='text-sm text-red-500'>
                오늘의 영상 링크가 없거나 유효하지 않습니다.
              </div>
            )}

            {showSkeleton ? (
              <Skeleton className='w-full' />
            ) : (
              <ArticleList keyword={todaysKeyword.keyword} />
            )}
          </section>

          <aside className='w-full lg:w-1/2'>
            {showSkeleton ? (
              <Skeleton className='w-full' />
            ) : (
              <ReviewListInLearning keywordId={todaysKeyword.keyword.id} />
            )}
          </aside>
        </article>
      </div>
    </div>
  );
}
