import ArticleSection from '@/features/admin/components/ArticleSection';
import KeywordSection from '@/features/admin/components/KeywordSection';
import VideoSection from '@/features/admin/components/VideoSecion';
import type { KeywordWithVideo } from '@/features/keywords/types/types';
import { useState } from 'react';

export default function AdminPage() {
  const [keyword, setKeyword] = useState<KeywordWithVideo | undefined>();

  return (
    <main className='flex flex-col gap-16 mx-4 max-w-7xl lg:mx-auto py-8'>
      <div className='space-y-3 border-b pb-6'>
        <h1 className='text-4xl font-bold tracking-tight'>Admin Page</h1>
        <p className='text-base text-muted-foreground'>
          키워드, 비디오, Article을 통합 관리할 수 있는 관리자 페이지입니다
        </p>
      </div>

      <KeywordSection onKeywordSelect={setKeyword} />

      {keyword && (
        <div className='space-y-16'>
          <VideoSection keywordId={keyword.id} video={keyword.video} />
          <ArticleSection keywordId={keyword.id} />
        </div>
      )}

      {!keyword && (
        <div className='flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-muted rounded-lg bg-muted/5'>
          <p className='text-muted-foreground text-center'>
            키워드를 선택하면 관련된 비디오와 Article을 관리할 수 있습니다
          </p>
        </div>
      )}
    </main>
  );
}
