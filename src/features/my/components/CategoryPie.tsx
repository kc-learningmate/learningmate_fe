import type { StudyCategoryGraph } from '@/features/my/types/achievement';

type PieProps = {
  stats?: StudyCategoryGraph;
  isLoading?: boolean;
};

type Seg = {
  label: string;
  value: number;
  pct: number;
  color: string;
  dasharray: string;
  dashoffset: number;
};

const COLORS = [
  '#F87171',
  '#86EFAC',
  '#60A5FA',
  '#A78BFA',
  '#FACC15',
  '#34D399',
  '#FB923C',
] as const;

const LABEL_MAP: Record<string, string> = {
  finance: '금융',
  economy: '경제',
  management: '경영',
  pub: '공공',
  science: '과학',
  society: '사회',
};

function normalize(
  stats?: StudyCategoryGraph
): Array<{ label: string; value: number; pct: number }> {
  if (!stats) return [];

  const entries = (Object.entries(stats ?? {}) as Array<[string, number]>)
    .filter(([, v]) => Number.isFinite(v) && v > 0)
    .map(([k, v]) => [LABEL_MAP[k] ?? k, v] as [string, number]);

  if (entries.length === 0) return [];

  entries.sort((a, b) => b[1] - a[1]);

  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total <= 0) return [];

  const raw = entries.map(([label, value]) => {
    const p = (value / total) * 100;
    return { label, value, floor: Math.floor(p), rest: p - Math.floor(p) };
  });
  const pctArr = raw.map((r) => r.floor);
  let used = pctArr.reduce((s, v) => s + v, 0);
  const order = raw
    .map((r, i) => ({ i, rest: r.rest }))
    .sort((a, b) => b.rest - a.rest);
  for (let k = 0; used < 100 && k < pctArr.length; k++) pctArr[order[k].i]++;

  return raw.map((r, i) => ({
    label: r.label,
    value: r.value,
    pct: pctArr[i],
  }));
}

export default function CategoryPie({ stats, isLoading }: PieProps) {
  const data = normalize(stats);

  const radius = 60;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;

  let acc = 0;
  const segments: Seg[] = data.map((d, i) => {
    const length = (circumference * d.pct) / 100;
    const safeLen = Number.isFinite(length) ? length : 0;
    const dasharray = `${safeLen} ${Math.max(circumference - safeLen, 0)}`;
    const dashoffset = Math.max(circumference - acc, 0);
    acc += safeLen;
    return {
      label: d.label,
      value: d.value,
      pct: d.pct,
      color: COLORS[i % COLORS.length],
      dasharray,
      dashoffset,
    };
  });

  return (
    <div className='rounded-2xl border p-4 shadow-sm md:p-6'>
      <h3 className='mb-4 text-lg font-semibold'>학습 분야 그래프</h3>

      {isLoading ? (
        <div className='h-40 animate-pulse rounded-xl border' />
      ) : segments.length === 0 ? (
        <div className='text-center text-sm text-zinc-500'>
          데이터가 없습니다.
        </div>
      ) : (
        <div className='flex flex-col items-center gap-6 md:flex-row md:items-start'>
          <svg
            viewBox='0 0 160 160'
            width={200}
            height={200}
            className='mx-auto'
          >
            <circle
              cx='80'
              cy='80'
              r={radius}
              fill='transparent'
              stroke='#F4F4F5'
              strokeWidth={stroke}
            />
            {segments.map((s, i) => (
              <circle
                key={i}
                cx='80'
                cy='80'
                r={radius}
                fill='transparent'
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={s.dasharray}
                strokeDashoffset={s.dashoffset}
                strokeLinecap='butt'
                transform='rotate(-90 80 80)'
              />
            ))}
            <circle cx='80' cy='80' r={radius - stroke / 2} fill='white' />
          </svg>

          <ul className='grid w-full grid-cols-2 gap-x-6 gap-y-3 md:max-w-sm'>
            {segments.map((s, i) => (
              <li key={i} className='flex items-center justify-between gap-3'>
                <span className='flex items-center gap-2'>
                  <span
                    className='inline-block h-3 w-3 rounded-full'
                    style={{ background: s.color }}
                  />
                  <span className='text-sm text-zinc-700'>{s.label}</span>
                </span>
                <span className='text-sm font-medium'>{s.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
