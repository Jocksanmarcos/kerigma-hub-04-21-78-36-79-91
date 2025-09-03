import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';

export const AcoesEmMassa: React.FC = () => {
  const handleLembreteRelatorios = () => {
    toast.success('Lembretes enviados para todos os líderes de célula');
  };

  const handleMapaCelulas = () => {
    // Implementar navegação para mapa de células
    toast.info('Abrindo mapa de células...');
  };

  const handleRelatorioGeral = () => {
    toast.success('Relatório geral sendo gerado...');
  };

  const handleTreinamentoLideres = () => {
    toast.info('Redirecionando para área de treinamento...');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações em Massa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={handleLembreteRelatorios}
          >
            <AlertTriangle className="h-6 w-6" />
            <span className="text-sm">Lembrete Relatórios</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={handleMapaCelulas}
          >
            <MapPin className="h-6 w-6" />
            <span className="text-sm">Mapa de Células</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={handleRelatorioGeral}
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm">Relatório Geral</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={handleTreinamentoLideres}
          >
            <Users className="h-6 w-6" />
            <span className="text-sm">Treinamento Líderes</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};