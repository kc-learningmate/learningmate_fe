import LogoMark from '@/components/LogoMark';
import { Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <>
      <div className='w-full min-h-screen flex flex-col'>
        <header
          className='
          fixed md:sticky top-0 z-50
          w-full
          bg-primary/90 supports-[backdrop-filter]:bg-primary/70 backdrop-blur
          border-b border-white/20 text-white
        '
        >
          <div className='mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center justify-center'>
            <div className='flex gap-2 items-center'>
              <LogoMark className='size-5 text-white' />
              <span>LearningMate</span>
            </div>
          </div>
        </header>

        <div className='h-14 md:h-0' />
        <Outlet />
      </div>
    </>
  );
}
