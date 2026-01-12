'use client';

import { useState } from 'react';
import { Activity, ActivityType } from '@/lib/types';
import { getTimeAgo, getActivityTypeInfo } from '@/lib/utils';

interface ActivitiesTimelineProps {
  activities: Activity[];
  challengeId: string;
  onAddActivity: (activity: Omit<Activity, 'id' | 'challenge_id' | 'created_at'>) => void;
  onUpdateActivity: (activityId: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (activityId: string) => void;
}

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'email', label: 'Email' },
  { value: 'note', label: 'Note' },
];

export default function ActivitiesTimeline({
  activities,
  challengeId,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}: ActivitiesTimelineProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'note' as ActivityType,
    note: '',
    link: '',
  });
  const [editData, setEditData] = useState({
    type: 'note' as ActivityType,
    note: '',
    link: '',
  });

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.note.trim()) return;

    onAddActivity({
      type: formData.type,
      note: formData.note,
      link: formData.link || undefined,
    });

    setFormData({ type: 'note', note: '', link: '' });
    setIsFormOpen(false);
  };

  const handleStartEdit = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setEditData({
      type: activity.type,
      note: activity.note,
      link: activity.link || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingActivityId(null);
    setEditData({ type: 'note', note: '', link: '' });
  };

  const handleSaveEdit = () => {
    if (!editingActivityId || !editData.note.trim()) return;
    onUpdateActivity(editingActivityId, {
      type: editData.type,
      note: editData.note,
      link: editData.link || undefined,
    });
    handleCancelEdit();
  };

  const handleDelete = (activityId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      onDeleteActivity(activityId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Activity Button/Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {!isFormOpen ? (
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Add Activity</span>
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">New Activity</h4>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ActivityType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                placeholder="What happened?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.note.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {sortedActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No activities yet. Add the first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedActivities.map((activity, index) => {
              const typeInfo = getActivityTypeInfo(activity.type);
              const isEditing = editingActivityId === activity.id;

              return (
                <div key={activity.id} className="relative pl-8">
                  {/* Timeline line */}
                  {index < sortedActivities.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  {/* Timeline dot */}
                  <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-sm">
                    {typeInfo.icon}
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    {isEditing ? (
                      /* Edit Form */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Modifier l&apos;activité</h4>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={editData.type}
                            onChange={(e) => setEditData({ ...editData, type: e.target.value as ActivityType })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {activityTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                          <textarea
                            value={editData.note}
                            onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                          <input
                            type="url"
                            value={editData.link}
                            onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={!editData.note.trim()}
                            className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display */
                      <div className="flex items-start justify-between gap-4 group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-xs text-gray-400">
                              {getTimeAgo(activity.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700">{activity.note}</p>
                          {activity.link && (
                            <a
                              href={activity.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              View link
                            </a>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(activity)}
                            className="p-1 text-gray-400 hover:text-indigo-500"
                            title="Modifier"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
