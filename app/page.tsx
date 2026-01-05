import { getChallenges, getEntities, getWenovOwners } from '@/lib/actions';
import { auth } from '@/lib/auth';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await auth();
  const [challenges, entities, wenovOwners] = await Promise.all([
    getChallenges(),
    getEntities(),
    getWenovOwners(),
  ]);

  return (
    <DashboardClient
      challenges={challenges}
      entities={entities}
      wenovOwners={wenovOwners}
      user={session?.user ? { name: session.user.name, isAdmin: session.user.isAdmin } : undefined}
    />
  );
}
