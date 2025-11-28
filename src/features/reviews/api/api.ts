import { api } from '@/lib/axios';
import type {
  ArticleReviewsProp,
  HotReviewsResponse,
  ReviewForm,
  ReviewListItem,
  ReviewListPageResponse,
  ReviewResponse,
  TodaysKeywordReviewsProp,
} from '../types/types';

const SIZE = 10;

function unwrapPage(data: any): ReviewListPageResponse {
  const page = data?.result ?? data?.data ?? data;
  if (!page || !Array.isArray(page.items)) {
    console.warn('Unexpected review page shape:', data);
  }
  return page as ReviewListPageResponse;
}

export const fetchReviewsByTodaysKeyword = async ({
  keywordId,
  page = 0,
}: TodaysKeywordReviewsProp): Promise<ReviewListPageResponse> => {
  const response = await api.get(
    `/keywords/${keywordId}/reviews?page=${page}&size=${SIZE}`
  );
  return unwrapPage(response.data);
};

export const fetchReviewsByArticle = async ({
  articleId,
  page = 0,
}: ArticleReviewsProp): Promise<ReviewListPageResponse> => {
  const response = await api.get(
    `/articles/${articleId}/reviews?page=${page}&size=${SIZE}`
  );
  return unwrapPage(response.data);
};

export async function likeReview(reviewId: number) {
  const res = await api.post(`/reviews/${reviewId}/likes`);
  if (!res.status || res.status >= 400) throw new Error('like failed');
}
export async function unlikeReview(reviewId: number) {
  const res = await api.delete(`/reviews/${reviewId}/likes`);
  if (!res.status || res.status >= 400) throw new Error('unlike failed');
}

export const postReview = async (payload: ReviewForm, articleId: number) => {
  const response = await api.post<ReviewForm>(
    `/articles/${articleId}/reviews`,
    payload
  );
  return response.data;
};

export const fetchReview = async (articleId: number) => {
  const response = await api.get(`/articles/${articleId}/reviews/me`);
  return response.data.result as ReviewResponse;
};

export const updateReview = async (payload: ReviewForm, reviewId: number) => {
  const response = await api.patch(`reviews/${reviewId}`, payload);
  return response.data.result as ReviewResponse;
};

export const deleteReview = async (reviewId: number) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

export async function fetchHotReviewsByDate(
  dateISO: string
): Promise<ReviewListItem[]> {
  const res = await api.get<HotReviewsResponse>(
    `reviews/hot-reviews?date=${dateISO}`
  );
  return res.data.result ?? [];
}
