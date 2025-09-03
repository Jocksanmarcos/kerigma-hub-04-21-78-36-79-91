import React from 'react';
import { Users, Calendar, FileText, BarChart3 } from 'lucide-react';

interface SimpleResponsiveTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const tabs = [
  { value: 'pessoas', label: 'Pessoas', shortLabel: 'Pessoas', icon: Users },
  { value: 'aniversarios', label: 'Aniversários', shortLabel: 'Aniver.', icon: Calendar },
  { value: 'relatorios', label: 'Relatórios', shortLabel: 'Relat.', icon: FileText },
  { value: 'estatisticas', label: 'Estatísticas & IA', shortLabel: 'Stats', icon: BarChart3 },
];

export const SimpleResponsiveTabs: React.FC<SimpleResponsiveTabsProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <div className="w-full">
      {/* Expandable icon tabs navigation */}
      <div className="mb-6">
        <nav className="flex items-center bg-muted/50 rounded-full p-1 overflow-x-auto max-w-fit mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`
                  flex items-center justify-center rounded-full px-3 py-2 cursor-pointer 
                  transition-all duration-300 ease-in-out whitespace-nowrap
                  ${isActive 
                    ? 'bg-background text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span 
                  className={`
                    overflow-hidden transition-all duration-300 ease-in-out font-medium text-sm
                    ${isActive 
                      ? 'max-w-[100px] ml-2 opacity-100' 
                      : 'max-w-0 ml-0 opacity-0'
                    }
                  `}
                >
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Tab content */}
      <div>
        {children}
      </div>
    </div>
  );
};