import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PessoasHeader } from '@/features/pessoas-refactored/components/PessoasHeader';
import { PessoasStats } from '@/features/pessoas-refactored/components/PessoasStats';
import { PessoasFilters } from '@/features/pessoas-refactored/components/PessoasFilters';
import { PessoasDataView } from '@/features/pessoas-refactored/components/PessoasDataView';
import { PessoaFormModal } from '@/features/pessoas-refactored/components/PessoaFormModal';
import { FamilyTreeModal } from '@/features/pessoas-refactored/components/FamilyTreeModal';
import { GenealogyModal } from '@/features/pessoas-refactored/components/GenealogyModal';
import { usePessoasData } from '@/features/pessoas-refactored/hooks/usePessoasData';
import { usePessoasFilters } from '@/features/pessoas-refactored/hooks/usePessoasFilters';

const PessoasRefactoredPage = () => {
  const [showPessoaForm, setShowPessoaForm] = useState(false);
  const [showFamilyTree, setShowFamilyTree] = useState(false);
  const [showGenealogy, setShowGenealogy] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { filters, updateFilter, clearFilters } = usePessoasFilters();
  const { pessoas, isLoading, stats, refetch } = usePessoasData(filters);

  const handleCreatePessoa = () => {
    setSelectedPessoa(null);
    setShowPessoaForm(true);
  };

  const handleEditPessoa = (pessoa: any) => {
    setSelectedPessoa(pessoa);
    setShowPessoaForm(true);
  };

  const handleCloseForm = () => {
    setShowPessoaForm(false);
    setSelectedPessoa(null);
    refetch();
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <PessoasHeader
          onCreatePessoa={handleCreatePessoa}
          onShowFamilyTree={() => setShowFamilyTree(true)}
          onShowGenealogy={() => setShowGenealogy(true)}
        />

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Estatísticas */}
          <PessoasStats stats={stats} isLoading={isLoading} />

          {/* Filtros */}
          <PessoasFilters
            filters={filters}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Visualização dos dados */}
          <PessoasDataView
            pessoas={pessoas}
            isLoading={isLoading}
            viewMode={viewMode}
            onEditPessoa={handleEditPessoa}
          />
        </div>

        {/* Modais */}
        <PessoaFormModal
          open={showPessoaForm}
          onClose={handleCloseForm}
          pessoa={selectedPessoa}
        />

        <FamilyTreeModal
          open={showFamilyTree}
          onClose={() => setShowFamilyTree(false)}
        />

        <GenealogyModal
          open={showGenealogy}
          onClose={() => setShowGenealogy(false)}
        />
      </div>
    </AppLayout>
  );
};

export default PessoasRefactoredPage;