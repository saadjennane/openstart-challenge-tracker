'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Challenge, Action, Activity, ActionOwner } from '@/lib/types';
import { updateAction, createActivity, createAction } from '@/lib/actions';
import ChallengeDetail from './ChallengeDetail';
import EditChallengeModal from './EditChallengeModal';

interface ChallengeDetailClientProps {
  initialChallenge: Challenge;
}

export default function ChallengeDetailClient({ initialChallenge }: ChallengeDetailClientProps) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge>(initialChallenge);
  const [isPending, startTransition] = useTransition();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Update local state when initialChallenge changes (after server refresh)
  useEffect(() => {
    setChallenge(initialChallenge);
  }, [initialChallenge]);

  const handleUpdateAction = async (actionId: string, updates: Partial<Action>) => {
    // Optimistic update
    setChallenge((prev) => ({
      ...prev,
      actions: prev.actions.map((action) =>
        action.id === actionId ? { ...action, ...updates } : action
      ),
    }));

    // Server update
    startTransition(async () => {
      await updateAction(actionId, challenge.id, updates);
      router.refresh();
    });
  };

  const handleAddActivity = async (activityData: Omit<Activity, 'id' | 'challenge_id' | 'created_at'>) => {
    // Optimistic update
    const optimisticActivity: Activity = {
      id: `temp-${Date.now()}`,
      challenge_id: challenge.id,
      created_at: new Date().toISOString(),
      ...activityData,
    };

    setChallenge((prev) => ({
      ...prev,
      activities: [optimisticActivity, ...prev.activities],
    }));

    // Server update
    startTransition(async () => {
      await createActivity({
        challengeId: challenge.id,
        type: activityData.type,
        note: activityData.note,
        link: activityData.link,
      });
      router.refresh();
    });
  };

  const handleAddAction = async (actionData: { title: string; owner: ActionOwner; due_date: string; is_urgent: boolean }) => {
    // Optimistic update
    const optimisticAction: Action = {
      id: `temp-${Date.now()}`,
      challenge_id: challenge.id,
      title: actionData.title,
      owner: actionData.owner,
      due_date: actionData.due_date,
      is_done: false,
      is_urgent: actionData.is_urgent,
    };

    setChallenge((prev) => ({
      ...prev,
      actions: [...prev.actions, optimisticAction],
    }));

    // Server update
    startTransition(async () => {
      await createAction({
        challengeId: challenge.id,
        title: actionData.title,
        owner: actionData.owner,
        due_date: actionData.due_date,
        is_urgent: actionData.is_urgent,
      });
      router.refresh();
    });
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  return (
    <>
      <ChallengeDetail
        challenge={challenge}
        onUpdateAction={handleUpdateAction}
        onAddActivity={handleAddActivity}
        onAddAction={handleAddAction}
        onEditClick={handleEditClick}
      />
      <EditChallengeModal
        challenge={challenge}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
      />
    </>
  );
}
