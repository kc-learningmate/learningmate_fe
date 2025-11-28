import { useEffect, useMemo, useState } from 'react';
import { format, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useReviewStore } from '../store/calendarStore';
import { useStudyStatusByMonth } from '../hooks/useStudyStatus';
import { QUIZ, REVIEW, VIDEO } from '../types/types';

import {
  kstDateKey,
  isTodayKST,
  isSameKSTDay,
  formatKST,
} from '@/lib/timezone';

type Holiday = { date: string; localName: string; name: string };

export default function Calendar({
  onSelect,
  selected,
  size,
}: {
  onSelect: (d: Date) => void;
  selected: Date;
  size?: number;
}) {
  const { cursorMonth, gotoPrevMonth, gotoNextMonth, monthData } =
    useReviewStore();

  const {
    data: missionMap,
    isLoading,
    isError,
  } = useStudyStatusByMonth(cursorMonth);

  const title = formatKST(cursorMonth, 'yyyy년 M월', { locale: ko });

  const days = useMemo(() => {
    if (!missionMap)
      return monthData.map((d) => ({
        ...d,
        hasData: false,
        missionBits: null,
      }));
    return monthData.map((d) => {
      const key = kstDateKey(d.date);
      const bits = missionMap.get(key);
      return {
        ...d,
        hasData: bits !== undefined,
        missionBits: bits ?? null,
      };
    });
  }, [monthData, missionMap]);

  const firstWeekday = days.length > 0 ? getDay(days[0].date) : 0;
  const leading = firstWeekday;
  const trailing =
    days.length > 0 ? (7 - ((leading + days.length) % 7)) % 7 : 0;

  const [holidays, setHolidays] = useState<Map<string, Holiday>>(new Map());
  useEffect(() => {
    const year = Number(formatKST(cursorMonth, 'yyyy'));
    (async () => {
      try {
        const res = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/KR`
        );
        if (!res.ok) throw new Error('holiday fetch failed');
        const json: Holiday[] = await res.json();
        const map = new Map<string, Holiday>();
        json.forEach((h) => map.set(h.date, h));
        setHolidays(map);
      } catch (e) {
        console.error(e);
        setHolidays(new Map());
      }
    })();
  }, [cursorMonth]);

  const holidayByDate = useMemo(() => holidays, [holidays]);

  return (
    <div
      className={[
        'rounded-2xl border bg-background p-4 md:p-6 shadow-sm w-full',
        'mx-auto md:mx-0 max-w-[22rem] sm:max-w-md md:max-w-none',
      ].join(' ')}
      style={{ maxWidth: size }}
      role='group'
      aria-label={`${title} 캘린더`}
    >
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-xl font-semibold'>{title}</h3>
        <div className='flex gap-2'>
          <Button
            variant='secondary'
            size='icon'
            onClick={gotoPrevMonth}
            aria-label='이전 달'
          >
            <ChevronLeft className='h-5 w-5' />
          </Button>
          <Button
            variant='secondary'
            size='icon'
            onClick={gotoNextMonth}
            aria-label='다음 달'
          >
            <ChevronRight className='h-5 w-5' />
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-7 text-center text-xs md:text-sm text-muted-foreground border-t border-l'>
        {'일월화수목금토'.split('').map((d, idx) => (
          <div
            key={d}
            className={[
              'py-2 border-r border-b',
              idx === 0 ? 'text-red-600' : '',
              idx === 6 ? 'text-blue-600' : '',
            ].join(' ')}
          >
            {d}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 border-l border-t'>
        {Array.from({ length: leading }).map((_, i) => (
          <div
            key={`lead-${i}`}
            className='aspect-square border-r border-b bg-muted/50'
          />
        ))}

        {days.map(({ date, hasData, missionBits }) => {
          const selectedDay = isSameKSTDay(date, selected);
          const today = isTodayKST(date);
          const weekday = getDay(date);

          const dateISO = kstDateKey(date);
          const holiday = holidayByDate.get(dateISO);
          const isHoliday = !!holiday;

          const dayColorClass = isHoliday
            ? 'text-red-600'
            : weekday === 6
              ? 'text-blue-600'
              : weekday === 0
                ? 'text-red-600'
                : 'text-foreground';

          return (
            <button
              key={dateISO}
              onClick={() => hasData && onSelect(date)}
              disabled={!hasData}
              className={[
                'relative aspect-square border-r border-b transition-colors cursor-pointer',
                !hasData
                  ? 'opacity-60 bg-muted/60 cursor-not-allowed'
                  : selectedDay
                    ? 'bg-primary/40'
                    : 'bg-card hover:bg-accent',
              ].join(' ')}
              aria-label={`${formatKST(date, 'yyyy년 M월 d일 (EEE)', { locale: ko })}${
                isHoliday ? `, ${holiday?.localName}` : ''
              }${hasData ? '' : ' (데이터 없음)'}`}
            >
              {isHoliday && (
                <span
                  className='absolute top-1 left-1/2 -translate-x-1/2 px-0.5 text-[8px] leading-none text-red-600 max-w-[95%] truncate pointer-events-none'
                  title={holiday.localName}
                >
                  {holiday.localName}
                </span>
              )}

              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <span
                  className={[
                    'text-sm md:text-base',
                    selectedDay || today ? 'font-bold' : '',
                    dayColorClass,
                  ].join(' ')}
                >
                  {format(date, 'd')}
                </span>
                {today && <span className='sr-only'>오늘</span>}
              </div>

              {missionBits !== null && missionBits !== undefined && (
                <div className='absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none'>
                  {[VIDEO, REVIEW, QUIZ].map((mask, idx) => {
                    const completed = (missionBits & mask) > 0;
                    const colorClass = completed
                      ? 'bg-green-500'
                      : 'bg-red-500';
                    return (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${colorClass}`}
                        aria-hidden
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}

        {Array.from({ length: trailing }).map((_, i) => (
          <div
            key={`trail-${i}`}
            className='aspect-square border-r border-b bg-muted/50'
          />
        ))}
      </div>

      <div className='mt-4'>
        <div className='mx-auto max-w-sm rounded-xl border bg-muted/30 px-3 py-3'>
          <div className='flex items-center justify-center gap-4 text-[10px] md:text-xs text-muted-foreground mb-2'>
            <span className='font-medium'>순서 :</span>
            <div className='flex items-center gap-1'>
              <PlayCircle className='h-3 w-3' />
              <span>비디오</span>
            </div>
            <div className='flex items-center gap-1'>
              <BookOpen className='h-3 w-3' />
              <span>리뷰</span>
            </div>
            <div className='flex items-center gap-1'>
              <HelpCircle className='h-3 w-3' />
              <span>퀴즈</span>
            </div>
          </div>
          <div className='flex items-center justify-center gap-6 text-[10px] md:text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <span className='inline-block h-2 w-2 rounded-full bg-green-500' />
              <span>완료</span>
            </div>
            <div className='flex items-center gap-1'>
              <span className='inline-block h-2 w-2 rounded-full bg-red-500' />
              <span>미완료</span>
            </div>
          </div>
          {isLoading && (
            <div className='mt-2 text-center text-[10px] md:text-xs text-muted-foreground'>
              불러오는 중…
            </div>
          )}
          {isError && (
            <div className='mt-2 text-center text-[10px] md:text-xs text-red-600'>
              데이터를 불러오지 못했어요. 콘솔을 확인해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
