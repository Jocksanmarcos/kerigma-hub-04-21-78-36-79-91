import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from '@/components/ui/enhanced-card';

interface KPIData {
  novosMembros: number;
  visitantesAcompanhar: number;
  aniversariantesSemana: number;
  membrosSemCelula: number;
}

export const PessoasKPICards: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    novosMembros: 0,
    visitantesAcompanhar: 0,
    aniversariantesSemana: 0,
    membrosSemCelula: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIData();
  }, []);

  const loadKPIData = async () => {
    try {
      setLoading(true);

      // Novos membros últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: novosMembros } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .gte('data_membresia', thirtyDaysAgo.toISOString())
        .eq('situacao', 'ativo');

      // Visitantes para acompanhar
      const { count: visitantesAcompanhar } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .eq('tipo_pessoa', 'visitante')
        .eq('situacao', 'ativo');

      // Aniversariantes da semana usando a função SQL
      const { data: aniversariantes } = await supabase
        .rpc('get_aniversariantes_da_semana');

      // Membros sem célula
      const { count: membrosSemCelula } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .eq('tipo_pessoa', 'membro')
        .eq('situacao', 'ativo')
        .is('celula_id', null);

      setKpiData({
        novosMembros: novosMembros || 0,
        visitantesAcompanhar: visitantesAcompanhar || 0,
        aniversariantesSemana: aniversariantes?.length || 0,
        membrosSemCelula: membrosSemCelula || 0
      });
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Novos Membros (30d)',
      value: kpiData.novosMembros,
      icon: UserPlus,
      change: '+12%',
      trend: 'up' as const
    },
    {
      title: 'Visitantes a Acompanhar',
      value: kpiData.visitantesAcompanhar,
      icon: Users,
      change: '3 pendentes',
      trend: 'neutral' as const
    },
    {
      title: 'Aniversariantes da Semana',
      value: kpiData.aniversariantesSemana,
      icon: Calendar,
      change: 'Esta semana',
      trend: 'neutral' as const
    },
    {
      title: 'Membros sem Célula',
      value: kpiData.membrosSemCelula,
      icon: AlertCircle,
      change: 'Necessita atenção',
      trend: 'down' as const
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted rounded-kerigma h-24 lg:h-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          trend={card.trend}
          icon={card.icon}
          className="h-full"
        />
      ))}
    </div>
  );
};