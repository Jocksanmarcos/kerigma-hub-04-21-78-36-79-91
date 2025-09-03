import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  TrendingUp,
  Heart,
  MapPin,
  Clock,
  Target,
  Search,
  Filter,
  Grid3X3,
  List,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface KPIData {
  novosMembros: number;
  visitantes: number;
  aniversariantes: number;
  totalAtivos: number;
  engajamento: number;
}

interface Pessoa {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  tipo_pessoa: string;
  situacao: string;
  data_nascimento?: string;
  celula_id?: string;
  celulas?: { nome: string };
  foto_url?: string;
}

interface FiltrosPessoas {
  termoBusca: string;
  status: string;
  celulaId: string;
  tipoPessoa: string;
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

interface CardMembroProps {
  pessoa: Pessoa;
  onAction: (action: string, pessoa: Pessoa) => void;
}

const CardMembro: React.FC<CardMembroProps> = ({ pessoa, onAction }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (situacao: string) => {
    switch (situacao) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'visitante': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-muted">
            <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(pessoa.nome_completo)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground truncate">{pessoa.nome_completo}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                onClick={() => onAction('more', pessoa)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-0.5 ${getStatusColor(pessoa.situacao)}`}
              >
                {pessoa.tipo_pessoa}
              </Badge>
              
              {pessoa.celulas?.nome && (
                <p className="text-xs text-muted-foreground truncate">
                  Célula: {pessoa.celulas.nome}
                </p>
              )}
              
              {pessoa.email && (
                <p className="text-xs text-muted-foreground truncate">{pessoa.email}</p>
              )}
            </div>
            
            {/* Ações Rápidas */}
            <div className="flex gap-1 mt-3">
              {pessoa.telefone && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAction('whatsapp', pessoa)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAction('call', pessoa)}
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                </>
              )}
              {pessoa.email && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => onAction('email', pessoa)}
                >
                  <Mail className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ListaMembroProps {
  pessoas: Pessoa[];
  onAction: (action: string, pessoa: Pessoa) => void;
}

const ListaMembro: React.FC<ListaMembroProps> = ({ pessoas, onAction }) => {
  const getStatusColor = (situacao: string) => {
    switch (situacao) {
      case 'ativo': return 'text-green-600';
      case 'inativo': return 'text-gray-600';
      case 'visitante': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pessoa</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Contato</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Célula</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map((pessoa) => (
            <tr key={pessoa.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {pessoa.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{pessoa.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">{pessoa.tipo_pessoa}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 hidden sm:table-cell">
                <div className="text-sm">
                  {pessoa.email && <p className="text-foreground">{pessoa.email}</p>}
                  {pessoa.telefone && <p className="text-muted-foreground">{pessoa.telefone}</p>}
                </div>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <p className="text-sm text-foreground">{pessoa.celulas?.nome || '-'}</p>
              </td>
              <td className="py-3 px-4">
                <Badge variant="outline" className={`text-xs ${getStatusColor(pessoa.situacao)}`}>
                  {pessoa.situacao}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onAction('view', pessoa)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {pessoa.telefone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onAction('whatsapp', pessoa)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PessoasV2Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState('diretorio');
  const [viewMode, setViewMode] = useState<'lista' | 'cards'>('cards');
  const [filtrosPessoas, setFiltrosPessoas] = useState<FiltrosPessoas>({
    termoBusca: '',
    status: '',
    celulaId: '',
    tipoPessoa: '',
  });
  const [listaDePessoas, setListaDePessoas] = useState<Pessoa[]>([]);
  const [celulas, setCelulas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [kpiData, setKpiData] = useState<KPIData>({
    novosMembros: 0,
    visitantes: 0,
    aniversariantes: 0,
    totalAtivos: 0,
    engajamento: 0,
  });
  const [kpiLoading, setKpiLoading] = useState(true);

  useEffect(() => {
    loadKPIData();
    loadCelulas();
    fetchPessoas();
  }, []);

  // Debounced effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPessoas();
    }, 300);

    return () => clearTimeout(timer);
  }, [filtrosPessoas]);

  const loadCelulas = async () => {
    try {
      const { data } = await supabase
        .from('celulas')
        .select('id, nome')
        .eq('ativa', true)
        .order('nome');
      
      setCelulas(data || []);
    } catch (error) {
      console.error('Erro ao carregar células:', error);
    }
  };

  const fetchPessoas = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('pessoas')
        .select(`
          id,
          nome_completo,
          email,
          telefone,
          tipo_pessoa,
          situacao,
          data_nascimento,
          celula_id,
          foto_url,
          celulas!pessoas_celula_id_fkey (nome)
        `);

      // Aplicar filtros dinamicamente
      if (filtrosPessoas.termoBusca) {
        query = query.or(`nome_completo.ilike.%${filtrosPessoas.termoBusca}%,email.ilike.%${filtrosPessoas.termoBusca}%`);
      }
      
      if (filtrosPessoas.status) {
        query = query.eq('situacao', filtrosPessoas.status);
      }
      
      if (filtrosPessoas.tipoPessoa) {
        query = query.eq('tipo_pessoa', filtrosPessoas.tipoPessoa);
      }
      
      if (filtrosPessoas.celulaId) {
        query = query.eq('celula_id', filtrosPessoas.celulaId);
      }

      const { data, error } = await query.order('nome_completo');

      if (error) throw error;
      setListaDePessoas(data || []);

    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
      toast({
        title: 'Erro ao buscar pessoas',
        description: 'Não foi possível carregar a lista de pessoas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FiltrosPessoas, value: string) => {
    setFiltrosPessoas(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFiltrosPessoas({
      termoBusca: '',
      status: '',
      celulaId: '',
      tipoPessoa: '',
    });
  };

  const handleMemberAction = (action: string, pessoa: Pessoa) => {
    switch (action) {
      case 'whatsapp':
        if (pessoa.telefone) {
          window.open(`https://wa.me/55${pessoa.telefone.replace(/\D/g, '')}`, '_blank');
        }
        break;
      case 'call':
        if (pessoa.telefone) {
          window.open(`tel:${pessoa.telefone}`, '_blank');
        }
        break;
      case 'email':
        if (pessoa.email) {
          window.open(`mailto:${pessoa.email}`, '_blank');
        }
        break;
      case 'view':
        // Navigate to person detail page
        break;
      default:
        break;
    }
  };

  // Filtered results count
  const totalResultados = listaDePessoas.length;

  const loadKPIData = async () => {
    try {
      setKpiLoading(true);

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
      setKpiLoading(false);
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
              loading={kpiLoading}
            />
            <KPICard
              title="Visitantes"
              value={kpiData.visitantes}
              icon={Users}
              trend="neutral"
              trendValue="Ativos"
              loading={kpiLoading}
            />
            <KPICard
              title="Aniversários"
              value={kpiData.aniversariantes}
              icon={Calendar}
              trend="neutral"
              trendValue="Esta semana"
              loading={kpiLoading}
            />
            <KPICard
              title="Total Ativo"
              value={kpiData.totalAtivos}
              icon={Target}
              trend="up"
              trendValue="Membros"
              loading={kpiLoading}
            />
            <div className="col-span-2 sm:col-span-1">
              <KPICard
                title="Engajamento"
                value={`${kpiData.engajamento}%`}
                icon={TrendingUp}
                trend={kpiData.engajamento >= 70 ? 'up' : kpiData.engajamento >= 50 ? 'neutral' : 'down'}
                trendValue="Em células"
              loading={kpiLoading}
              />
            </div>
          </div>

          {/* Advanced Filters Section */}
          {activeTab === 'diretorio' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="h-5 w-5" />
                    Filtros de Busca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={filtrosPessoas.termoBusca}
                      onChange={(e) => handleFilterChange('termoBusca', e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select
                      value={filtrosPessoas.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="">Todos os Status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="afastado">Afastado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filtrosPessoas.tipoPessoa}
                      onValueChange={(value) => handleFilterChange('tipoPessoa', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de Pessoa" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="">Todos os Tipos</SelectItem>
                        <SelectItem value="membro">Membro</SelectItem>
                        <SelectItem value="visitante">Visitante</SelectItem>
                        <SelectItem value="lider">Líder</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filtrosPessoas.celulaId}
                      onValueChange={(value) => handleFilterChange('celulaId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Célula" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="">Todas as Células</SelectItem>
                        {celulas.map((celula) => (
                          <SelectItem key={celula.id} value={celula.id}>
                            {celula.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results Header */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Exibindo <span className="font-medium text-foreground">{totalResultados}</span> pessoas
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'lista' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('lista')}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Results Display */}
              {isLoading ? (
                <Card className="p-8">
                  <div className="text-center space-y-4">
                    <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    <p className="text-muted-foreground">Carregando pessoas...</p>
                  </div>
                </Card>
              ) : listaDePessoas.length === 0 ? (
                <Card className="p-8">
                  <div className="text-center space-y-4">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhuma pessoa encontrada
                      </h3>
                      <p className="text-muted-foreground">
                        Ajuste os filtros ou adicione uma nova pessoa ao sistema.
                      </p>
                    </div>
                  </div>
                </Card>
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {listaDePessoas.map((pessoa) => (
                    <CardMembro
                      key={pessoa.id}
                      pessoa={pessoa}
                      onAction={handleMemberAction}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <ListaMembro
                    pessoas={listaDePessoas}
                    onAction={handleMemberAction}
                  />
                </Card>
              )}
            </>
          )}

          {/* Other Tab Content Placeholders */}
          {activeTab !== 'diretorio' && (
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
                    Esta seção será implementada no próximo passo.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PessoasV2Page;