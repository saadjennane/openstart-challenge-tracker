'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateAction } from '@/lib/actions';

interface ActionWithChallenge {
  id: string;
  challenge_id: string;
  challenge_name: string;
  challenge_entity: string;
  startup_name: string;
  title: string;
  owner: string;
  due_date: string;
  is_done: boolean;
  is_urgent: boolean;
  assignee_id?: string;
  assignee_name?: string;
}

interface Member {
  id: string;
  name: string;
  entity: string;
}

interface ActionsClientProps {
  actions: ActionWithChallenge[];
  members: Member[];
  entities: string[];
  startups: string[];
  challenges: string[];
}

function isOverdue(dueDate: string, isDone: boolean): boolean {
  if (isDone) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === tomorrow.toDateString()) return 'Demain';

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function ActionsClient({
  actions: initialActions,
  members,
  entities,
  startups,
  challenges,
}: ActionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actions, setActions] = useState(initialActions);

  // Filters
  const [filterEntity, setFilterEntity] = useState('');
  const [filterStartup, setFilterStartup] = useState('');
  const [filterChallenge, setFilterChallenge] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'done' | 'overdue'>('open');
  const [searchQuery, setSearchQuery] = useState('');

  // Assignment dropdown
  const [assigningActionId, setAssigningActionId] = useState<string | null>(null);

  const handleToggleDone = async (action: ActionWithChallenge) => {
    // Optimistic update
    setActions((prev) =>
      prev.map((a) => (a.id === action.id ? { ...a, is_done: !a.is_done } : a))
    );

    startTransition(async () => {
      await updateAction(action.id, action.challenge_id, { is_done: !action.is_done });
      router.refresh();
    });
  };

  const handleAssign = async (actionId: string, challengeId: string, memberId: string | null) => {
    const member = memberId ? members.find((m) => m.id === memberId) : null;

    // Optimistic update
    setActions((prev) =>
      prev.map((a) =>
        a.id === actionId
          ? { ...a, assignee_id: memberId || undefined, assignee_name: member?.name || undefined }
          : a
      )
    );
    setAssigningActionId(null);

    startTransition(async () => {
      await updateAction(actionId, challengeId, { assignee_id: memberId });
      router.refresh();
    });
  };

  // Filter actions
  const filteredActions = actions.filter((action) => {
    // Status filter
    if (filterStatus === 'open' && action.is_done) return false;
    if (filterStatus === 'done' && !action.is_done) return false;
    if (filterStatus === 'overdue' && !isOverdue(action.due_date, action.is_done)) return false;

    // Entity filter
    if (filterEntity && action.challenge_entity !== filterEntity) return false;

    // Startup filter
    if (filterStartup && action.startup_name !== filterStartup) return false;

    // Challenge filter
    if (filterChallenge && action.challenge_name !== filterChallenge) return false;

    // Member filter
    if (filterMember && action.assignee_id !== filterMember) return false;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = action.title.toLowerCase().includes(query);
      const matchesChallenge = action.challenge_name.toLowerCase().includes(query);
      const matchesStartup = action.startup_name.toLowerCase().includes(query);
      if (!matchesTitle && !matchesChallenge && !matchesStartup) return false;
    }

    return true;
  });

  const openCount = actions.filter((a) => !a.is_done).length;
  const overdueCount = actions.filter((a) => isOverdue(a.due_date, a.is_done)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Toutes les actions</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded-full">
                {openCount} en cours
              </span>
              {overdueCount > 0 && (
                <span className="px-2.5 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">
                  {overdueCount} en retard
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="open">En cours</option>
              <option value="done">Terminées</option>
              <option value="overdue">En retard</option>
            </select>

            {/* Entity filter */}
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Toutes les entités</option>
              {entities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>

            {/* Startup filter */}
            <select
              value={filterStartup}
              onChange={(e) => setFilterStartup(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Toutes les startups</option>
              {startups.map((startup) => (
                <option key={startup} value={startup}>
                  {startup}
                </option>
              ))}
            </select>

            {/* Challenge filter */}
            <select
              value={filterChallenge}
              onChange={(e) => setFilterChallenge(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tous les challenges</option>
              {challenges.map((challenge) => (
                <option key={challenge} value={challenge}>
                  {challenge}
                </option>
              ))}
            </select>

            {/* Member filter */}
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tous les membres</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {(filterEntity || filterStartup || filterChallenge || filterMember || searchQuery || filterStatus !== 'open') && (
              <button
                onClick={() => {
                  setFilterEntity('');
                  setFilterStartup('');
                  setFilterChallenge('');
                  setFilterMember('');
                  setSearchQuery('');
                  setFilterStatus('open');
                }}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Actions list */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune action trouvée
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredActions.map((action) => {
                const overdue = isOverdue(action.due_date, action.is_done);
                return (
                  <div
                    key={action.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      action.is_done ? 'bg-gray-50 opacity-60' : overdue ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleDone(action)}
                        disabled={isPending}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          action.is_done
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {action.is_done && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded text-white ${
                            action.owner === 'STARTUP' ? 'bg-blue-500' :
                            action.owner === 'WENOV' ? 'bg-indigo-500' :
                            action.owner === 'CEED' ? 'bg-green-500' : 'bg-orange-500'
                          }`}>
                            {action.owner}
                          </span>
                          {action.is_urgent && <span title="Urgent">🔥</span>}
                          {overdue && <span title="En retard">⚠️</span>}
                        </div>
                        <p className={`text-gray-900 font-medium ${action.is_done ? 'line-through' : ''}`}>
                          {action.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <Link
                            href={`/challenge/${action.challenge_id}`}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            {action.challenge_name}
                          </Link>
                          {action.startup_name && (
                            <span className="text-sm text-gray-400">
                              {action.startup_name}
                            </span>
                          )}
                          {action.challenge_entity && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                              {action.challenge_entity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Due date */}
                      <div className={`text-sm font-medium ${
                        overdue ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {formatDueDate(action.due_date)}
                      </div>

                      {/* Assignee */}
                      <div className="relative">
                        <button
                          onClick={() => setAssigningActionId(assigningActionId === action.id ? null : action.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${
                            action.assignee_id
                              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {action.assignee_name ? (
                            <>
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-medium">
                                {action.assignee_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                              <span className="max-w-[80px] truncate">{action.assignee_name.split(' ')[0]}</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Assigner</span>
                            </>
                          )}
                        </button>

                        {/* Dropdown */}
                        {assigningActionId === action.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => handleAssign(action.id, action.challenge_id, null)}
                              className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
                            >
                              Non assigné
                            </button>
                            {members.map((member) => (
                              <button
                                key={member.id}
                                onClick={() => handleAssign(action.id, action.challenge_id, member.id)}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                  action.assignee_id === member.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium ${
                                  member.entity === 'WENOV' ? 'bg-indigo-600' : 'bg-emerald-600'
                                }`}>
                                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                                <span>{member.name}</span>
                                <span className={`ml-auto text-xs ${
                                  member.entity === 'WENOV' ? 'text-indigo-500' : 'text-emerald-500'
                                }`}>
                                  {member.entity}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          {filteredActions.length} action{filteredActions.length !== 1 ? 's' : ''} affichée{filteredActions.length !== 1 ? 's' : ''}
        </div>
      </main>
    </div>
  );
}
