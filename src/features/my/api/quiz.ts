import { api } from '@/lib/axios';
import type {
  QuizStatistics,
  IncorrectQuizPage,
} from '@/features/my/types/quiz';

export async function fetchQuizStatistics(): Promise<QuizStatistics> {
  const { data } = await api.get('/members/me/quiz-statistics');
  return (data?.result ?? data) as QuizStatistics;
}

export async function fetchIncorrectQuizzes(
  page = 0,
  size = 10
): Promise<IncorrectQuizPage> {
  const { data } = await api.get(
    `/members/me/incorrect-quizzes?page=${page}&size=${size}`
  );
  return (data?.result ?? data) as IncorrectQuizPage;
}
