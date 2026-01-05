import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUsers } from '@/lib/auth-actions';
import UsersManagementClient from '@/components/UsersManagementClient';

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.isAdmin) {
    redirect('/');
  }

  const users = await getUsers();

  return <UsersManagementClient users={users} currentUserId={session.user.id} />;
}
