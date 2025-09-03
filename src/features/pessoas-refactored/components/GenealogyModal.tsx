import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GenealogyManagement } from '@/components/pessoas/GenealogyManagement';

interface GenealogyModalProps {
  open: boolean;
  onClose: () => void;
}

export const GenealogyModal: React.FC<GenealogyModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Gestão de Genealogia</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <GenealogyManagement />
        </div>
      </DialogContent>
    </Dialog>
  );
};