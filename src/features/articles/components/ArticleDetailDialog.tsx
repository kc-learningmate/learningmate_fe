import * as Dialog from '@radix-ui/react-dialog';
import { useState, type ReactNode } from 'react';
import ArticleDetail from '@/features/articles/components/ArticleDetail';

type Props = {
  trigger: ReactNode;
  articleId: number;
  onScrapChange?: (articleId: number, next: boolean) => void;
  title?: string;
};

export default function ArticleDetailDialog({
  trigger,
  articleId,
  onScrapChange,
  title = '기사 보기',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/40' />
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 h-[85vh] w-[95vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-4 shadow-xl'>
          <div className='mb-3 flex items-center justify-between border-b pb-2'>
            <Dialog.Title className='text-base font-semibold'>
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className='rounded p-1 hover:bg-zinc-100'>✕</button>
            </Dialog.Close>
          </div>

          <ArticleDetail
            articleId={articleId}
            onScrapChange={(id, next) => {
              onScrapChange?.(id, next);
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
