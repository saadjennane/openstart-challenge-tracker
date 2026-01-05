'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Challenge, Action, Activity, Contact, ContactGroup, ChallengeStatus, ActionOwner } from '@/lib/types';
import { isOverdue, formatDueDate, getOpenActions } from '@/lib/utils';
import ActivitiesTimeline from './ActivitiesTimeline';

interface ChallengeDetailProps {
  challenge: Challenge;
  onUpdateAction: (actionId: string, updates: Partial<Action>) => void;
  onAddActivity: (activity: Omit<Activity, 'id' | 'challenge_id' | 'created_at'>) => void;
  onAddAction: (action: { title: string; owner: ActionOwner; due_date: string; is_urgent: boolean }) => void;
  onEditClick: () => void;
}

interface ActionCardProps {
  action: Action;
  onToggleDone: () => void;
  onToggleUrgent: () => void;
}

// Status badge styles
const getStatusStyle = (status: ChallengeStatus): { bg: string; text: string; label: string } => {
  switch (status) {
    case 'ongoing':
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ongoing' };
    case 'overdue':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' };
    case 'standby':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Standby' };
    case 'done':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Done' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  }
};

const getOwnerColor = (owner: ActionOwner): string => {
  switch (owner) {
    case 'STARTUP': return 'bg-blue-500';
    case 'WENOV': return 'bg-indigo-500';
    case 'CEED': return 'bg-green-500';
    // Entity names (WafaSalaf, Wafa Cash, AWB RH, etc.) use orange
    default: return 'bg-orange-500';
  }
};

function ActionCard({ action, onToggleDone, onToggleUrgent }: ActionCardProps) {
  const overdue = isOverdue(action);
  const ownerColor = getOwnerColor(action.owner);

  return (
    <div
      className={`bg-white rounded-lg border p-4 ${
        action.is_done
          ? 'border-gray-200 bg-gray-50 opacity-60'
          : overdue
          ? 'border-red-300 bg-red-50'
          : action.is_urgent
          ? 'border-amber-300 bg-amber-50'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={onToggleDone}
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`${ownerColor} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                {action.owner}
              </span>
              {action.is_urgent && <span title="Urgent">🔥</span>}
              {overdue && !action.is_done && <span title="Overdue">⚠️</span>}
            </div>
            <p className={`text-gray-900 ${action.is_done ? 'line-through' : ''}`}>{action.title}</p>
            <p
              className={`text-sm mt-1 ${
                overdue && !action.is_done ? 'text-red-600 font-medium' : 'text-gray-500'
              }`}
            >
              Due: {formatDueDate(action.due_date)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleUrgent}
            className={`p-2 rounded-lg transition-colors ${
              action.is_urgent
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={action.is_urgent ? 'Remove urgent' : 'Mark as urgent'}
          >
            🔥
          </button>
        </div>
      </div>
    </div>
  );
}

interface ContactsSectionProps {
  contacts: Contact[];
}

function ContactsSection({ contacts }: ContactsSectionProps) {
  const groups: { key: ContactGroup; label: string; color: string }[] = [
    { key: 'WENOV', label: 'WENOV', color: 'bg-indigo-100 text-indigo-800' },
    { key: 'Metier', label: 'Metier', color: 'bg-green-100 text-green-800' },
    { key: 'Startup', label: 'Startup', color: 'bg-blue-100 text-blue-800' },
    { key: 'OpenStart', label: 'OpenStart Team', color: 'bg-purple-100 text-purple-800' },
  ];

  const groupedContacts = groups.map((group) => ({
    ...group,
    contacts: contacts.filter((c) => c.group === group.key),
  }));

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
        No contacts yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groupedContacts.map(
        (group) =>
          group.contacts.length > 0 && (
            <div key={group.key} className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className={`inline-block text-sm font-medium px-2 py-1 rounded mb-3 ${group.color}`}>
                {group.label}
              </h4>
              <div className="space-y-3">
                {group.contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.role}</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}

// Generate action owners dynamically based on challenge entity
const getActionOwners = (entity: string): { value: string; label: string; color: string }[] => {
  const owners: { value: string; label: string; color: string }[] = [];

  // Add entity as first option if it exists (replaces AWB)
  if (entity) {
    owners.push({ value: entity, label: entity, color: 'bg-orange-500' });
  }

  // Add fixed owners
  owners.push(
    { value: 'STARTUP', label: 'Startup', color: 'bg-blue-500' },
    { value: 'WENOV', label: 'WENOV', color: 'bg-indigo-500' },
    { value: 'CEED', label: 'CEED', color: 'bg-green-500' },
  );

  return owners;
};

export default function ChallengeDetail({
  challenge,
  onUpdateAction,
  onAddActivity,
  onAddAction,
  onEditClick,
}: ChallengeDetailProps) {
  const actionOwners = getActionOwners(challenge.entity);
  const defaultOwner = challenge.entity || 'STARTUP';

  const [showAddAction, setShowAddAction] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '',
    owner: defaultOwner as ActionOwner,
    due_date: new Date().toISOString().split('T')[0],
    is_urgent: false,
  });

  const openActions = getOpenActions(challenge.actions);
  const doneActions = challenge.actions.filter((a) => a.is_done);
  const statusStyle = getStatusStyle(challenge.status);

  const handleAddAction = () => {
    if (!newAction.title.trim()) return;
    onAddAction(newAction);
    setNewAction({
      title: '',
      owner: defaultOwner,
      due_date: new Date().toISOString().split('T')[0],
      is_urgent: false,
    });
    setShowAddAction(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Challenge
            </button>
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{challenge.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {challenge.wenov_responsible ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {challenge.wenov_responsible.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                    <span className="text-sm font-medium text-indigo-700">{challenge.wenov_responsible}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-sm">
                    WENOV non assigné
                  </span>
                )}
                {challenge.entity ? (
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {challenge.entity}
                  </span>
                ) : (
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200">
                    Entity non assignée
                  </span>
                )}
                {challenge.startup_name ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {challenge.startup_name}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    Startup non assignée
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Open Actions */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                    {openActions.length}
                  </span>
                  Next Actions
                </h2>
                <button
                  onClick={() => setShowAddAction(!showAddAction)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une action
                </button>
              </div>

              {/* Add Action Form */}
              {showAddAction && (
                <div className="bg-white rounded-lg border border-indigo-200 p-4 mb-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description de l&apos;action
                      </label>
                      <input
                        type="text"
                        value={newAction.title}
                        onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                        placeholder="Ex: Envoyer le contrat signé..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Responsable
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {actionOwners.map((owner) => (
                            <button
                              key={owner.value}
                              type="button"
                              onClick={() => setNewAction({ ...newAction, owner: owner.value })}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                newAction.owner === owner.value
                                  ? `${owner.color} text-white`
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {owner.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d&apos;échéance
                        </label>
                        <input
                          type="date"
                          value={newAction.due_date}
                          onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_urgent"
                        checked={newAction.is_urgent}
                        onChange={(e) => setNewAction({ ...newAction, is_urgent: e.target.checked })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="is_urgent" className="text-sm text-gray-700 flex items-center gap-1">
                        <span>Marquer comme urgent</span>
                        <span>🔥</span>
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setShowAddAction(false)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleAddAction}
                        disabled={!newAction.title.trim()}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {openActions.length > 0 ? (
                <div className="space-y-3">
                  {openActions.map((action) => (
                    <ActionCard
                      key={action.id}
                      action={action}
                      onToggleDone={() => onUpdateAction(action.id, { is_done: !action.is_done })}
                      onToggleUrgent={() => onUpdateAction(action.id, { is_urgent: !action.is_urgent })}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-500">No open actions</p>
                </div>
              )}
            </section>

            {/* Done Actions */}
            {doneActions.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">
                    {doneActions.length}
                  </span>
                  Completed Actions
                </h2>
                <div className="space-y-3">
                  {doneActions.map((action) => (
                    <ActionCard
                      key={action.id}
                      action={action}
                      onToggleDone={() => onUpdateAction(action.id, { is_done: !action.is_done })}
                      onToggleUrgent={() => onUpdateAction(action.id, { is_urgent: !action.is_urgent })}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Activities Timeline */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activities</h2>
              <ActivitiesTimeline
                activities={challenge.activities}
                challengeId={challenge.id}
                onAddActivity={onAddActivity}
              />
            </section>
          </div>

          {/* Right Column - Contacts */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacts</h2>
            <ContactsSection contacts={challenge.contacts} />
          </div>
        </div>
      </main>
    </div>
  );
}
