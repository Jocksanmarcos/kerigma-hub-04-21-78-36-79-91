import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MobileFirstTabs } from '@/components/pessoas-v2/MobileFirstTabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TreePine, Settings } from 'lucide-react';

// Componentes das abas - versões mobile-first
import { PessoasListV2 } from '@/components/pessoas-v2/PessoasListV2';
import { AniversariantesCardV2 } from '@/components/pessoas-v2/AniversariantesCardV2';
import { PessoasReportsV2 } from '@/components/pessoas-v2/PessoasReportsV2';
import { StatsDashboardV2 } from '@/components/pessoas-v2/StatsDashboardV2';

// Componentes especiais (preservando funcionalidade)
import { FamilyTreeView } from '@/components/pessoas/FamilyTreeView';
import { GenealogyManagement } from '@/components/pessoas/GenealogyManagement';
import { FamilyStatsCard } from '@/components/pessoas/FamilyStatsCard';

const PessoasV2Page = () => {
  const [showFamilyTree, setShowFamilyTree] = useState(false);
  const [showGenealogyManagement, setShowGenealogyManagement] = useState(false);
  const [activeTab, setActiveTab] = useState('pessoas');

  // Árvore genealógica (preservando funcionalidade existente)
  if (showFamilyTree) {
    return (
      <AppLayout>
        <div className="min-h-screen p-4 space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Árvore Genealógica
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visualize as relações familiares
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFamilyTree(false)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-1/4">
                <FamilyStatsCard onViewFamilies={() => setShowFamilyTree(true)} />
              </div>
              <div className="w-full lg:w-3/4">
                <FamilyTreeView />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Gestão de genealogia (preservando funcionalidade existente)
  if (showGenealogyManagement) {
    return (
      <AppLayout>
        <div className="min-h-screen p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Gestão de Genealogia
              </h1>
              <p className="text-sm text-muted-foreground">
                Limpe e organize dados genealógicos
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowGenealogyManagement(false)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          </div>
          <GenealogyManagement />
        </div>
      </AppLayout>
    );
  }

  // Interface principal - mobile-first
  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header Mobile-First */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="p-4 space-y-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Gestão de Pessoas
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema completo com IA e relatórios
              </p>
            </div>
            
            {/* Botões de ação principais - Mobile-First */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => setShowFamilyTree(true)}
                size="sm"
                className="flex items-center justify-center w-full sm:w-auto"
              >
                <TreePine className="h-4 w-4 mr-2" />
                <span>Árvore Genealógica</span>
              </Button>
              <Button 
                onClick={() => setShowGenealogyManagement(true)}
                variant="outline"
                size="sm"
                className="flex items-center justify-center w-full sm:w-auto"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Gestão Genealógia</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Sistema de Abas Mobile-First */}
        <div className="p-4">
          <MobileFirstTabs activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'pessoas' && <PessoasListV2 />}
            {activeTab === 'aniversarios' && <AniversariantesCardV2 />}
            {activeTab === 'relatorios' && <PessoasReportsV2 />}
            {activeTab === 'estatisticas' && <StatsDashboardV2 onViewFamilies={() => setShowFamilyTree(true)} />}
          </MobileFirstTabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default PessoasV2Page;