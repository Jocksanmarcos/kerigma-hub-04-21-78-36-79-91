import React from 'react';
import { FamilyStatsCard } from '@/components/pessoas/FamilyStatsCard';
import { IADashboard } from '@/components/pessoas/IADashboard';

interface StatsDashboardV2Props {
  onViewFamilies: () => void;
}

export const StatsDashboardV2: React.FC<StatsDashboardV2Props> = ({ onViewFamilies }) => {
  return (
    <div className="space-y-4">
      {/* Mobile-First Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Family Stats - Full width on mobile, 1/3 on desktop */}
        <div className="lg:col-span-1">
          <FamilyStatsCard onViewFamilies={onViewFamilies} />
        </div>
        
        {/* IA Dashboard - Full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2">
          <IADashboard />
        </div>
      </div>
    </div>
  );
};