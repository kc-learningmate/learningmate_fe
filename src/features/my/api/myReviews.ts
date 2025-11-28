import { api } from '@/lib/axios';
import type {
  ReviewListItem,
  ReviewListPageResponse,
} from '@/features/reviews/types/types';

export type MyReviewsParams = {
  page?: number;
  size?: number;
  sort?: 'latest' | 'liked';
};

const DEFAULT_SIZE = 10;

function unwrapPage(data: any): ReviewListPageResponse {
  const page = data?.result ?? data?.data ?? data;
  if (!page || !Array.isArray(page.items)) {
    console.warn('Unexpected my-reviews page shape:', data);
  }
  return page as ReviewListPageResponse;
}

function toServerSort(sort?: MyReviewsParams['sort']) {
  switch (sort) {
    case 'latest':
      return 'updatedAt,desc';
    case 'liked':
      return 'likeCounts,desc';
    default:
      return undefined;
  }
}

export async function fetchMyReviews(
  params: MyReviewsParams = {}
): Promise<ReviewListPageResponse> {
  const page = Number.isFinite(params.page) ? (params.page as number) : 0;
  const size = Number.isFinite(params.size)
    ? (params.size as number)
    : DEFAULT_SIZE;
  const sortParam = toServerSort(params.sort);

  const query: Record<string, any> = { page, size };
  if (sortParam) query.sort = sortParam;

  const res = await api.get('/reviews/me', { params: query });
  const pageData = unwrapPage(res.data);

  const items: ReviewListItem[] = Array.isArray((pageData as any).items)
    ? (pageData as any).items
    : [];

  return { ...pageData, items };
}
