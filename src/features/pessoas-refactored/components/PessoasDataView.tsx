import React from 'react';
import { PessoasListView } from './PessoasListView';
import { PessoasGridView } from './PessoasGridView';
import { PessoasLoadingSkeleton } from './PessoasLoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface PessoasDataViewProps {
  pessoas: any[];
  isLoading: boolean;
  viewMode: 'list' | 'grid';
  onEditPessoa: (pessoa: any) => void;
}

export const PessoasDataView: React.FC<PessoasDataViewProps> = ({
  pessoas,
  isLoading,
  viewMode,
  onEditPessoa,
}) => {
  if (isLoading) {
    return <PessoasLoadingSkeleton viewMode={viewMode} />;
  }

  if (pessoas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma pessoa encontrada
            </h3>
            <p className="text-muted-foreground">
              Não há pessoas que correspondam aos filtros selecionados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {viewMode === 'list' ? (
          <PessoasListView pessoas={pessoas} onEditPessoa={onEditPessoa} />
        ) : (
          <PessoasGridView pessoas={pessoas} onEditPessoa={onEditPessoa} />
        )}
      </CardContent>
    </Card>
  );
};