'use client';

import { Action, ActionOwner } from '@/lib/types';
import { isOverdue, formatDueDate } from '@/lib/utils';

interface ActionPillProps {
  action: Action;
  compact?: boolean;
}

const getOwnerStyle = (owner: ActionOwner): { color: string; label: string } => {
  switch (owner) {
    case 'STARTUP': return { color: 'bg-blue-500', label: 'SU' };
    case 'WENOV': return { color: 'bg-indigo-500', label: 'WE' };
    case 'CEED': return { color: 'bg-green-500', label: 'CE' };
    // Entity names (WafaSalaf, Wafa Cash, AWB RH, etc.) use orange
    default: return { color: 'bg-orange-500', label: owner.slice(0, 3).toUpperCase() };
  }
};

export default function ActionPill({ action, compact = false }: ActionPillProps) {
  const overdue = isOverdue(action);
  const { color: ownerColor, label: ownerLabel } = getOwnerStyle(action.owner);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 text-xs">
        <span className={`${ownerColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>
          {ownerLabel}
        </span>
        <span className="text-gray-700" title={action.title}>
          {action.title}
        </span>
        {action.is_urgent && (
          <span className="text-red-500" title="Urgent">
            🔥
          </span>
        )}
        {overdue && (
          <span className="text-amber-500" title="Overdue">
            ⚠️
          </span>
        )}
        <span className={`text-[10px] ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
          {formatDueDate(action.due_date)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        overdue ? 'bg-red-50 border-red-200' : action.is_urgent ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <span className={`${ownerColor} text-white text-xs font-bold px-2 py-1 rounded`}>
        {action.owner}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{action.title}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {action.is_urgent && (
          <span className="text-red-500 text-sm" title="Urgent">
            🔥
          </span>
        )}
        {overdue && (
          <span className="text-amber-500 text-sm" title="Overdue">
            ⚠️
          </span>
        )}
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            overdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {formatDueDate(action.due_date)}
        </span>
      </div>
    </div>
  );
}

// Component to show remaining actions count
export function RemainingCount({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center justify-center px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
      +{count}
    </span>
  );
}
