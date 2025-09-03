import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FamilyTreeView } from '@/components/pessoas/FamilyTreeView';
import { FamilyStatsCard } from '@/components/pessoas/FamilyStatsCard';

interface FamilyTreeModalProps {
  open: boolean;
  onClose: () => void;
}

export const FamilyTreeModal: React.FC<FamilyTreeModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Árvore Genealógica das Famílias</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex gap-4">
          <div className="w-1/4">
            <FamilyStatsCard onViewFamilies={() => {}} />
          </div>
          <div className="flex-1 overflow-hidden">
            <FamilyTreeView />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};