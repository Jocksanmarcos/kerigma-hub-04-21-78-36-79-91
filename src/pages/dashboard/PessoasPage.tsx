import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SimpleResponsiveTabs } from '@/components/pessoas/SimpleResponsiveTabs';
import { Button } from '@/components/ui/button';
import { PessoasList } from '@/components/pessoas/PessoasList';
import { FamilyTreeView } from '@/components/pessoas/FamilyTreeView';
import { FamilyStatsCard } from '@/components/pessoas/FamilyStatsCard';
import { AniversariantesCard } from '@/components/pessoas/AniversariantesCard';
import { IADashboard } from '@/components/pessoas/IADashboard';
import { PessoasReports } from '@/components/pessoas/PessoasReports';
import { GenealogyManagement } from '@/components/pessoas/GenealogyManagement';
import { ResetUserPassword } from '@/components/admin/ResetUserPassword';
import { ArrowLeft, TreePine, Settings } from 'lucide-react';

const PessoasPage = () => {
  const [showFamilyTree, setShowFamilyTree] = useState(false);
  const [showGenealogyManagement, setShowGenealogyManagement] = useState(false);
  const [activeTab, setActiveTab] = useState('pessoas');

  if (showFamilyTree) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Árvore Genealógica das Famílias
              </h1>
              <p className="text-muted-foreground">
                Visualize as relações familiares e vínculos da comunidade
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFamilyTree(false)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Pessoas</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FamilyStatsCard onViewFamilies={() => setShowFamilyTree(true)} />
            </div>
            <div className="lg:col-span-3">
              <FamilyTreeView />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showGenealogyManagement) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Gestão de Genealogia
              </h1>
              <p className="text-muted-foreground">
                Limpe e organize dados genealógicos incorretos da importação
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowGenealogyManagement(false)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Pessoas</span>
            </Button>
          </div>
          <GenealogyManagement />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Pessoas</h1>
          <p className="text-muted-foreground">
            Sistema completo com IA, relatórios e insights para gestão da congregação
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setShowFamilyTree(true)}
            size="sm"
            className="flex items-center justify-center flex-1 sm:flex-initial sm:w-auto"
          >
            <TreePine className="h-3 w-3 flex-shrink-0" />
            <span className="hidden sm:inline text-xs font-medium ml-1">Árvore Genealógica</span>
          </Button>
          <Button 
            onClick={() => setShowGenealogyManagement(true)}
            variant="outline"
            size="sm"
            className="flex items-center justify-center flex-1 sm:flex-initial sm:w-auto"
          >
            <Settings className="h-3 w-3 flex-shrink-0" />
            <span className="hidden sm:inline text-xs font-medium ml-1">Gestão Genealógia</span>
          </Button>
        </div>

        <SimpleResponsiveTabs activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'pessoas' && (
            <div className="space-y-6">
              <PessoasList />
            </div>
          )}

          {activeTab === 'aniversarios' && (
            <AniversariantesCard />
          )}

          {activeTab === 'relatorios' && (
            <div className="space-y-6">
              <div className="mb-6">
                <ResetUserPassword />
              </div>
              <PessoasReports />
            </div>
          )}

          {activeTab === 'estatisticas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <FamilyStatsCard onViewFamilies={() => setShowFamilyTree(true)} />
              </div>
              <div className="lg:col-span-2">
                <IADashboard />
              </div>
            </div>
          )}
        </SimpleResponsiveTabs>
      </div>
    </AppLayout>
  );
};

export default PessoasPage;