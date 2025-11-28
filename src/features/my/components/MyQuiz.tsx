import IncorrectQuizList from '@/features/my/components/IncorrectQuizList';
import QuizStatCard from '@/features/my/components/QuizStatCard';
import SectionHeader from '@/features/my/components/SectionHeader';
import { useQuizStatistics } from '@/features/my/hooks/useQuizStatistics';
import { TOKENS } from '../config/pageMeta';

export default function MyQuiz() {
  const { data, isLoading } = useQuizStatistics();

  return (
    <section className={TOKENS.sectionGapY}>
      <SectionHeader page='quiz' />

      <QuizStatCard
        correctCounts={data?.correctCounts ?? 0}
        totalCounts={data?.totalCounts ?? 0}
        isLoading={isLoading}
      />

      <IncorrectQuizList />
    </section>
  );
}
