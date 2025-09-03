import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewSelectorProps {
  viewMode: 'lista' | 'cards';
  onChange: (mode: 'lista' | 'cards') => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({ viewMode, onChange }) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={viewMode === 'lista' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('lista')}
        className={cn(
          "flex items-center gap-2 px-3 py-2",
          viewMode === 'lista' && "bg-background shadow-sm"
        )}
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">Lista</span>
      </Button>
      <Button
        variant={viewMode === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('cards')}
        className={cn(
          "flex items-center gap-2 px-3 py-2",
          viewMode === 'cards' && "bg-background shadow-sm"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Cards</span>
      </Button>
    </div>
  );
};