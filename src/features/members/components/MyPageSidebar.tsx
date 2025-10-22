import { cn } from '@/lib/utils';
import {
  BarChart3,
  Bookmark,
  MessageSquareText,
  UserRound,
  HelpCircle,
} from 'lucide-react';

const MENU_ITEMS = [
  { label: '학습 성취도', icon: BarChart3 },
  { label: '스크랩', icon: Bookmark },
  { label: '내 리뷰', icon: MessageSquareText },
  { label: '프로필', icon: UserRound, active: true },
  { label: '퀴즈', icon: HelpCircle },
];

export default function MyPageSidebar() {
  return (
    <aside className='hidden h-fit rounded-2xl border bg-white p-6 shadow-sm md:block'>
      <nav aria-label='마이페이지 메뉴' className='space-y-4'>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900',
                item.active && 'bg-yellow-100 text-gray-900'
              )}
              aria-current={item.active ? 'page' : undefined}
            >
              <Icon className='h-5 w-5' />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
