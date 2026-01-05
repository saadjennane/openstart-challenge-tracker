'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Challenge, ChallengeStatus } from '@/lib/types';
import { updateChallenge, deleteChallenge } from '@/lib/actions';

interface EditChallengeModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
}

const WENOV_RESPONSIBLES = [
  { id: 'othmane', name: 'Othmane As Salih', initials: 'OA' },
  { id: 'asmaa', name: 'Asmaa Ouach', initials: 'AO' },
  { id: 'rim', name: 'Rim Hachidi', initials: 'RH' },
];

const ENTITIES = [
  'WafaSalaf',
  'Wafa Cash',
  'AWB RH',
  'AWB IT',
  'AFM',
  'AWB',
];

const STATUSES: { value: ChallengeStatus; label: string; color: string }[] = [
  { value: 'ongoing', label: 'Ongoing', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'standby', label: 'Standby', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700 border-green-300' },
];

export default function EditChallengeModal({ challenge, isOpen, onClose }: EditChallengeModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: challenge.name,
    wenov_responsible: challenge.wenov_responsible,
    entity: challenge.entity,
    startup_name: challenge.startup_name,
    status: challenge.status,
  });

  if (!isOpen) return null;

  const handleDelete = () => {
    startTransition(async () => {
      await deleteChallenge(challenge.id);
      router.push('/');
      router.refresh();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      await updateChallenge(challenge.id, formData);
      router.refresh();
      onClose();
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Challenge</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Challenge Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Challenge Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: status.value })}
                  className={`px-4 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
                    formData.status === status.value
                      ? status.color + ' border-current'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* WENOV Responsible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WENOV Responsible
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, wenov_responsible: '' })}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                  !formData.wenov_responsible
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  !formData.wenov_responsible
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  ?
                </span>
                <span className="font-medium text-sm">Non assigné</span>
              </button>
              {WENOV_RESPONSIBLES.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, wenov_responsible: person.name })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                    formData.wenov_responsible === person.name
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    formData.wenov_responsible === person.name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {person.initials}
                  </span>
                  <span className="font-medium text-sm">{person.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Entity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity (Metier)
            </label>
            <select
              value={formData.entity}
              onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Non assigné</option>
              {ENTITIES.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          {/* Startup Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Startup Name
            </label>
            <input
              type="text"
              value={formData.startup_name}
              onChange={(e) => setFormData({ ...formData, startup_name: e.target.value })}
              placeholder="Nom de la startup..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Delete Section */}
          <div className="border-t border-gray-200 pt-5 mt-5">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Zone de danger</h3>
              <p className="text-sm text-red-600 mb-3">
                La suppression de ce challenge est irréversible. Toutes les actions, activités et contacts associés seront également supprimés.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer ce challenge
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le challenge <strong>{challenge.name}</strong> ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
