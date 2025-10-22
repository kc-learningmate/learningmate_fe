import { Button } from '@/components/ui/button';
import CheckWithdrawDialog from '@/features/members/components/CheckWithdrawDialog';
import ProfileImageField from '@/features/members/components/ProfileImageField';
import ProfileNickNameField from '@/features/members/components/ProfileNicknameField';
import ProfilePasswdField from '@/features/members/components/ProfilePasswdField';
import WithdrawalSuccessDialog from '@/features/members/components/WithdrawalSuccessDialog';
import type { Member } from '@/features/members/types/types';

export type MyPageProfileSectionProps = {
  member: Member;
  updateMember: (member: Member) => void;
  isCheckWithdrawDialogOpen: boolean;
  setCheckWithdrawDialog: () => void;
  deleteAccount: () => void;
  isWithdrawSuccessDialogOpen: boolean;
  setWithdrawSuccessDialog: () => void;
  onAccountDeleted: () => void;
};

export default function MyPageProfileSection({
  member,
  updateMember,
  isCheckWithdrawDialogOpen,
  setCheckWithdrawDialog,
  deleteAccount,
  isWithdrawSuccessDialogOpen,
  setWithdrawSuccessDialog,
  onAccountDeleted,
}: MyPageProfileSectionProps) {
  return (
    <section className='rounded-2xl border-2 border-yellow-400 bg-white p-6 shadow-sm md:p-8'>
      <h1 className='text-xl font-semibold'>내 프로필</h1>

      <div className='mt-6 space-y-6'>
        <ProfileImageField
          imgUrl={member.imageUrl}
          updateMember={updateMember}
        />

        <ProfileNickNameField
          nickname={member.nickname}
          updateMember={updateMember}
        />

        <div className='flex items-center'>
          <div className='w-28 font-semibold'>이메일: </div>
          <div className='flex w-full items-center justify-between'>
            <span className='font-bold underline'>{member.email} </span>
          </div>
        </div>

        <ProfilePasswdField updateMember={updateMember} />
      </div>
      <div className='mt-20 mr-2 flex justify-end'>
        <Button
          variant={'outline_semibold'}
          onClick={setCheckWithdrawDialog}
          className='text-red-500 hover:text-red-500'
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
