import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  Filter, 
  BarChart3, 
  PieChart,
  Share2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { ResetUserPassword } from '@/components/admin/ResetUserPassword';

interface ReportData {
  total_pessoas: number;
  membros: number;
  visitantes: number;
  lideres: number;
  batizados: number;
  por_faixa_etaria: { [key: string]: number };
  por_estado_espiritual: { [key: string]: number };
  crescimento_ultimos_meses: { mes: string; total: number }[];
}

const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const PessoasReportsV2: React.FC = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<string>('geral');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('mes');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['pessoas-reports-v2', tipoRelatorio, periodoFiltro],
    queryFn: async () => {
      const { data: pessoas, error } = await supabase
        .from('pessoas')
        .select('*')
        .eq('situacao', 'ativo');
      
      if (error) throw error;

      // Processar dados para gerar relatório
      const total = pessoas.length;
      const membros = pessoas.filter(p => p.tipo_pessoa === 'membro').length;
      const visitantes = pessoas.filter(p => p.tipo_pessoa === 'visitante').length;
      const lideres = pessoas.filter(p => p.tipo_pessoa === 'lider').length;
      const batizados = pessoas.filter(p => p.data_batismo).length;

      // Agrupar por faixa etária
      const faixaEtaria: { [key: string]: number } = {};
      pessoas.forEach(p => {
        if (p.data_nascimento) {
          const idade = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
          if (idade <= 17) faixaEtaria['0-17'] = (faixaEtaria['0-17'] || 0) + 1;
          else if (idade <= 30) faixaEtaria['18-30'] = (faixaEtaria['18-30'] || 0) + 1;
          else if (idade <= 50) faixaEtaria['31-50'] = (faixaEtaria['31-50'] || 0) + 1;
          else if (idade <= 65) faixaEtaria['51-65'] = (faixaEtaria['51-65'] || 0) + 1;
          else faixaEtaria['65+'] = (faixaEtaria['65+'] || 0) + 1;
        }
      });

      // Agrupar por estado espiritual
      const estadoEspiritual: { [key: string]: number } = {};
      pessoas.forEach(p => {
        const estado = p.estado_espiritual || 'não informado';
        estadoEspiritual[estado] = (estadoEspiritual[estado] || 0) + 1;
      });

      // Crescimento por mês (últimos 6 meses)
      const crescimento = [];
      for (let i = 5; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const mes = format(data, 'MMM/yy', { locale: ptBR });
        const total = pessoas.filter(p => {
          const criacao = new Date(p.created_at);
          return criacao <= data;
        }).length;
        crescimento.push({ mes, total });
      }

      return {
        total_pessoas: total,
        membros,
        visitantes,
        lideres,
        batizados,
        por_faixa_etaria: faixaEtaria,
        por_estado_espiritual: estadoEspiritual,
        crescimento_ultimos_meses: crescimento,
      } as ReportData;
    }
  });

  const exportarRelatorio = () => {
    if (!reportData) return;

    const dados = {
      'Relatório de Pessoas': {
        'Data de Geração': format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        'Total de Pessoas': reportData.total_pessoas,
        'Membros': reportData.membros,
        'Visitantes': reportData.visitantes,
        'Líderes': reportData.lideres,
        'Batizados': reportData.batizados,
        'Distribuição por Faixa Etária': reportData.por_faixa_etaria,
        'Distribuição por Estado Espiritual': reportData.por_estado_espiritual,
      }
    };

    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-pessoas-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dadosFaixaEtaria = Object.entries(reportData?.por_faixa_etaria || {}).map(([faixa, quantidade]) => ({
    faixa,
    quantidade,
  }));

  const dadosEstadoEspiritual = Object.entries(reportData?.por_estado_espiritual || {}).map(([estado, quantidade]) => ({
    estado,
    quantidade,
  }));

  return (
    <div className="space-y-4">
      {/* Header com controles - Mobile-First */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Relatórios</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={exportarRelatorio}>
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        {/* Filtros - Mobile-First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geral">Relatório Geral</SelectItem>
              <SelectItem value="crescimento">Crescimento</SelectItem>
              <SelectItem value="demografico">Demográfico</SelectItem>
              <SelectItem value="espiritual">Estado Espiritual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Último mês</SelectItem>
              <SelectItem value="trimestre">Último trimestre</SelectItem>
              <SelectItem value="ano">Último ano</SelectItem>
              <SelectItem value="todos">Todos os períodos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Ferramenta de Reset de Senha */}
      <ResetUserPassword />

      {/* Métricas Principais - Mobile-First Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
        <Card className="p-3 text-center">
          <div className="text-xl sm:text-2xl font-bold text-primary">{reportData?.total_pessoas || 0}</div>
          <p className="text-xs text-muted-foreground">Total</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{reportData?.membros || 0}</div>
          <p className="text-xs text-muted-foreground">Membros</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{reportData?.visitantes || 0}</div>
          <p className="text-xs text-muted-foreground">Visitantes</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{reportData?.lideres || 0}</div>
          <p className="text-xs text-muted-foreground">Líderes</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{reportData?.batizados || 0}</div>
          <p className="text-xs text-muted-foreground">Batizados</p>
        </Card>
      </div>

      {/* Gráficos - Mobile-First Cards */}
      <div className="space-y-4">
        {/* Crescimento da Congregação */}
        <Card>
          <CardHeader 
            className="cursor-pointer flex flex-row items-center justify-between"
            onClick={() => setExpandedCard(expandedCard === 'crescimento' ? null : 'crescimento')}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle className="text-base">Crescimento da Congregação</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              {expandedCard === 'crescimento' ? '−' : '+'}
            </Button>
          </CardHeader>
          {expandedCard === 'crescimento' && (
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData?.crescimento_ultimos_meses || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Distribuição por Faixa Etária */}
        <Card>
          <CardHeader 
            className="cursor-pointer flex flex-row items-center justify-between"
            onClick={() => setExpandedCard(expandedCard === 'faixa-etaria' ? null : 'faixa-etaria')}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-base">Distribuição por Faixa Etária</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              {expandedCard === 'faixa-etaria' ? '−' : '+'}
            </Button>
          </CardHeader>
          {expandedCard === 'faixa-etaria' && (
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosFaixaEtaria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="faixa" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Estado Espiritual */}
        <Card>
          <CardHeader 
            className="cursor-pointer flex flex-row items-center justify-between"
            onClick={() => setExpandedCard(expandedCard === 'estado-espiritual' ? null : 'estado-espiritual')}
          >
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              <CardTitle className="text-base">Estado Espiritual</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              {expandedCard === 'estado-espiritual' ? '−' : '+'}
            </Button>
          </CardHeader>
          {expandedCard === 'estado-espiritual' && (
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={dadosEstadoEspiritual}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={70}
                      dataKey="quantidade"
                      label={({ estado, quantidade }) => `${estado}: ${quantidade}`}
                      fontSize={10}
                    >
                      {dadosEstadoEspiritual.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Resumo e Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              Resumo do Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Taxa de Conversão</span>
              <Badge variant="outline">
                {reportData ? Math.round((reportData.batizados / reportData.total_pessoas) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Proporção Liderança</span>
              <Badge variant="outline">
                {reportData ? Math.round((reportData.lideres / reportData.total_pessoas) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Engajamento Visitantes</span>
              <Badge variant="outline">
                {reportData ? Math.round((reportData.visitantes / reportData.total_pessoas) * 100) : 0}%
              </Badge>
            </div>
            <div className="pt-2 text-xs text-muted-foreground border-t">
              <p>Relatório gerado em {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};