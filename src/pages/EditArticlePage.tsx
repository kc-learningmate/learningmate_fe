import EditArticleSection from '@/features/admin/components/EditArticleSection';
import EditQuizSection from '@/features/admin/components/EditQuizSection';
import { useParams } from 'react-router';

export default function EditArticlePage() {
  const { keywordId, articleId } = useParams();

  if (!keywordId || !articleId) {
    throw Error('Keyword 혹은 Article ID 가 필요합니다.');
  }

  return (
    <main className='mx-auto px-4 py-8 max-w-7xl flex flex-col gap-16'>
      <div className='space-y-3 border-b pb-6'>
        <h1 className='text-4xl font-bold tracking-tight'>
          Edit Article & Quiz
        </h1>
        <p className='text-base text-muted-foreground'>
          Article의 내용과 관련 퀴즈를 수정할 수 있는 편집 페이지입니다
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        <EditArticleSection keywordId={+keywordId} articleId={+articleId} />
        <EditQuizSection articleId={+articleId} />
      </div>
    </main>
  );
}
