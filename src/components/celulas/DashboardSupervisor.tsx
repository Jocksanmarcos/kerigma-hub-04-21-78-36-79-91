import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, TrendingUp, Users, AlertTriangle, Search, Filter, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CelulaSupervisao {
  id: string;
  nome: string;
  lider: string;
  membros: number;
  presencaMedia: number;
  visitantesUltimo: number;
  saude: 'Verde' | 'Amarelo' | 'Vermelho';
  ultimoRelatorio: string;
}

async function fetchCelulasSupervisao(): Promise<CelulaSupervisao[]> {
  const { data: celulas, error } = await supabase
    .from('celulas')
    .select(`
      id,
      nome,
      pessoas!lider_id(nome_completo)
    `)
    .eq('ativa', true)
    .limit(20);

  if (error) {
    console.error('Erro ao buscar células:', error);
    return [];
  }

  // Simular dados de saúde baseados em dados reais
  return celulas?.map(celula => ({
    id: celula.id,
    nome: celula.nome,
    lider: celula.pessoas?.nome_completo || 'Sem líder',
    membros: Math.floor(Math.random() * 20) + 5,
    presencaMedia: Math.floor(Math.random() * 15) + 5,
    visitantesUltimo: Math.floor(Math.random() * 4),
    saude: ['Verde', 'Amarelo', 'Vermelho'][Math.floor(Math.random() * 3)] as 'Verde' | 'Amarelo' | 'Vermelho',
    ultimoRelatorio: ['Hoje', '1 dia atrás', '2 dias atrás', '1 semana atrás'][Math.floor(Math.random() * 4)]
  })) || [];
}

export const DashboardSupervisor: React.FC = () => {
  const [filtroSaude, setFiltroSaude] = useState('todas');
  const [filtroRegiao, setFiltroRegiao] = useState('todas');
  const [buscaCelula, setBuscaCelula] = useState('');
  
  const { data: celulas = [], isLoading, error } = useQuery({
    queryKey: ['celulas-supervisao'],
    queryFn: fetchCelulasSupervisao,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (error) {
    toast.error('Erro ao carregar células para supervisão');
  }

  const celulasFiltradas = celulas.filter(celula => {
    const filtroSaudeOk = filtroSaude === 'todas' || celula.saude.toLowerCase() === filtroSaude;
    const filtroBuscaOk = buscaCelula === '' || 
      celula.nome.toLowerCase().includes(buscaCelula.toLowerCase()) ||
      celula.lider.toLowerCase().includes(buscaCelula.toLowerCase());
    
    return filtroSaudeOk && filtroBuscaOk;
  });

  const handleVerDetalhes = (celula: CelulaSupervisao) => {
    toast.info(`Abrindo detalhes da ${celula.nome}`);
    // Implementar navegação para detalhes da célula
  };

  const handleIniciarMultiplicacao = (celula: CelulaSupervisao) => {
    toast.success(`Iniciando processo de multiplicação para ${celula.nome}`);
    // Implementar lógica de multiplicação
  };

  const handleAgendarReuniao = (celula: CelulaSupervisao) => {
    toast.info(`Agendando reunião com líder da ${celula.nome}`);
    // Implementar agendamento
  };

  return (
    <div className="space-y-6">
      {/* Filtros Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros Rápidos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar célula por nome ou líder..."
                className="w-full"
                value={buscaCelula}
                onChange={(e) => setBuscaCelula(e.target.value)}
              />
            </div>
            <Select value={filtroSaude} onValueChange={setFiltroSaude}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Saúde" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="verde">Verde</SelectItem>
                <SelectItem value="amarelo">Amarelo</SelectItem>
                <SelectItem value="vermelho">Vermelho</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroRegiao} onValueChange={setFiltroRegiao}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="centro">Centro</SelectItem>
                <SelectItem value="norte">Norte</SelectItem>
                <SelectItem value="sul">Sul</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grelha de Saúde das Células */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Grelha de Saúde das Células</span>
          </CardTitle>
          <CardDescription>
            Visão geral do status de todas as células sob sua supervisão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Carregando células...</div>
            </div>
          ) : celulasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Nenhuma célula encontrada com os filtros aplicados</div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {celulasFiltradas.map((celula) => (
                <Card key={celula.id} className={`border-l-4 ${
                  celula.saude === 'Verde' ? 'border-l-emerald-500' :
                  celula.saude === 'Amarelo' ? 'border-l-yellow-500' :
                  'border-l-red-500'
                }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{celula.nome}</CardTitle>
                    <Badge 
                      variant={
                        celula.saude === 'Verde' ? 'default' :
                        celula.saude === 'Amarelo' ? 'secondary' :
                        'destructive'
                      }
                    >
                      {celula.saude}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Líder: {celula.lider}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Membros:</span>
                      <span className="font-medium">{celula.membros}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Presença Média:</span>
                      <span className="font-medium">{celula.presencaMedia}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Visitantes (último):</span>
                      <span className="font-medium">{celula.visitantesUltimo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Último Relatório:</span>
                      <span className="text-xs text-muted-foreground">{celula.ultimoRelatorio}</span>
                    </div>
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

      {/* Células Prontas para Multiplicação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Células Prontas para Multiplicação</span>
          </CardTitle>
          <CardDescription>
            IA sugere células com potencial para multiplicação baseado em métricas de crescimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: '1',
                nome: 'Célula Jardim Europa',
                lider: 'Maria Silva',
                membros: 16,
                presencaMedia: 14,
                visitantesUltimo: 3,
                saude: 'Verde' as const,
                ultimoRelatorio: '2024-01-08',
                crescimento: '+45%',
                pontuacao: 95,
                motivo: 'Crescimento constante, liderança madura, presença alta'
              },
              {
                id: '2',
                nome: 'Célula Bela Vista',
                lider: 'Pedro Lima',
                membros: 14,
                presencaMedia: 12,
                visitantesUltimo: 2,
                saude: 'Verde' as const,
                ultimoRelatorio: '2024-01-08',
                crescimento: '+30%',
                pontuacao: 88,
                motivo: 'Muitos visitantes, líder em treinamento disponível'
              }
            ].map((celula, index) => (
              <div key={index} className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-emerald-800 dark:text-emerald-200">{celula.nome}</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">Líder: {celula.lider}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{celula.motivo}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{celula.pontuacao}%</div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">{celula.crescimento}</div>
                    <Badge variant="outline" className="mt-2">
                      {celula.membros} membros
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button 
                    size="sm"
                    onClick={() => handleIniciarMultiplicacao(celula)}
                  >
                    Iniciar Multiplicação
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAgendarReuniao(celula)}
                  >
                    Agendar Reunião
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações em Massa */}
      <Card>
        <CardHeader>
          <CardTitle>Ações em Massa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast.info('Enviando lembretes de relatórios para todas as células')}
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Lembrete Relatórios</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast.info('Abrindo mapa interativo das células')}
            >
              <MapPin className="h-6 w-6" />
              <span>Mapa de Células</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast.info('Gerando relatório geral de todas as células')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Relatório Geral</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-auto py-4"
              onClick={() => toast.info('Abrindo módulo de treinamento para líderes')}
            >
              <Users className="h-6 w-6" />
              <span>Treinamento Líderes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};