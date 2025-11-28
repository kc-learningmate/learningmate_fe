import type { Video } from '@/features/videos/types/types';
import type { Category } from '@/types/types';

export type Keyword = {
  id: number;
  name: string;
  description: string;
  category: Category;
};

export type TodaysKeyword = {
  id: number;
  keyword: Keyword;
  date: string;
};

export type KeywordWithVideo = {
  id: number;
  name: string;
  description: string;
  category: Category;
  video: Video | null;
  date: Date | null;
};
