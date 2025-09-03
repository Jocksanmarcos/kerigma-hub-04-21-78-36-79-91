import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  TrendingUp,
  Heart,
  MapPin,
  Clock,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface KPIData {
  novosMembros: number;
  visitantes: number;
  aniversariantes: number;
  totalAtivos: number;
  engajamento: number;
}

interface SegmentedNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SegmentedNav: React.FC<SegmentedNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { value: 'diretorio', label: 'Diretório', icon: Users },
    { value: 'aniversarios', label: 'Aniversários', icon: Calendar },
    { value: 'analises', label: 'Análises', icon: TrendingUp },
    { value: 'familias', label: 'Famílias', icon: Heart },
    { value: 'localizacao', label: 'Localização', icon: MapPin },
  ];

  return (
    <div className="w-full">
      {/* Mobile: Scrollable horizontal tabs */}
      <div className="sm:hidden">
        <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`
                  flex flex-col items-center justify-center min-w-[80px] px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'bg-background text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }
                `}
              >
                <Icon className={`h-4 w-4 mb-1 ${isActive ? 'text-primary' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Full horizontal layout */}
      <div className="hidden sm:flex gap-1 p-1 bg-muted rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`
                flex items-center justify-center flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }
              `}
            >
              <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-primary' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-muted rounded w-16"></div>
            <div className="h-8 w-8 bg-muted rounded"></div>
          </div>
          <div className="h-8 bg-muted rounded w-12 mb-2"></div>
          <div className="h-3 bg-muted rounded w-20"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              <Badge 
                variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
                className="text-xs px-1.5 py-0.5"
              >
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PessoasV2Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState('diretorio');
  const [kpiData, setKpiData] = useState<KPIData>({
    novosMembros: 0,
    visitantes: 0,
    aniversariantes: 0,
    totalAtivos: 0,
    engajamento: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIData();
  }, []);

  const loadKPIData = async () => {
    try {
      setLoading(true);

      // Novos membros (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: novosMembros } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .gte('data_membresia', thirtyDaysAgo.toISOString())
        .eq('situacao', 'ativo');

      // Visitantes ativos
      const { count: visitantes } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .eq('tipo_pessoa', 'visitante')
        .eq('situacao', 'ativo');

      // Total de pessoas ativas
      const { count: totalAtivos } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .eq('situacao', 'ativo');

      // Aniversariantes da semana (usando função do banco)
      const { data: aniversariantesData } = await supabase.rpc('get_aniversariantes_mes');
      
      // Filtrar apenas os aniversariantes desta semana
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);

      const aniversariantesSemana = aniversariantesData?.filter((pessoa: any) => {
        if (!pessoa.data_nascimento) return false;
        const dataNasc = new Date(pessoa.data_nascimento);
        const mesmoMes = dataNasc.getMonth() === hoje.getMonth();
        const diasParaAniversario = pessoa.dias_para_aniversario;
        return mesmoMes && diasParaAniversario >= 0 && diasParaAniversario <= 7;
      }) || [];

      // Calcular engajamento (pessoas ativas com células vs total)
      const { count: pessoasComCelula } = await supabase
        .from('pessoas')
        .select('id', { count: 'exact', head: true })
        .eq('situacao', 'ativo')
        .not('celula_id', 'is', null);

      const engajamento = totalAtivos ? Math.round((pessoasComCelula / totalAtivos) * 100) : 0;

      setKpiData({
        novosMembros: novosMembros || 0,
        visitantes: visitantes || 0,
        aniversariantes: aniversariantesSemana.length,
        totalAtivos: totalAtivos || 0,
        engajamento,
      });

    } catch (error) {
      console.error('Erro ao carregar dados dos KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Título e Subtítulo */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Gestão de Pessoas
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Diretório inteligente com análises e insights em tempo real
                </p>
              </div>

              {/* Navegação Secundária */}
              <SegmentedNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KPICard
              title="Novos Membros"
              value={kpiData.novosMembros}
              icon={UserPlus}
              trend="up"
              trendValue="30 dias"
              loading={loading}
            />
            <KPICard
              title="Visitantes"
              value={kpiData.visitantes}
              icon={Users}
              trend="neutral"
              trendValue="Ativos"
              loading={loading}
            />
            <KPICard
              title="Aniversários"
              value={kpiData.aniversariantes}
              icon={Calendar}
              trend="neutral"
              trendValue="Esta semana"
              loading={loading}
            />
            <KPICard
              title="Total Ativo"
              value={kpiData.totalAtivos}
              icon={Target}
              trend="up"
              trendValue="Membros"
              loading={loading}
            />
            <div className="col-span-2 sm:col-span-1">
              <KPICard
                title="Engajamento"
                value={`${kpiData.engajamento}%`}
                icon={TrendingUp}
                trend={kpiData.engajamento >= 70 ? 'up' : kpiData.engajamento >= 50 ? 'neutral' : 'down'}
                trendValue="Em células"
                loading={loading}
              />
            </div>
          </div>

          {/* Content Area Placeholder */}
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Área de Conteúdo: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
                <p className="text-muted-foreground">
                  Esta seção será implementada no próximo passo. Os filtros avançados e 
                  visualizações (Lista/Cards) do diretório de pessoas virão aqui.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default PessoasV2Page;