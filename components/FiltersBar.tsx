'use client';

import { FilterType, Filters } from '@/lib/types';

interface FiltersBarProps {
  filters: Filters;
  entities: string[];
  wenovOwners: string[];
  onFiltersChange: (filters: Filters) => void;
}

const filterChips: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'awb', label: 'AWB' },
  { key: 'startup', label: 'Startup' },
];

export default function FiltersBar({ filters, entities, wenovOwners, onFiltersChange }: FiltersBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleFilterChange = (filter: FilterType) => {
    onFiltersChange({ ...filters, activeFilter: filter });
  };

  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, entity: e.target.value });
  };

  const handleWenovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, wenovOwner: e.target.value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search challenges or startups..."
          value={filters.search}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      {/* Filter Chips and Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => handleFilterChange(chip.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.activeFilter === chip.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-gray-300" />

        {/* Dropdown Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={filters.entity}
            onChange={handleEntityChange}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Entities</option>
            {entities.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>

          <select
            value={filters.wenovOwner}
            onChange={handleWenovChange}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All WENOV</option>
            {wenovOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
