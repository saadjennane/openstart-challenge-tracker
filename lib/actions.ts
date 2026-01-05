'use server';

import prisma from './db';
import { revalidatePath } from 'next/cache';
import { ChallengeStatus } from './types';

// Challenge actions
export async function getChallenges() {
  const challenges = await prisma.challenge.findMany({
    include: {
      actions: true,
      activities: {
        orderBy: { createdAt: 'desc' },
      },
      contacts: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return challenges.map((c) => ({
    id: c.id,
    name: c.name,
    wenov_responsible: c.wenov_responsible,
    entity: c.entity,
    startup_name: c.startup_name,
    status: c.status as ChallengeStatus,
    actions: c.actions.map((a) => ({
      id: a.id,
      challenge_id: a.challengeId,
      title: a.title,
      owner: a.owner as 'AWB' | 'STARTUP',
      due_date: a.due_date.toISOString().split('T')[0],
      is_done: a.is_done,
      is_urgent: a.is_urgent,
    })),
    activities: c.activities.map((a) => ({
      id: a.id,
      challenge_id: a.challengeId,
      type: a.type as 'call' | 'meeting' | 'email' | 'note',
      note: a.note,
      link: a.link || undefined,
      created_at: a.createdAt.toISOString(),
    })),
    contacts: c.contacts.map((ct) => ({
      id: ct.id,
      firstName: ct.firstName,
      lastName: ct.lastName,
      function: ct.function,
      company: ct.company,
      email: ct.email,
      phone: ct.phone,
      group: ct.group as 'WENOV' | 'Metier' | 'Startup' | 'OpenStart',
    })),
  }));
}

export async function getChallengeById(id: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      actions: true,
      activities: {
        orderBy: { createdAt: 'desc' },
      },
      contacts: true,
    },
  });

  if (!challenge) return null;

  return {
    id: challenge.id,
    name: challenge.name,
    wenov_responsible: challenge.wenov_responsible,
    entity: challenge.entity,
    startup_name: challenge.startup_name,
    status: challenge.status as ChallengeStatus,
    actions: challenge.actions.map((a) => ({
      id: a.id,
      challenge_id: a.challengeId,
      title: a.title,
      owner: a.owner as 'AWB' | 'STARTUP',
      due_date: a.due_date.toISOString().split('T')[0],
      is_done: a.is_done,
      is_urgent: a.is_urgent,
    })),
    activities: challenge.activities.map((a) => ({
      id: a.id,
      challenge_id: a.challengeId,
      type: a.type as 'call' | 'meeting' | 'email' | 'note',
      note: a.note,
      link: a.link || undefined,
      created_at: a.createdAt.toISOString(),
    })),
    contacts: challenge.contacts.map((ct) => ({
      id: ct.id,
      firstName: ct.firstName,
      lastName: ct.lastName,
      function: ct.function,
      company: ct.company,
      email: ct.email,
      phone: ct.phone,
      group: ct.group as 'WENOV' | 'Metier' | 'Startup' | 'OpenStart',
    })),
  };
}

export async function createChallenge(data: {
  name: string;
  wenov_responsible?: string;
  entity?: string;
  startup_name?: string;
  status?: ChallengeStatus;
}) {
  const challenge = await prisma.challenge.create({
    data: {
      name: data.name,
      wenov_responsible: data.wenov_responsible || '',
      entity: data.entity || '',
      startup_name: data.startup_name || '',
      status: data.status || 'ongoing',
    },
  });
  revalidatePath('/');
  return challenge;
}

export async function updateChallenge(
  id: string,
  data: {
    name?: string;
    wenov_responsible?: string;
    entity?: string;
    startup_name?: string;
    status?: ChallengeStatus;
  }
) {
  const challenge = await prisma.challenge.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  revalidatePath(`/challenge/${id}`);
  return challenge;
}

export async function deleteChallenge(id: string) {
  await prisma.challenge.delete({
    where: { id },
  });
  revalidatePath('/');
}

export async function reorderChallenges(orderedIds: string[]) {
  // Update sortOrder for each challenge based on its position in the array
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.challenge.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
  revalidatePath('/');
}

// Action actions
export async function createAction(data: {
  challengeId: string;
  title: string;
  owner: string;
  due_date: string;
  is_urgent?: boolean;
}) {
  const action = await prisma.action.create({
    data: {
      title: data.title,
      owner: data.owner,
      due_date: new Date(data.due_date),
      is_urgent: data.is_urgent || false,
      challengeId: data.challengeId,
    },
  });
  revalidatePath('/');
  revalidatePath(`/challenge/${data.challengeId}`);
  return action;
}

export async function updateAction(
  id: string,
  challengeId: string,
  data: {
    title?: string;
    owner?: string;
    due_date?: string;
    is_done?: boolean;
    is_urgent?: boolean;
  }
) {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.owner !== undefined) updateData.owner = data.owner;
  if (data.due_date !== undefined) updateData.due_date = new Date(data.due_date);
  if (data.is_done !== undefined) updateData.is_done = data.is_done;
  if (data.is_urgent !== undefined) updateData.is_urgent = data.is_urgent;

  const action = await prisma.action.update({
    where: { id },
    data: updateData,
  });
  revalidatePath('/');
  revalidatePath(`/challenge/${challengeId}`);
  return action;
}

export async function deleteAction(id: string, challengeId: string) {
  await prisma.action.delete({
    where: { id },
  });
  revalidatePath('/');
  revalidatePath(`/challenge/${challengeId}`);
}

// Activity actions
export async function createActivity(data: {
  challengeId: string;
  type: 'call' | 'meeting' | 'email' | 'note';
  note: string;
  link?: string;
}) {
  const activity = await prisma.activity.create({
    data: {
      type: data.type,
      note: data.note,
      link: data.link,
      challengeId: data.challengeId,
    },
  });
  revalidatePath('/');
  revalidatePath(`/challenge/${data.challengeId}`);
  return activity;
}

// Contact actions
export async function createContact(data: {
  challengeId: string;
  firstName: string;
  lastName: string;
  function: string;
  company: string;
  email: string;
  phone?: string;
  group: 'WENOV' | 'Metier' | 'Startup' | 'OpenStart';
}) {
  const contact = await prisma.contact.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      function: data.function,
      company: data.company,
      email: data.email,
      phone: data.phone || '',
      group: data.group,
      challengeId: data.challengeId,
    },
  });
  revalidatePath(`/challenge/${data.challengeId}`);
  return contact;
}

export async function updateContact(
  id: string,
  challengeId: string,
  data: {
    firstName?: string;
    lastName?: string;
    function?: string;
    company?: string;
    email?: string;
    phone?: string;
    group?: 'WENOV' | 'Metier' | 'Startup' | 'OpenStart';
  }
) {
  const contact = await prisma.contact.update({
    where: { id },
    data,
  });
  revalidatePath(`/challenge/${challengeId}`);
  return contact;
}

export async function deleteContact(id: string, challengeId: string) {
  await prisma.contact.delete({
    where: { id },
  });
  revalidatePath(`/challenge/${challengeId}`);
}

// Utility functions
export async function getEntities() {
  const challenges = await prisma.challenge.findMany({
    select: { entity: true },
    distinct: ['entity'],
  });
  return challenges.map((c) => c.entity).filter(Boolean).sort();
}

export async function getWenovOwners() {
  const challenges = await prisma.challenge.findMany({
    select: { wenov_responsible: true },
    distinct: ['wenov_responsible'],
  });
  return challenges.map((c) => c.wenov_responsible).filter(Boolean).sort();
}
