import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CelulaSupervisao {
  id: string;
  nome: string;
  lider_nome: string;
  lider_id: string;
  membros_total: number;
  presentes_ultima: number;
  visitantes_ultima: number;
  data_ultimo_relatorio: string | null;
  status_saude: 'excelente' | 'boa' | 'atencao' | 'critica';
  crescimento_percentual: number;
  relatorios_pendentes: number;
}

interface InsightSupervisao {
  id: string;
  tipo_insight: string;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  celula_relacionada?: string;
}

export const DashboardSupervisor: React.FC = () => {
  const [filtroSaude, setFiltroSaude] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const { pessoa } = useCurrentPerson();

  // Buscar células sob supervisão
  const { data: celulas, isLoading: loadingCelulas } = useQuery({
    queryKey: ['celulas-supervisao', pessoa?.id],
    queryFn: async () => {
      if (!pessoa?.id) return [];

      const { data, error } = await supabase
        .from('celulas')
        .select(`
          id,
          nome,
          lider:pessoas!lider_id(id, nome_completo),
          membros:pessoas!celula_id(count),
          relatorios:relatorios_celulas!celula_id(
            data_reuniao,
            presentes,
            visitantes,
            status,
            created_at
          )
        `)
        .eq('supervisor_id', pessoa.id);

      if (error) {
        console.error('Erro ao buscar células:', error);
        return [];
      }

      return data.map(celula => {
        const ultimoRelatorio = celula.relatorios?.[0];
        const relatorioAnterior = celula.relatorios?.[1];
        const crescimento = relatorioAnterior ? 
          ((ultimoRelatorio?.presentes || 0) - relatorioAnterior.presentes) / relatorioAnterior.presentes * 100 : 0;

        let statusSaude: CelulaSupervisao['status_saude'] = 'boa';
        if (!ultimoRelatorio) statusSaude = 'critica';
        else if (ultimoRelatorio.presentes >= (celula.membros?.[0]?.count || 0) * 0.8) statusSaude = 'excelente';
        else if (ultimoRelatorio.presentes >= (celula.membros?.[0]?.count || 0) * 0.6) statusSaude = 'boa';
        else statusSaude = 'atencao';

        return {
          id: celula.id,
          nome: celula.nome,
          lider_nome: celula.lider?.nome_completo || 'Sem líder',
          lider_id: celula.lider?.id || '',
          membros_total: celula.membros?.[0]?.count || 0,
          presentes_ultima: ultimoRelatorio?.presentes || 0,
          visitantes_ultima: ultimoRelatorio?.visitantes || 0,
          data_ultimo_relatorio: ultimoRelatorio?.data_reuniao,
          status_saude: statusSaude,
          crescimento_percentual: crescimento,
          relatorios_pendentes: celula.relatorios?.filter(r => r.status === 'pendente').length || 0
        } as CelulaSupervisao;
      });
    },
    enabled: !!pessoa?.id
  });

  // Buscar insights de supervisão
  const { data: insights } = useQuery({
    queryKey: ['insights-supervisao', pessoa?.id],
    queryFn: async () => {
      if (!pessoa?.id) return [];

      const { data, error } = await supabase
        .from('insights_celulas')
        .select('*')
        .eq('nivel_hierarquia', 'supervisao')
        .eq('entidade_id', pessoa.id)
        .eq('ativo', true)
        .order('prioridade', { ascending: false });

      if (error) {
        console.error('Erro ao buscar insights:', error);
        return [];
      }

      return data.map(d => ({
        id: d.id,
        tipo_insight: d.tipo_insight,
        titulo: d.titulo,
        descricao: d.descricao,
        prioridade: d.prioridade as 'baixa' | 'media' | 'alta' | 'critica',
        celula_relacionada: d.entidade_id
      })) as InsightSupervisao[];
    },
    enabled: !!pessoa?.id
  });

  const celulasFiltradas = celulas?.filter(celula => {
    const matchBusca = celula.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      celula.lider_nome.toLowerCase().includes(busca.toLowerCase());
    const matchSaude = filtroSaude === 'todos' || celula.status_saude === filtroSaude;
    return matchBusca && matchSaude;
  }) || [];

  const estatisticas = celulas ? {
    totalCelulas: celulas.length,
    celulasSaudaveis: celulas.filter(c => c.status_saude === 'excelente').length,
    relatoriosPendentes: celulas.reduce((acc, c) => acc + c.relatorios_pendentes, 0),
    crescimentoMedio: celulas.reduce((acc, c) => acc + c.crescimento_percentual, 0) / celulas.length
  } : { totalCelulas: 0, celulasSaudaveis: 0, relatoriosPendentes: 0, crescimentoMedio: 0 };

  if (loadingCelulas) {
    return <div className="p-6">Carregando dados de supervisão...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Supervisão de Células</h1>
          <p className="text-muted-foreground">Visão geral das células sob sua supervisão</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Células</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalCelulas}</div>
            <p className="text-xs text-muted-foreground">Sob sua supervisão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Células Saudáveis</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.celulasSaudaveis}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.totalCelulas > 0 ? 
                `${Math.round(estatisticas.celulasSaudaveis / estatisticas.totalCelulas * 100)}%` : 
                '0%'
              } do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.relatoriosPendentes}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.crescimentoMedio > 0 ? '+' : ''}{estatisticas.crescimentoMedio.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Presença vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Supervisão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar célula ou líder..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={filtroSaude} onValueChange={setFiltroSaude}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por saúde" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as células</SelectItem>
                <SelectItem value="excelente">Excelentes</SelectItem>
                <SelectItem value="boa">Boas</SelectItem>
                <SelectItem value="atencao">Precisam atenção</SelectItem>
                <SelectItem value="critica">Críticas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="celulas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="celulas">Células ({celulasFiltradas.length})</TabsTrigger>
          <TabsTrigger value="insights">
            Insights ({insights?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="celulas" className="space-y-4">
          <div className="grid gap-4">
            {celulasFiltradas.map(celula => (
              <Card key={celula.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{celula.nome}</h3>
                        <Badge 
                          variant={
                            celula.status_saude === 'excelente' ? 'default' :
                            celula.status_saude === 'boa' ? 'secondary' :
                            celula.status_saude === 'atencao' ? 'outline' : 'destructive'
                          }
                        >
                          {celula.status_saude}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Líder: {celula.lider_nome}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span>Membros: {celula.membros_total}</span>
                        <span>Presentes: {celula.presentes_ultima}</span>
                        <span>Visitantes: {celula.visitantes_ultima}</span>
                        {celula.data_ultimo_relatorio && (
                          <span>
                            Último relatório: {format(new Date(celula.data_ultimo_relatorio), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights?.map(insight => (
              <Card key={insight.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{insight.titulo}</h3>
                        <Badge 
                          variant={
                            insight.prioridade === 'critica' ? 'destructive' :
                            insight.prioridade === 'alta' ? 'default' :
                            insight.prioridade === 'media' ? 'secondary' : 'outline'
                          }
                        >
                          {insight.prioridade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.descricao}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Nenhum insight disponível no momento</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Funcionalidade de relatórios em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};