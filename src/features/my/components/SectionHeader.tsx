import type { PageKey } from '@/pages/MyPage';
import { PAGE_META } from '../config/pageMeta';

type Props = {
  page: PageKey;
  className?: string;
};

export default function SectionHeader({ page, className = '' }: Props) {
  const meta = PAGE_META[page];
  return (
    <header className={className}>
      <h3 className='text-lg font-bold tracking-tight'>{meta.title}</h3>
      <p className='mt-1 text-sm text-neutral-500'>{meta.desc}</p>
    </header>
  );
}
