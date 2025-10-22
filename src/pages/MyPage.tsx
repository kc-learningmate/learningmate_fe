import MyPageProfileSection from '@/features/members/components/MyPageProfileSection';
import MyPageSidebar from '@/features/members/components/MyPageSidebar';
import { useSession } from '@/features/auth/context/useSession';
import { useDeleteMemberMutation } from '@/hooks/useDeleteMemberMutation';
import { useReducer } from 'react';

export default function MyPage() {
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

  if (!member) {
    return null;
  }

  return (
    <div className='min-h-screen bg-white p-6'>
      <div className='mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='md:col-span-1'>
          <MyPageSidebar />
        </div>
        <div className='md:col-span-3'>
          <MyPageProfileSection
            member={member}
            updateMember={updateMember}
            isCheckWithdrawDialogOpen={isCheckWithdrawDialogOpen}
            setCheckWithdrawDialog={setCheckWithdrawDialog}
            deleteAccount={deleteAccount}
            isWithdrawSuccessDialogOpen={isWithdrawSuccessDialogOpen}
            setWithdrawSuccessDialog={setWithdrawSuccessDialog}
            onAccountDeleted={onAccountDeleted}
          />
        </div>
      </div>
    </div>
  );
}
