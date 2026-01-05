'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Challenge, Action, Activity, Contact, ActionOwner } from '@/lib/types';
import { updateAction, createActivity, createAction, createContact, updateContact, deleteContact } from '@/lib/actions';
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

  const handleAddContact = async (contactData: Omit<Contact, 'id'>) => {
    // Optimistic update
    const optimisticContact: Contact = {
      id: `temp-${Date.now()}`,
      ...contactData,
    };

    setChallenge((prev) => ({
      ...prev,
      contacts: [...prev.contacts, optimisticContact],
    }));

    // Server update
    startTransition(async () => {
      await createContact({
        challengeId: challenge.id,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        function: contactData.function,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        group: contactData.group,
      });
      router.refresh();
    });
  };

  const handleUpdateContact = async (contactId: string, updates: Partial<Contact>) => {
    // Optimistic update
    setChallenge((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact) =>
        contact.id === contactId ? { ...contact, ...updates } : contact
      ),
    }));

    // Server update
    startTransition(async () => {
      await updateContact(contactId, challenge.id, updates);
      router.refresh();
    });
  };

  const handleDeleteContact = async (contactId: string) => {
    // Optimistic update
    setChallenge((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== contactId),
    }));

    // Server update
    startTransition(async () => {
      await deleteContact(contactId, challenge.id);
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
        onAddContact={handleAddContact}
        onUpdateContact={handleUpdateContact}
        onDeleteContact={handleDeleteContact}
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
