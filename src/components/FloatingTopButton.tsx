import { useEffect, useRef, useState } from 'react';
import { ArrowUpIcon } from 'lucide-react';

type Props = {
  threshold?: number;
};

export default function FloatingTopButton({ threshold = 240 }: Props) {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > threshold);
        ticking.current = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const handleTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleTop}
      aria-label='맨 위로 이동'
      className={[
        'hidden md:flex',
        'fixed right-8 bottom-8 md:right-10 md:bottom-10 z-40',
        'h-11 w-11 rounded-full bg-primary text-white',
        'shadow-lg shadow-black/10 backdrop-blur border border-white/20',
        'items-center justify-center transition-all',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3 pointer-events-none',
        'hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
      ].join(' ')}
    >
      <ArrowUpIcon className='size-5' />
    </button>
  );
}
