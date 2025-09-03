import React, { useState } from 'react';
import { Users, UserCheck, UserX, Calendar, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface PessoasSegmentedNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const PessoasSegmentedNavigation: React.FC<PessoasSegmentedNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const navigationItems: NavigationItem[] = [
    { id: 'diretorio', label: 'Diretório', icon: Users },
    { id: 'membros', label: 'Membros', icon: UserCheck, badge: 247 },
    { id: 'visitantes', label: 'Visitantes', icon: UserX, badge: 12 },
    { id: 'aniversarios', label: 'Aniversários', icon: Calendar },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'configuracoes', label: 'Config', icon: Settings }
  ];

  return (
    <div className="w-full">
      {/* Mobile: Horizontal scrollable tabs */}
      <div className="block lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 min-w-fit",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-kerigma"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-responsive-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary text-primary-foreground"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Grid layout with expandable cards */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "group relative flex flex-col items-center gap-3 p-6 rounded-kerigma transition-all duration-300 hover:-translate-y-1",
                  isActive
                    ? "bg-kerigma-gradient text-white shadow-kerigma-xl"
                    : "bg-card border border-border hover:shadow-kerigma-md"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-white/20"
                    : "bg-primary/10 group-hover:bg-primary/20"
                )}>
                  <Icon className={cn(
                    "h-6 w-6 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-primary"
                  )} />
                </div>
                
                <div className="text-center">
                  <h3 className={cn(
                    "font-semibold text-responsive-sm",
                    isActive
                      ? "text-white"
                      : "text-foreground"
                  )}>
                    {item.label}
                  </h3>
                  
                  {item.badge && (
                    <div className={cn(
                      "mt-1 px-2 py-0.5 rounded-full text-xs font-semibold inline-block",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    )}>
                      {item.badge}
                    </div>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};