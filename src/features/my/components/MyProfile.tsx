import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/context/useSession';
import CheckWithdrawDialog from '@/features/members/components/CheckWithdrawDialog';
import ProfileImageField from '@/features/members/components/ProfileImageField';
import ProfileNickNameField from '@/features/members/components/ProfileNicknameField';
import ProfilePasswdField from '@/features/members/components/ProfilePasswdField';
import WithdrawalSuccessDialog from '@/features/members/components/WithdrawalSuccessDialog';
import SectionHeader from '@/features/my/components/SectionHeader';
import { useDeleteMemberMutation } from '@/hooks/useDeleteMemberMutation';
import { useReducer } from 'react';
import { TOKENS } from '../config/pageMeta';

export default function MyProfile() {
  const { member, updateMember, onAccountDeleted } = useSession();
  const [isCheckWithdrawDialogOpen, setCheckWithdrawDialog] = useReducer(
    (pre) => !pre,
    false
  );
  const [isWithdrawSuccessDialogOpen, setWithdrawSuccessDialog] = useReducer(
    (pre) => !pre,
    false
  );
  const mutation = useDeleteMemberMutation(setWithdrawSuccessDialog);

  const deleteAccount = () => {
    mutation.mutate();
    setCheckWithdrawDialog();
  };

  if (!member) return null;

  return (
    <section className={TOKENS.sectionGapY}>
      <SectionHeader page='profile' />

      <div className='grid grid-cols-1 gap-6 md:grid-cols-[280px,1fr]'>
        <aside className={`${TOKENS.card} ${TOKENS.cardPadding} text-center`}>
          <div className='mb-3 text-sm font-medium text-neutral-600'>
            프로필 이미지
          </div>
          <div className='flex flex-col items-center gap-3'>
            <ProfileImageField
              imgUrl={member.imageUrl}
              updateMember={updateMember}
            />
          </div>
        </aside>

        <div className='space-y-6'>
          <div className={`${TOKENS.card} ${TOKENS.cardPadding}`}>
            <div className='text-sm font-medium text-neutral-500'>닉네임</div>
            <div className='mt-2 flex items-center justify-between'>
              <ProfileNickNameField
                nickname={member.nickname}
                updateMember={updateMember}
              />
            </div>
          </div>

          <div className={`${TOKENS.card} ${TOKENS.cardPadding}`}>
            <div className='text-sm font-medium text-neutral-500'>이메일</div>
            <div className='mt-2 flex items-center justify-between'>
              <span className='break-all font-medium underline underline-offset-4'>
                {member.email}
              </span>
            </div>
          </div>

          <div className={`${TOKENS.card} ${TOKENS.cardPadding}`}>
            <div className='text-sm font-medium text-neutral-500'>비밀번호</div>
            <div className='mt-2 flex items-center justify-between'>
              <ProfilePasswdField updateMember={updateMember} />
            </div>
          </div>
        </div>
      </div>

      <div className='mt-8 flex justify-end'>
        <Button
          variant='outline_semibold'
          onClick={setCheckWithdrawDialog}
          className='rounded-lg border-red-200 text-red-600 hover:border-red-300 hover:text-red-600'
        >
          회원 탈퇴
        </Button>
      </div>

      <CheckWithdrawDialog
        isOpen={isCheckWithdrawDialogOpen}
        setCheckWithdrawDialog={setCheckWithdrawDialog}
        deleteAccount={deleteAccount}
      />
      <WithdrawalSuccessDialog
        isOpen={isWithdrawSuccessDialogOpen}
        setWithdrawSuccessDialog={setWithdrawSuccessDialog}
        onAccountDeleted={onAccountDeleted}
      />
    </section>
  );
}
