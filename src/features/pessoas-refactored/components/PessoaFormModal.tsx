import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PessoaDialog } from '@/components/pessoas/PessoaDialog';

interface PessoaFormModalProps {
  open: boolean;
  onClose: () => void;
  pessoa?: any;
}

export const PessoaFormModal: React.FC<PessoaFormModalProps> = ({
  open,
  onClose,
  pessoa,
}) => {
  return (
    <PessoaDialog 
      open={open}
      onOpenChange={onClose}
      pessoa={pessoa}
      onSuccess={onClose}
    />
  );
};