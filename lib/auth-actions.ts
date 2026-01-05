'use server';

import prisma from './db';
import bcrypt from 'bcryptjs';
import { auth } from './auth';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized');
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      entity: true,
      isAdmin: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  entity: 'WENOV' | 'CEED';
  isAdmin?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      entity: data.entity,
      isAdmin: data.isAdmin || false,
    },
  });

  revalidatePath('/admin/users');
  return { id: user.id, email: user.email, name: user.name, entity: user.entity, isAdmin: user.isAdmin };
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    entity?: 'WENOV' | 'CEED';
    isAdmin?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath('/admin/users');
  return { id: user.id, email: user.email, name: user.name, entity: user.entity, isAdmin: user.isAdmin };
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized');
  }

  // Prevent self-deletion
  if (session.user.id === id) {
    throw new Error('Vous ne pouvez pas supprimer votre propre compte');
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath('/admin/users');
}

export async function updateProfile(data: { name?: string; currentPassword?: string; newPassword?: string }) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const updateData: { name?: string; password?: string } = {};

  if (data.name) {
    updateData.name = data.name;
  }

  if (data.currentPassword && data.newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const passwordMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!passwordMatch) {
      throw new Error('Mot de passe actuel incorrect');
    }

    updateData.password = await bcrypt.hash(data.newPassword, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  revalidatePath('/profile');
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      entity: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return user;
}
