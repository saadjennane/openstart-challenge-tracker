import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth-actions';
import ProfileClient from '@/components/ProfileClient';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <ProfileClient user={user} />;
}
