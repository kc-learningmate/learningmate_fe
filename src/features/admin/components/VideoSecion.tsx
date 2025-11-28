import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { QUERY_KEYS } from '@/constants/querykeys';
import type { Video } from '@/features/videos/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VideoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import YouTube from 'react-youtube';
import { createVideo, updateVideo } from '../api/api';
import { useVideoForm } from '../hooks/useVideoForm';
import type { VideoUrlForm } from '../types/types';
import ActionResultDialog from './ActionResultDialog';

type Props = {
  keywordId: number;
  video: Video | null;
};

export default function VideoSection({ keywordId, video }: Props) {
  const queryClient = useQueryClient();
  const form = useVideoForm(video?.link);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleDialogOpen = (open: boolean) => setIsDialogOpen(open);

  const mutation = useMutation({
    mutationKey: [QUERY_KEYS.VIDEOS, video?.id],
    mutationFn: async ({ videoUrl }: VideoUrlForm) => {
      return !video
        ? createVideo(keywordId, videoUrl)
        : updateVideo(video.id, videoUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.KEYWORDS],
      });
    },
    onError: () => {
      handleDialogOpen(true);
    },
  });

  const extractVideoId = (url?: string) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const onSubmit = async (formData: VideoUrlForm) => {
    await mutation.mutateAsync(formData);
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  const videoId = extractVideoId(video?.link);

  useEffect(() => {
    form.reset({
      videoUrl: video?.link ?? '',
    });
  }, [video, form]);

  return (
    <section className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Videos</h2>
        <p className='text-sm text-muted-foreground'>
          키워드와 관련된 YouTube 영상을 관리할 수 있습니다
        </p>
      </div>

      <div className='flex flex-wrap md:flex-nowrap gap-6'>
        <div className='w-full md:w-auto md:flex-1 border rounded-lg p-6 bg-card shadow-sm'>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-6'
          >
            <Controller
              name='videoUrl'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor='video-url-input'
                    className='font-semibold'
                  >
                    Video URL
                  </FieldLabel>
                  <Input
                    {...field}
                    id='video-url-input'
                    aria-invalid={fieldState.invalid}
                    placeholder='YouTube URL을 입력하세요'
                    className='mt-2'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button
              type='submit'
              variant={'primary_semibold'}
              disabled={!form.formState.isDirty}
              className='self-start shadow-sm hover:shadow transition-all duration-200'
            >
              비디오 수정
            </Button>
          </form>
        </div>

        <div className='w-full md:flex-1'>
          {videoId ? (
            <div className='w-full aspect-video rounded-lg overflow-hidden shadow-md border bg-card'>
              <YouTube
                videoId={videoId}
                opts={opts}
                className='w-full h-full'
              />
            </div>
          ) : (
            <div className='w-full aspect-video flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg bg-muted/5'>
              <VideoIcon className='w-16 h-16 text-muted-foreground/40 mb-3' />
              <p className='text-muted-foreground'>선택된 영상이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <ActionResultDialog
        isOpen={isDialogOpen}
        handleDialogOpen={handleDialogOpen}
        content='예상치 못한 에러가 발생했습니다. 다시 시도해주세요.'
      />
    </section>
  );
}
