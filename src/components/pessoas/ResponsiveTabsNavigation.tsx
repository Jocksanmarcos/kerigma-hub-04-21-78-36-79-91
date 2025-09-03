import React from 'react';
import { ScrollableTabs, ScrollableTabsContent, ScrollableTabsList, ScrollableTabsTrigger } from '@/components/ui/scrollable-tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Users, Calendar, FileText, BarChart3, MoreHorizontal } from 'lucide-react';

interface ResponsiveTabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

// Priority tabs for mobile (most important 2-3 tabs)
const priorityTabs = [
  { value: 'pessoas', label: 'Pessoas', icon: Users },
  { value: 'aniversarios', label: 'Aniversários', icon: Calendar },
];

// Secondary tabs for "More..." dropdown
const secondaryTabs = [
  { value: 'relatorios', label: 'Relatórios', icon: FileText },
  { value: 'estatisticas', label: 'Estatísticas & IA', icon: BarChart3 },
];

export const ResponsiveTabsNavigation: React.FC<ResponsiveTabsNavigationProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  const isSecondaryTabActive = secondaryTabs.some(tab => tab.value === activeTab);

  return (
    <ScrollableTabs value={activeTab} onValueChange={onTabChange} className="w-full">
      {/* Desktop/Tablet - Full tabs list */}
      <div className="hidden md:block">
        <ScrollableTabsList>
          {priorityTabs.map((tab) => (
            <ScrollableTabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </ScrollableTabsTrigger>
          ))}
          {secondaryTabs.map((tab) => (
            <ScrollableTabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </ScrollableTabsTrigger>
          ))}
        </ScrollableTabsList>
      </div>

      {/* Mobile - Priority tabs + More dropdown */}
      <div className="md:hidden">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-kerigma shadow-kerigma">
          {/* Priority tabs */}
          {priorityTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange(tab.value)}
              className={`flex-1 flex items-center gap-2 h-9 ${
                activeTab === tab.value 
                  ? "bg-background text-primary shadow-kerigma" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          ))}

          {/* More dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={isSecondaryTabActive ? "default" : "ghost"}
                size="sm"
                className={`flex-shrink-0 h-9 px-3 flex items-center gap-1 ${
                  isSecondaryTabActive 
                    ? "bg-background text-primary shadow-kerigma" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="text-xs font-medium">Mais</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="min-w-[180px] bg-background border shadow-lg z-50"
              sideOffset={8}
            >
              {secondaryTabs.map((tab) => (
                <DropdownMenuItem key={tab.value} asChild>
                  <button
                    onClick={() => onTabChange(tab.value)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer w-full ${
                      activeTab === tab.value 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {children}
    </ScrollableTabs>
  );
};