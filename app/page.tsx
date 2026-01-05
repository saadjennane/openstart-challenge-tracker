import { getChallenges, getEntities, getWenovOwners } from '@/lib/actions';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
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
    />
  );
}
