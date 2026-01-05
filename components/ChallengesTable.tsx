'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Challenge, ChallengeStatus } from '@/lib/types';
import { getLastComment, getNextActions } from '@/lib/utils';
import { reorderChallenges } from '@/lib/actions';
import ActionPill, { RemainingCount } from './ActionPill';

interface ChallengesTableProps {
  challenges: Challenge[];
}

// Get initials from full name
const getInitials = (name: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

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

export default function ChallengesTable({ challenges }: ChallengesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localChallenges, setLocalChallenges] = useState(challenges);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Sync local state with props
  if (challenges !== localChallenges && !draggedIndex) {
    setLocalChallenges(challenges);
  }

  const handleRowClick = (challengeId: string) => {
    router.push(`/challenge/${challengeId}`);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newChallenges = [...localChallenges];
    const draggedItem = newChallenges[draggedIndex];
    newChallenges.splice(draggedIndex, 1);
    newChallenges.splice(index, 0, draggedItem);
    setLocalChallenges(newChallenges);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      const orderedIds = localChallenges.map(c => c.id);
      startTransition(async () => {
        await reorderChallenges(orderedIds);
        router.refresh();
      });
    }
    setDraggedIndex(null);
  };

  if (challenges.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-2 py-3"></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Challenge
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                WENOV
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Entity
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Startup
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Comment
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Next Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {localChallenges.map((challenge, index) => {
              const lastComment = getLastComment(challenge.activities);
              const { actions: nextActions, remaining } = getNextActions(challenge.actions);
              const statusStyle = getStatusStyle(challenge.status);

              return (
                <tr
                  key={challenge.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleRowClick(challenge.id)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    draggedIndex === index ? 'bg-indigo-50 opacity-70' : ''
                  } ${isPending ? 'opacity-50' : ''}`}
                >
                  <td className="px-2 py-4">
                    <div
                      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 max-w-[300px]">{challenge.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    {challenge.wenov_responsible ? (
                      <span
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs"
                        title={challenge.wenov_responsible}
                      >
                        {getInitials(challenge.wenov_responsible)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {challenge.entity ? (
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {challenge.entity}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {challenge.startup_name ? (
                      <span className="text-gray-900">{challenge.startup_name}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 max-w-[250px]">
                    {lastComment ? (
                      <div>
                        <p className="text-sm text-gray-700 line-clamp-3" title={lastComment.note}>
                          {lastComment.note}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{lastComment.timeAgo}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                      {nextActions.length > 0 ? (
                        <>
                          {nextActions.map((action) => (
                            <ActionPill key={action.id} action={action} compact />
                          ))}
                          {remaining > 0 && <RemainingCount count={remaining} />}
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
