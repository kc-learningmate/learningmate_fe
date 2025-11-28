import { ROUTE_PATHS } from '@/constants/routepaths';
import { Link } from 'react-router';
import HeaderDropDown from './HeaderDropdown';
import LogoMark from './LogoMark';

export default function Header() {
  return (
    <>
      <header
        className='
          fixed md:sticky top-0 z-50
          w-full
          bg-primary/90 supports-[backdrop-filter]:bg-primary/70 backdrop-blur
          border-b border-white/20 text-white
        '
      >
        <div className='mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center justify-between'>
          <Link
            to={ROUTE_PATHS.MAIN}
            className='flex items-center gap-2 font-semibold text-lg hover:opacity-90 transition'
            aria-label='LearningMate 홈으로'
          >
            <LogoMark className='size-5 text-white' />
            <span>LearningMate</span>
          </Link>

          <HeaderDropDown />
        </div>
      </header>
      <div className='h-14 md:h-0' />
    </>
  );
}
