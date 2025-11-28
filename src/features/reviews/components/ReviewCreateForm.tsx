import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ReviewResponse } from '../types/types';
import { useCreateReviewMutation } from '../hooks/useReviewMutation';

type Props = {
  articleId: number;
  memberId: number;
  onCreated?: (created: ReviewResponse) => void;
};

const ReviewSchema = z.object({
  content1: z
    .string()
    .min(10, '기사에 대한 내 생각을 최소 10자 이상 입력하세요.')
    .max(2000, '2000자 이내로 입력하세요.'),
});
type FormValues = z.infer<typeof ReviewSchema>;

export default function ReviewCreateForm({
  articleId,
  memberId,
  onCreated,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(ReviewSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: { content1: '' },
  });

  const [isCancelling, setIsCancelling] = useState(false);
  const createMutation = useCreateReviewMutation(articleId);

  const onSubmit = async (data: FormValues) => {
    try {
      const created = await createMutation.mutateAsync({ memberId, ...data });
      onCreated?.(created);
      reset({ content1: '' });
    } catch (e) {
      console.error(e);
    }
  };

  const onCancel = () => {
    setIsCancelling(true);
    reset({ content1: '' });
    setTimeout(() => setIsCancelling(false), 150);
  };

  const content = watch('content1') ?? '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='grid gap-2'>
        <div className='relative rounded-2xl border border-muted bg-background/70 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 transition'>
          <Textarea
            id='content1'
            {...register('content1')}
            className='resize-none h-56 w-full rounded-2xl border-0 bg-transparent pr-16 whitespace-pre-wrap break-words focus-visible:ring-0'
            style={{ overflowWrap: 'anywhere' }}
            placeholder='기사에 대한 내 생각을 입력해주세요'
            maxLength={2000}
            disabled={createMutation.isPending || isCancelling}
            aria-invalid={!!errors.content1}
          />
          <span className='pointer-events-none absolute right-2 bottom-2 rounded-full bg-muted/80 px-2 py-0.5 text-[11px] text-muted-foreground'>
            {content.length}/2000
          </span>
        </div>
        {errors.content1 && (
          <p className='text-sm text-red-500'>{errors.content1.message}</p>
        )}
      </div>

      <div className='mt-3 pt-3 border-t border-dashed border-muted flex justify-end gap-2'>
        <Button
          type='button'
          variant='secondary'
          onClick={onCancel}
          disabled={createMutation.isPending}
        >
          취소
        </Button>
        <Button type='submit' disabled={createMutation.isPending}>
          {createMutation.isPending ? '작성 중...' : '작성'}
        </Button>
      </div>
    </form>
  );
}
