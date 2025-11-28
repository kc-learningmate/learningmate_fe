function StatItem({ title, value }: { title: string; value: string | number }) {
  return (
    <div className='rounded-xl bg-amber-200/70 px-4 py-3 sm:py-4 ring-1 ring-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,.3)]'>
      <div className='text-center text-lg sm:text-xl font-extrabold text-amber-900'>
        {String(value)}
      </div>
      <div className='mt-1 text-center text-[11px] sm:text-xs text-amber-900/80'>
        {title}
      </div>
    </div>
  );
}

export default function TopStatsStrip({
  monthAttendanceTitle,
  monthDays,
  totalKeywords,
  topCategory,
  totalReviews,
}: {
  monthAttendanceTitle: string;
  monthDays: string;
  totalKeywords: number;
  topCategory: string;
  totalReviews: number;
}) {
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 font-extrabold'>
      <StatItem title={monthAttendanceTitle} value={monthDays || '—'} />
      <StatItem title='총 학습 키워드' value={totalKeywords} />
      <StatItem title='주요 학습 분야' value={topCategory || '—'} />
      <StatItem title='총 리뷰 수' value={totalReviews} />
    </div>
  );
}
