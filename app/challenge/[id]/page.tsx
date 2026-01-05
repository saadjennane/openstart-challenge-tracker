import { notFound } from 'next/navigation';
import { getChallengeById } from '@/lib/actions';
import ChallengeDetailClient from '@/components/ChallengeDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const challenge = await getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  return <ChallengeDetailClient initialChallenge={challenge} />;
}
