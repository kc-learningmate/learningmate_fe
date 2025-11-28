export default function LogoMark({
  className = 'size-5',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox='0 0 32 32'
      aria-hidden='true'
      className={className}
      fill='none'
    >
      <rect
        x='3'
        y='3'
        width='26'
        height='26'
        rx='8'
        className='fill-white/12'
      />
      <path
        d='M11.5 9.5v13h9'
        stroke='currentColor'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle cx='23' cy='9' r='1.6' className='fill-current' />
    </svg>
  );
}
