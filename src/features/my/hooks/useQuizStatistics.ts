import { useQuery } from '@tanstack/react-query';
import { fetchQuizStatistics } from '@/features/my/api/quiz';
import type { QuizStatistics } from '@/features/my/types/quiz';

export function useQuizStatistics() {
  return useQuery<QuizStatistics, Error>({
    queryKey: ['my', 'quiz', 'stats'],
    queryFn: fetchQuizStatistics,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
