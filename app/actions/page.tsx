import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllActions, getMembers, getEntities } from '@/lib/actions';
import ActionsClient from '@/components/ActionsClient';

export default async function ActionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [actions, members, entities] = await Promise.all([
    getAllActions(),
    getMembers(),
    getEntities(),
  ]);

  // Get unique values for filters
  const startups = [...new Set(actions.map((a) => a.startup_name).filter(Boolean))].sort();
  const challenges = [...new Set(actions.map((a) => a.challenge_name))].sort();

  return (
    <ActionsClient
      actions={actions}
      members={members}
      entities={entities}
      startups={startups}
      challenges={challenges}
    />
  );
}
