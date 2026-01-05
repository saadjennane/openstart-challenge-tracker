'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser, updateUser, deleteUser } from '@/lib/auth-actions';
import Link from 'next/link';

type UserEntity = 'WENOV' | 'CEED';

interface User {
  id: string;
  email: string;
  name: string;
  entity: string;
  isAdmin: boolean;
  createdAt: Date;
}

interface UsersManagementClientProps {
  users: User[];
  currentUserId: string;
}

export default function UsersManagementClient({ users, currentUserId }: UsersManagementClientProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    entity: 'WENOV' as UserEntity,
    isAdmin: false,
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await createUser(newUser);
      setMessage('Utilisateur créé avec succès');
      setNewUser({ email: '', password: '', name: '', entity: 'WENOV', isAdmin: false });
      setShowAddForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    setError('');
    setMessage('');

    try {
      await updateUser(userId, { isAdmin: !currentIsAdmin });
      setMessage('Rôle mis à jour avec succès');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`)) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await deleteUser(userId);
      setMessage('Utilisateur supprimé avec succès');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Gestion des membres</h1>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Retour aux challenges
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Add User Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un membre
          </button>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveau membre</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entité</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewUser({ ...newUser, entity: 'WENOV' })}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      newUser.entity === 'WENOV'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    WENOV
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUser({ ...newUser, entity: 'CEED' })}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      newUser.entity === 'CEED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    CEED
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isAdmin"
                  type="checkbox"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">
                  Administrateur (peut ajouter d&apos;autres membres)
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Création...' : 'Créer le membre'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Membres ({users.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        user.entity === 'WENOV'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.entity}
                      </span>
                      {user.isAdmin && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                          Admin
                        </span>
                      )}
                      {user.id === currentUserId && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                          Vous
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                {user.id !== currentUserId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        user.isAdmin
                          ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                          : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                      }`}
                    >
                      {user.isAdmin ? 'Retirer admin' : 'Rendre admin'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
