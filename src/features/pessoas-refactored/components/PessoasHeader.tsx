import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, TreePine, Settings } from 'lucide-react';

interface PessoasHeaderProps {
  onCreatePessoa: () => void;
  onShowFamilyTree: () => void;
  onShowGenealogy: () => void;
}

export const PessoasHeader: React.FC<PessoasHeaderProps> = ({
  onCreatePessoa,
  onShowFamilyTree,
  onShowGenealogy,
}) => {
  return (
    <Card className="border-b rounded-none bg-gradient-subtle">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Gestão de Pessoas
            </h1>
            <p className="text-muted-foreground">
              Sistema completo para gerenciar membros, visitantes e famílias
            </p>
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button 
              onClick={onCreatePessoa}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Pessoa
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onShowFamilyTree}
              className="border-primary/20 hover:bg-primary/10"
            >
              <TreePine className="h-4 w-4 mr-2" />
              Árvore Genealógica
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onShowGenealogy}
              className="border-primary/20 hover:bg-primary/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Gestão Genealogia
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};