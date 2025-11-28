import { ROUTE_PATHS } from '@/constants/routepaths';
import { signOut } from '@/features/auth/api/api';
import { useSession } from '@/features/auth/context/useSession';
import { useTodaysKeywordQuery } from '@/features/keywords/hooks/useTodaysKeywordQuery';
import MemberProfile from '@/features/members/components/MemberProfile';
import {
  BookOpenIcon,
  HouseIcon,
  LightbulbIcon,
  LogOutIcon,
  MenuIcon,
  UserStarIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';

export default function HeaderDropDown() {
  const { logout, member } = useSession();
  const navigate = useNavigate();
  const { isPending, data: todaysKeyword } = useTodaysKeywordQuery();

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTE_PATHS.LANDING);
    logout();
  };

  if (isPending) return <Skeleton className='size-8 rounded-lg' />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className='
            size-8 grid place-items-center
            rounded-lg border border-white/55
            hover:bg-white/15
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
            transition-colors text-white
          '
          aria-label='메뉴 열기'
        >
          <MenuIcon className='size-4' />
          <span className='sr-only'>메뉴</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='
          w-64 md:w-72
          p-1.5
          rounded-xl border shadow-lg
          bg-popover/95 backdrop-blur-sm font-semibold
        '
      >
        <div className='rounded-md border bg-card/60 px-2 py-1.5 mb-1.5'>
          <DropdownMenuLabel className='p-0 text-sm font-medium'>
            <MemberProfile />
          </DropdownMenuLabel>
        </div>

        <DropdownMenuGroup className='space-y-0.5'>
          {todaysKeyword && member?.role === 'ADMIN' && (
            <DropdownMenuItem
              asChild
              className='gap-1.5 py-1.5 rounded-md text-sm'
            >
              <Link
                to={`${ROUTE_PATHS.ADMIN}?keywordId=${todaysKeyword.keyword.id}`}
                className='w-full inline-flex items-center'
              >
                <UserStarIcon className='size-4 text-muted-foreground' />
                어드민
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            asChild
            className='gap-1.5 py-1.5 rounded-md text-sm'
          >
            <Link
              to={ROUTE_PATHS.MAIN}
              className='w-full inline-flex items-center'
            >
              <HouseIcon className='size-4 text-muted-foreground' />홈
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className='gap-1.5 py-1.5 rounded-md text-sm'
          >
            <Link
              to={ROUTE_PATHS.LEARNING}
              className='w-full inline-flex items-center'
            >
              <LightbulbIcon className='size-4 text-muted-foreground' />
              오늘의 키워드
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className='gap-1.5 py-1.5 rounded-md text-sm'
          >
            <Link
              to={ROUTE_PATHS.MY}
              className='w-full inline-flex items-center'
            >
              <BookOpenIcon className='size-4 text-muted-foreground' />
              마이페이지
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className='my-1' />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleLogout}
            className='gap-1.5 py-1.5 rounded-md text-sm'
          >
            <LogOutIcon className='size-4 text-muted-foreground' />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
