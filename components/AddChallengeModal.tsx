'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createChallenge } from '@/lib/actions';

interface AddChallengeModalProps {
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

export default function AddChallengeModal({ isOpen, onClose }: AddChallengeModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: '',
    wenov_responsible: 'Othmane As Salih',
    entity: '',
    startup_name: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.entity.trim() || !formData.startup_name.trim()) {
      return;
    }

    startTransition(async () => {
      await createChallenge(formData);
      router.refresh();
      setFormData({ name: '', wenov_responsible: 'Othmane As Salih', entity: '', startup_name: '' });
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
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Challenge</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Challenge Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., API Integration Payment Gateway"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WENOV Responsible *
            </label>
            <div className="space-y-2">
              {WENOV_RESPONSIBLES.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, wenov_responsible: person.name })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                    formData.wenov_responsible === person.name
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    formData.wenov_responsible === person.name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {person.initials}
                  </span>
                  <span className="font-medium">{person.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity (Metier) *
            </label>
            <select
              value={formData.entity}
              onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select an entity...</option>
              {ENTITIES.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Startup Name *
            </label>
            <input
              type="text"
              value={formData.startup_name}
              onChange={(e) => setFormData({ ...formData, startup_name: e.target.value })}
              placeholder="e.g., PayFlow, AppNova..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

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
              disabled={isPending || !formData.name.trim() || !formData.entity.trim() || !formData.startup_name.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
