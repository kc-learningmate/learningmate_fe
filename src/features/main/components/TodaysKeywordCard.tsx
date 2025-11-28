import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { FaSearch } from 'react-icons/fa';

export default function TodaysKeywordCard({
  keywordName,
  keywordDesc,
}: {
  keywordName: string;
  keywordDesc: string;
}) {
  return (
    <Card className='border-0 bg-transparent shadow-none sm:py-2'>
      <CardHeader className='items-center px-0 pt-1 pb-1'>
        <CardTitle className='flex items-center justify-center gap-2 text-base font-extrabold text-amber-950'>
          <FaSearch className='h-4 w-4' />
          오늘의 키워드
        </CardTitle>

        <div className='text-center text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-tight'>
          {keywordName || '—'}
        </div>

        <CardDescription className='mt-2 max-w-full text-center text-[13px] sm:text-sm font-extrabold leading-relaxed text-amber-900/80'>
          {keywordDesc || ' '}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
