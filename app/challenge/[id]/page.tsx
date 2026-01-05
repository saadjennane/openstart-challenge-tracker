import { notFound } from 'next/navigation';
import { getChallengeById, getMembers } from '@/lib/actions';
import ChallengeDetailClient from '@/components/ChallengeDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [challenge, members] = await Promise.all([
    getChallengeById(id),
    getMembers(),
  ]);

  if (!challenge) {
    notFound();
  }

  return <ChallengeDetailClient initialChallenge={challenge} members={members} />;
}
