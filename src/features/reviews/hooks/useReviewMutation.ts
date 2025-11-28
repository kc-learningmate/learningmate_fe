import { QUERY_KEYS } from '@/constants/querykeys';
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteReview, postReview, updateReview } from '../api/api';
import type { ReviewForm, ReviewResponse } from '../types/types';

function defaultOnError(error: unknown) {
  if ((error as AxiosError)?.isAxiosError) {
    const ax = error as AxiosError<{ message?: string }>;
    alert(ax.response?.data?.message ?? ax.message);
  } else if (error instanceof Error) {
    alert(error.message);
  } else {
    alert('알 수 없는 오류');
  }
}

const invalidateMyReviews = async (qc: ReturnType<typeof useQueryClient>) => {
  await qc.invalidateQueries({ queryKey: [QUERY_KEYS.REVIEWS, 'me'] });
};

export function useUpdateReviewMutation(
  articleId: number,
  reviewId: number,
  options?: UseMutationOptions<ReviewResponse, AxiosError, ReviewForm>
) {
  const qc = useQueryClient();

  return useMutation<ReviewResponse, AxiosError, ReviewForm>({
    mutationKey: [QUERY_KEYS.REVIEW, 'update', articleId, reviewId],
    mutationFn: async (payload: ReviewForm) => {
      const res = await updateReview(payload, reviewId);
      return (res as any).data as ReviewResponse;
    },
    onSuccess: async (updated, variables, ctx) => {
      alert('수정이 완료되었습니다.');

      qc.setQueryData([QUERY_KEYS.REVIEW, articleId], updated);

      await qc.invalidateQueries({ queryKey: [QUERY_KEYS.REVIEW, articleId] });

      await invalidateMyReviews(qc);

      options?.onSuccess?.(updated, variables, ctx);
    },
    onError: (err, ...rest) => {
      if (options?.onError) return options.onError(err, ...rest);
      defaultOnError(err);
    },
    ...options,
  });
}

export function useDeleteReviewMutation(
  articleId: number,
  reviewId: number,
  options?: UseMutationOptions<unknown, AxiosError, void>
) {
  const qc = useQueryClient();

  return useMutation<unknown, AxiosError, void>({
    mutationKey: [QUERY_KEYS.REVIEW, 'delete', articleId, reviewId],
    mutationFn: () => deleteReview(reviewId),
    onSuccess: async (data, variables, ctx) => {
      alert('리뷰가 삭제되었습니다.');

      qc.setQueryData([QUERY_KEYS.REVIEW, articleId], null);

      await qc.invalidateQueries({ queryKey: [QUERY_KEYS.REVIEW, articleId] });

      await invalidateMyReviews(qc);

      options?.onSuccess?.(data, variables, ctx);
    },
    onError: (err, ...rest) => {
      if (options?.onError) return options.onError(err, ...rest);
      defaultOnError(err);
    },
    ...options,
  });
}

export function useCreateReviewMutation(
  articleId: number,
  options?: UseMutationOptions<ReviewResponse, AxiosError, ReviewForm>
) {
  const qc = useQueryClient();

  return useMutation<ReviewResponse, AxiosError, ReviewForm>({
    mutationKey: [QUERY_KEYS.REVIEW, 'create', articleId],
    mutationFn: async (payload: ReviewForm) => {
      const res = await postReview(payload, articleId);
      return (res as any).data as ReviewResponse;
    },
    onSuccess: async (created, variables, ctx) => {
      alert('작성이 완료되었습니다.');

      qc.setQueryData([QUERY_KEYS.REVIEW, articleId], created);

      await qc.invalidateQueries({ queryKey: [QUERY_KEYS.REVIEW, articleId] });

      await invalidateMyReviews(qc);

      options?.onSuccess?.(created, variables, ctx);
    },
    onError: (err, ...rest) => {
      if (options?.onError) return options.onError(err, ...rest);
      defaultOnError(err);
    },
    ...options,
  });
}
