import { api } from '@/lib/axios';
import type { ScrapPage } from '@/features/my/types/scraps';

export type MyScrapSort = 'latest' | 'popular';

function unwrapPage(data: any): ScrapPage {
  const page = data?.result ?? data?.data ?? data;
  return page as ScrapPage;
}

function toServerSort(sort?: MyScrapSort) {
  switch (sort) {
    case 'latest':
      return 'createdAt,desc';
    case 'popular':
      return 'scrapCounts,desc';
    default:
      return undefined;
  }
}

export async function fetchMyScraps(
  page = 0,
  size = 12,
  sort: MyScrapSort = 'latest'
): Promise<ScrapPage> {
  const params: Record<string, any> = { page, size };
  const sortParam = toServerSort(sort);
  if (sortParam) params.sort = sortParam;

  const res = await api.get('/members/me/article-scraps', { params });
  return unwrapPage(res.data);
}

export {
  postArticleScrap,
  deleteArticleScrap,
} from '@/features/articles/api/api';
