import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, Users, TrendingUp, Filter, BarChart3, PieChart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

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

export const PessoasReports: React.FC = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<string>('geral');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('mes');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['pessoas-reports', tipoRelatorio, periodoFiltro],
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios de Pessoas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-full" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const dadosFaixaEtaria = Object.entries(reportData?.por_faixa_etaria || {}).map(([faixa, quantidade]) => ({
    faixa,
    quantidade,
  }));

  const dadosEstadoEspiritual = Object.entries(reportData?.por_estado_espiritual || {}).map(([estado, quantidade]) => ({
    estado,
    quantidade,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios de Pessoas
          </CardTitle>
          <CardDescription>
            Análises detalhadas e estatísticas sobre a congregação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
              <SelectTrigger className="w-full sm:w-48">
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
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Último mês</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="ano">Último ano</SelectItem>
                <SelectItem value="todos">Todos os períodos</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportarRelatorio} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>

          {/* Métricas Principais */}
          <ResponsiveGrid columns={{ default: 2, sm: 3, md: 5 }} gap={4} className="mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{reportData?.total_pessoas}</div>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{reportData?.membros}</div>
                <p className="text-sm text-muted-foreground">Membros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{reportData?.visitantes}</div>
                <p className="text-sm text-muted-foreground">Visitantes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{reportData?.lideres}</div>
                <p className="text-sm text-muted-foreground">Líderes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{reportData?.batizados}</div>
                <p className="text-sm text-muted-foreground">Batizados</p>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <ResponsiveGrid columns={{ default: 1, lg: 2 }} gap={6}>
        {/* Crescimento ao Longo do Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Crescimento da Congregação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={reportData?.crescimento_ultimos_meses || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Faixa Etária */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Faixa Etária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosFaixaEtaria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="faixa" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Estado Espiritual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Estado Espiritual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={dadosEstadoEspiritual}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="quantidade"
                  label={({ estado, quantidade }) => `${estado}: ${quantidade}`}
                >
                  {dadosEstadoEspiritual.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resumo e Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumo do Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="pt-2 text-xs text-muted-foreground">
              <p>* Relatório gerado em {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </div>
  );
};