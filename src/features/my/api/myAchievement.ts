import type {
  StudyAchievement,
  StudyCategoryGraph,
} from '@/features/my/types/achievement';
import { api } from '@/lib/axios';

const unwrap = <T>(data: any): T => (data?.result ?? data) as T;

export async function fetchStudyAchievement() {
  const res = await api.get('/members/me/study-achievements');
  return unwrap<StudyAchievement>(res.data);
}

export async function fetchStudyCategoryStats() {
  const res = await api.get('/members/me/study-category-statistics');
  return unwrap<StudyCategoryGraph>(res.data);
}
