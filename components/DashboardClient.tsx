'use client';

import { useState, useMemo } from 'react';
import { computeKpis, filterChallenges } from '@/lib/utils';
import { Challenge, Filters, FilterType } from '@/lib/types';
import KpiBar from '@/components/KpiBar';
import FiltersBar from '@/components/FiltersBar';
import ChallengesTable from '@/components/ChallengesTable';
import AddChallengeModal from '@/components/AddChallengeModal';

interface DashboardClientProps {
  challenges: Challenge[];
  entities: string[];
  wenovOwners: string[];
}

export default function DashboardClient({ challenges, entities, wenovOwners }: DashboardClientProps) {
  const [filters, setFilters] = useState<Filters>({
    activeFilter: 'all',
    search: '',
    entity: '',
    wenovOwner: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const kpis = useMemo(() => computeKpis(challenges), [challenges]);
  const filteredChallenges = useMemo(
    () => filterChallenges(challenges, filters),
    [challenges, filters]
  );

  const handleFilterChange = (newFilter: FilterType) => {
    setFilters((prev) => ({ ...prev, activeFilter: newFilter }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OpenStart Challenge Tracker</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {challenges.length} Active Challenges
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Challenge
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Bar */}
        <KpiBar
          kpis={kpis}
          activeFilter={filters.activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Filters Bar */}
        <FiltersBar
          filters={filters}
          entities={entities}
          wenovOwners={wenovOwners}
          onFiltersChange={setFilters}
        />

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredChallenges.length} of {challenges.length} challenges
        </div>

        {/* Challenges Table */}
        <ChallengesTable challenges={filteredChallenges} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            OpenStart Challenge Tracker - Powered by Next.js
          </p>
        </div>
      </footer>

      {/* Add Challenge Modal */}
      <AddChallengeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
