import { useQuery } from '@tanstack/react-query';
import { fetchMainStudyAchievements } from '../api/main';

export const useMainStudyAchievements = () => {
  return useQuery({
    queryKey: ['me', 'main-study-achievements'],
    queryFn: fetchMainStudyAchievements,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
