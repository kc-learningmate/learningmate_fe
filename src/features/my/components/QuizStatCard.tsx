type Props = {
  correctCounts?: number;
  totalCounts?: number;
  isLoading?: boolean;
};

export default function QuizStatCard({
  correctCounts = 0,
  totalCounts = 0,
  isLoading,
}: Props) {
  const pct =
    totalCounts > 0 ? Math.round((correctCounts / totalCounts) * 100) : 0;

  const radius = 36;
  const stroke = 8;
  const C = 2 * Math.PI * radius;
  const filled = (C * pct) / 100;

  return (
    <div className='rounded-2xl border p-4 shadow-sm'>
      {isLoading ? (
        <div className='h-28 animate-pulse rounded-xl bg-zinc-100' />
      ) : (
        <div className='flex items-center gap-4'>
          <svg
            viewBox='0 0 100 100'
            width={96}
            height={96}
            className='shrink-0'
          >
            <circle
              cx='50'
              cy='50'
              r={radius}
              fill='none'
              stroke='#E5E7EB'
              strokeWidth={stroke}
            />
            <circle
              cx='50'
              cy='50'
              r={radius}
              fill='none'
              stroke='#F59E0B'
              strokeWidth={stroke}
              strokeDasharray={`${filled} ${C - filled}`}
              transform='rotate(-90 50 50)'
              strokeLinecap='round'
            />
            <text
              x='50'
              y='54'
              textAnchor='middle'
              fontSize='18'
              fontWeight={800}
              fill='#111827'
            >
              {pct}%
            </text>
          </svg>

          <div className='flex-1'>
            <div className='text-xs text-zinc-500'>
              정답 수 / 시도한 문제 수
            </div>
            <div className='text-2xl font-extrabold'>
              {correctCounts}{' '}
              <span className='text-zinc-400'>/ {totalCounts}</span>
            </div>
            <div className='mt-2 flex items-center gap-3 text-xs text-zinc-500'>
              <span className='inline-flex items-center gap-1'>
                <span className='inline-block h-2 w-2 rounded-full bg-amber-500' />
                정답률
              </span>
              <span>최근 시도 기준</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
