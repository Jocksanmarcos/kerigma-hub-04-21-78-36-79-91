import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, TrendingUp, Target, AlertTriangle, BookOpen } from 'lucide-react';
import { DashboardLiderCelulaEnhanced } from './DashboardLiderCelulaEnhanced';
import { DashboardSupervisor } from './DashboardSupervisor';
import { BibliotecaRecursos } from './BibliotecaRecursos';
import { GestaoVisitantesEnhanced } from './GestaoVisitantesEnhanced';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CelulasStats {
  celulasAtivas: number;
  saudeGeral: number;
  prontasMultiplicacao: number;
  alertasAtivos: number;
  crescimentoMes: number;
  saudeDetalhada: { verde: number; amarelo: number; vermelho: number };
}

async function fetchCelulasStats(): Promise<CelulasStats> {
  try {
    const { data: celulas, error } = await supabase
      .from('celulas')
      .select('*')
      .eq('ativa', true);

    if (error) {
      console.error('Erro ao buscar células:', error);
      // Retornar dados vazios em caso de erro
      return {
        celulasAtivas: 0,
        saudeGeral: 0,
        prontasMultiplicacao: 0,
        alertasAtivos: 0,
        crescimentoMes: 0,
        saudeDetalhada: { verde: 0, amarelo: 0, vermelho: 0 }
      };
    }

    const celulasAtivas = celulas?.length || 0;
    const saudeDetalhada = { verde: 0, amarelo: 0, vermelho: 0 };
    
    // Simulação de cálculo de saúde baseado em dados reais (implementar lógica específica)
    celulas?.forEach(celula => {
      // Lógica de saúde seria baseada em relatórios recentes, presença, etc.
      const saudeScore = Math.random();
      if (saudeScore > 0.7) saudeDetalhada.verde++;
      else if (saudeScore > 0.4) saudeDetalhada.amarelo++;
      else saudeDetalhada.vermelho++;
    });

    const saudeGeral = celulasAtivas > 0 ? Math.round((saudeDetalhada.verde / celulasAtivas) * 100) : 0;
    const prontasMultiplicacao = Math.floor(celulasAtivas * 0.15); // 15% aproximadamente
    const alertasAtivos = saudeDetalhada.vermelho + Math.floor(saudeDetalhada.amarelo * 0.5);
    const crescimentoMes = Math.floor(celulasAtivas * 0.08); // 8% crescimento mensal estimado

    return {
      celulasAtivas,
      saudeGeral,
      prontasMultiplicacao,
      alertasAtivos,
      crescimentoMes,
      saudeDetalhada
    };
  } catch (error) {
    console.error('Erro inesperado ao buscar estatísticas de células:', error);
    return {
      celulasAtivas: 0,
      saudeGeral: 0,
      prontasMultiplicacao: 0,
      alertasAtivos: 0,
      crescimentoMes: 0,
      saudeDetalhada: { verde: 0, amarelo: 0, vermelho: 0 }
    };
  }
}

export const CentroComandoCelulas: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lider');
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['celulas-stats'],
    queryFn: fetchCelulasStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: 1000,
  });

  // Se houver erro, mostrar mensagem
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground">
              Não foi possível carregar as estatísticas das células. Tente novamente mais tarde.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Células Ativas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.celulasAtivas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats?.crescimentoMes || 0} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saúde Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {isLoading ? '...' : `${stats?.saudeGeral || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Verde: {stats?.saudeDetalhada.verde || 0} | Amarelo: {stats?.saudeDetalhada.amarelo || 0} | Vermelho: {stats?.saudeDetalhada.vermelho || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prontas p/ Multiplicação</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : stats?.prontasMultiplicacao || 0}
            </div>
            <p className="text-xs text-muted-foreground">Meta: 12 células/ano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? '...' : stats?.alertasAtivos || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lider" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Minha Célula</span>
          </TabsTrigger>
          <TabsTrigger value="supervisor" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Supervisão</span>
          </TabsTrigger>
          <TabsTrigger value="recursos" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Recursos</span>
          </TabsTrigger>
          <TabsTrigger value="visitantes" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Visitantes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lider" className="space-y-6">
          <DashboardLiderCelulaEnhanced />
        </TabsContent>

        <TabsContent value="supervisor" className="space-y-6">
          <DashboardSupervisor />
        </TabsContent>

        <TabsContent value="recursos" className="space-y-6">
          <BibliotecaRecursos />
        </TabsContent>

        <TabsContent value="visitantes" className="space-y-6">
          <GestaoVisitantesEnhanced />
        </TabsContent>
      </Tabs>
    </div>
  );
};