'use client';

import { KPIs, FilterType } from '@/lib/types';

interface KpiBarProps {
  kpis: KPIs;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

interface KpiTileProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  onClick: () => void;
}

function KpiTile({ label, value, icon, bgColor, textColor, isActive, onClick }: KpiTileProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-4 rounded-xl transition-all duration-200 ${bgColor} ${
        isActive ? 'ring-2 ring-offset-2 ring-gray-900 shadow-lg scale-105' : 'hover:shadow-md hover:scale-102'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${textColor}`}>{icon}</div>
        <div className="text-left">
          <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
          <div className={`text-sm ${textColor} opacity-80`}>{label}</div>
        </div>
      </div>
    </button>
  );
}

export default function KpiBar({ kpis, activeFilter, onFilterChange }: KpiBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiTile
        label="Challenges"
        value={kpis.challengesCount}
        icon={<span>🎯</span>}
        bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
        textColor="text-indigo-700"
        isActive={activeFilter === 'all'}
        onClick={() => onFilterChange('all')}
      />
      <KpiTile
        label="Actions AWB"
        value={kpis.actionsAWB}
        icon={<span>🟠</span>}
        bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
        textColor="text-orange-700"
        isActive={activeFilter === 'awb'}
        onClick={() => onFilterChange('awb')}
      />
      <KpiTile
        label="Actions Startup"
        value={kpis.actionsStartup}
        icon={<span>🔵</span>}
        bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
        textColor="text-blue-700"
        isActive={activeFilter === 'startup'}
        onClick={() => onFilterChange('startup')}
      />
      <KpiTile
        label="Alerts"
        value={kpis.alertsCount}
        icon={<span>⚠️</span>}
        bgColor="bg-gradient-to-br from-red-50 to-red-100"
        textColor="text-red-700"
        isActive={activeFilter === 'alerts'}
        onClick={() => onFilterChange('alerts')}
      />
    </div>
  );
}
