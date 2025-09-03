import React from 'react';
import { List, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'list' | 'cards';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCount: number;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  totalCount
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-responsive-sm text-muted-foreground">
        Exibindo {totalCount} pessoa{totalCount !== 1 ? 's' : ''}
      </div>
      
      <div className="flex items-center border rounded-lg overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={cn(
            "rounded-none px-3 py-2",
            viewMode === 'list'
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <List className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Lista</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('cards')}
          className={cn(
            "rounded-none px-3 py-2 border-l",
            viewMode === 'cards'
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <Grid3X3 className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Cards</span>
        </Button>
      </div>
    </div>
  );
};