import { api } from '@/lib/axios';
import type { MainStudyAchievements } from '../types/types';

export async function fetchMainStudyAchievements(): Promise<MainStudyAchievements> {
  const res = await api.get('/members/me/main-study-achievements');
  return (res.data?.result ?? res.data) as MainStudyAchievements;
}
