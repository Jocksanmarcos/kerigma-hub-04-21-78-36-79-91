import React from 'react';
import { Users, Calendar, FileText, BarChart3 } from 'lucide-react';

interface MobileFirstTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const tabs = [
  { value: 'pessoas', label: 'Pessoas', icon: Users },
  { value: 'aniversarios', label: 'Aniversários', icon: Calendar },
  { value: 'relatorios', label: 'Relatórios', icon: FileText },
  { value: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
];

export const MobileFirstTabs: React.FC<MobileFirstTabsProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <div className="w-full">
      {/* Mobile-First Tab Navigation */}
      <div className="mb-6">
        {/* Mobile: Bottom tab bar style */}
        <div className="sm:hidden">
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                
                return (
                  <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={`
                      flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs
                      transition-all duration-200 min-h-[60px]
                      ${isActive 
                        ? 'text-primary bg-primary/5 border-t-2 border-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="font-medium truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
          {/* Spacer for fixed bottom nav */}
          <div className="h-16" />
        </div>

        {/* Desktop/Tablet: Horizontal tabs */}
        <div className="hidden sm:block">
          <nav className="flex items-center bg-muted/30 rounded-lg p-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              
              return (
                <button
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  className={`
                    flex items-center justify-center rounded-md px-4 py-2 cursor-pointer 
                    transition-all duration-200 whitespace-nowrap text-sm font-medium
                    ${isActive 
                      ? 'bg-background text-primary shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Tab content with bottom padding for mobile nav */}
      <div className="pb-20 sm:pb-0">
        {children}
      </div>
    </div>
  );
};