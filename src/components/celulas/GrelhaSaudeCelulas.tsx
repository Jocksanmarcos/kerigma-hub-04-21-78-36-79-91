import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Eye, Calendar, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CelulaSaude {
  id: string;
  nome: string;
  lider: string;
  status: 'verde' | 'amarelo' | 'vermelho';
  membros: number;
  presencaMedia: number;
  visitantesUltimo: number;
  ultimoRelatorio: string;
  bairro?: string;
}

async function fetchGrelhaSaudeCelulas(): Promise<CelulaSaude[]> {
  try {
    const { data: celulas, error } = await supabase
      .from('celulas')
      .select(`
        id,
        nome,
        bairro,
        lider:pessoas!lider_id(nome_completo)
      `)
      .eq('ativa', true);

    if (error) throw error;

    // Simular dados de saúde das células
    const celulasSaude: CelulaSaude[] = [
      {
        id: '1',
        nome: 'Célula Central',
        lider: 'Sem líder',
        status: 'verde',
        membros: 5,
        presencaMedia: 8,
        visitantesUltimo: 3,
        ultimoRelatorio: '1 dia atrás',
        bairro: 'Centro'
      },
      {
        id: '2',
        nome: 'Célula Zona Sul',
        lider: 'Sem líder',
        status: 'amarelo',
        membros: 24,
        presencaMedia: 5,
        visitantesUltimo: 1,
        ultimoRelatorio: '2 dias atrás',
        bairro: 'Zona Sul'
      },
      {
        id: '3',
        nome: 'Célula Jovem',
        lider: 'Sem líder',
        status: 'vermelho',
        membros: 15,
        presencaMedia: 11,
        visitantesUltimo: 3,
        ultimoRelatorio: '1 semana atrás',
        bairro: 'Centro'
      }
    ];

    return celulasSaude;
  } catch (error) {
    console.error('Erro ao buscar grelha de saúde:', error);
    return [];
  }
}

export const GrelhaSaudeCelulas: React.FC = () => {
  const { data: celulas = [], isLoading } = useQuery({
    queryKey: ['grelha-saude-celulas'],
    queryFn: fetchGrelhaSaudeCelulas,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const handleVerDetalhes = (celula: CelulaSaude) => {
    toast.info(`Abrindo detalhes de ${celula.nome}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verde':
        return 'bg-emerald-500';
      case 'amarelo':
        return 'bg-yellow-500';
      case 'vermelho':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verde':
        return 'Verde';
      case 'amarelo':
        return 'Amarelo';
      case 'vermelho':
        return 'Vermelho';
      default:
        return 'Desconhecido';
    }
  };

  const getCardBorder = (status: string) => {
    switch (status) {
      case 'verde':
        return 'border-l-emerald-500';
      case 'amarelo':
        return 'border-l-yellow-500';
      case 'vermelho':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Grelha de Saúde das Células</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visão geral do status de todas as células sob sua supervisão
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando dados de saúde...
          </div>
        ) : celulas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma célula encontrada
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {celulas.map((celula) => (
              <Card key={celula.id} className={`border-l-4 ${getCardBorder(celula.status)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{celula.nome}</CardTitle>
                    <Badge className={`text-white ${getStatusColor(celula.status)}`}>
                      {getStatusBadge(celula.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Líder: {celula.lider}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Membros:</span>
                    <span className="font-medium">{celula.membros}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Presença Média:</span>
                    <span className="font-medium">{celula.presencaMedia}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Visitantes (último):</span>
                    <span className="font-medium">{celula.visitantesUltimo}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Último Relatório:</span>
                    <span className="font-medium">{celula.ultimoRelatorio}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => handleVerDetalhes(celula)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};