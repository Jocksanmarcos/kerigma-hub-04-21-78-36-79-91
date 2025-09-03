import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Users, Target, Lightbulb, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

interface AnalyticsData {
  total_pessoas: number;
  total_membros: number;
  total_visitantes: number;
  total_lideres: number;
  crescimento_mensal: number;
  faixa_etaria_predominante: string;
  engagement_score: number;
  insights: {
    recomendacao_crescimento: string;
    acao_sugerida: string;
    prioridade_faixa_etaria: string;
    score_saude: string;
  };
}

const CORES_GRAFICO = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const IADashboard: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['pessoas-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_pessoas_analytics');
      if (error) throw error;
      return data[0] as AnalyticsData;
    },
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
  });

  // Dados para o gráfico de barras
  const dadosGrafico = analytics ? [
    { nome: 'Membros', quantidade: analytics.total_membros, cor: '#3b82f6' },
    { nome: 'Visitantes', quantidade: analytics.total_visitantes, cor: '#10b981' },
    { nome: 'Líderes', quantidade: analytics.total_lideres, cor: '#f59e0b' },
  ] : [];

  // Dados para o gráfico de pizza do engagement
  const dadosEngagement = analytics ? [
    { nome: 'Completo', valor: analytics.engagement_score },
    { nome: 'Incompleto', valor: 100 - analytics.engagement_score },
  ] : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (health: string) => {
    const variants = {
      'Excelente': 'default',
      'Bom': 'secondary',
      'Regular': 'outline',
      'Precisa de atenção': 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[health as keyof typeof variants] || 'outline'}>
        {health}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <ResponsiveGrid columns={{ default: 1, md: 2, lg: 3 }} gap={6}>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-32" />
              <div className="h-3 bg-muted animate-pulse rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </ResponsiveGrid>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Não foi possível carregar os dados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Score Geral */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Dashboard Inteligente - Gestão de Pessoas
          </CardTitle>
          <CardDescription>
            Insights gerados por IA para otimizar a gestão da sua igreja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid columns={{ default: 1, md: 3 }} gap={4}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analytics.engagement_score)}`}>
                {Math.round(analytics.engagement_score)}%
              </div>
              <p className="text-sm text-muted-foreground">Score de Engajamento</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${analytics.crescimento_mensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.crescimento_mensal > 0 ? '+' : ''}{Math.round(analytics.crescimento_mensal)}%
              </div>
              <p className="text-sm text-muted-foreground">Crescimento Mensal</p>
            </div>
            <div className="text-center">
              {getHealthBadge(analytics.insights.score_saude)}
              <p className="text-sm text-muted-foreground mt-1">Status Geral</p>
            </div>
          </ResponsiveGrid>
        </CardContent>
      </Card>

      {/* Gráficos e Métricas */}
      <ResponsiveGrid columns={{ default: 1, lg: 2 }} gap={6}>
        {/* Distribuição por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score de Engajamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Completude de Dados
            </CardTitle>
            <CardDescription>
              Nível de informações coletadas das pessoas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Score de Engajamento</span>
                  <span className="text-sm text-muted-foreground">{Math.round(analytics.engagement_score)}%</span>
                </div>
                <Progress value={analytics.engagement_score} />
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={dadosEngagement}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="valor"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Insights e Recomendações */}
      <ResponsiveGrid columns={{ default: 1, lg: 2 }} gap={6}>
        {/* Recomendações de Crescimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Recomendações de Crescimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Estratégia Principal</p>
                <p className="text-sm text-muted-foreground">{analytics.insights.recomendacao_crescimento}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Próxima Ação</p>
                <p className="text-sm text-muted-foreground">{analytics.insights.acao_sugerida}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights Demográficos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Insights Demográficos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Faixa Etária Predominante</p>
                <p className="text-sm text-muted-foreground">{analytics.insights.prioridade_faixa_etaria}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">Total de Pessoas</p>
                <p className="text-sm text-muted-foreground">
                  {analytics.total_pessoas} pessoas ativas no sistema
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </div>
  );
};