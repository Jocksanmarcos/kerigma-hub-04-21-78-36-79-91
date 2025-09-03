import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Users, 
  MapPin, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CriarCelulaDialog } from './CriarCelulaDialog';

import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CelulaAdmin {
  id: string;
  nome: string;
  dia_reuniao: string | null;
  horario_reuniao: string | null;
  endereco: string | null;
  ativa: boolean;
  lider_nome: string | null;
  supervisor_nome: string | null;
  coordenador_nome: string | null;
  pastor_rede_nome: string | null;
  total_membros: number;
  ultimo_relatorio: string | null;
  status_saude: 'excelente' | 'boa' | 'atencao' | 'critica';
}

export const DashboardAdministrativo: React.FC = () => {
  const [showCriarCelula, setShowCriarCelula] = useState(false);
  const [filtro, setFiltro] = useState('');
  const { toast } = useToast();

  // Buscar todas as células para administradores
  const { data: celulas, isLoading, refetch } = useQuery({
    queryKey: ['celulas-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('celulas')
        .select(`
          id,
          nome,
          endereco,
          dia_semana,
          horario,
          ativa,
          created_at,
          lider:pessoas!lider_id(id, nome_completo),
          supervisor:pessoas!supervisor_id(id, nome_completo),
          coordenador:pessoas!coordenador_id(id, nome_completo),
          pastor_rede:pessoas!pastor_rede_id(id, nome_completo),
          membros:pessoas!celula_id(count),
          relatorios:relatorios_celulas!celula_id(
            data_reuniao,
            presentes,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar células:', error);
        throw error;
      }

      return data.map(celula => {
        const ultimoRelatorio = celula.relatorios?.[0];
        const totalMembros = celula.membros?.[0]?.count || 0;
        
        // Calcular status de saúde baseado em dados disponíveis
        let statusSaude: CelulaAdmin['status_saude'] = 'boa';
        if (!ultimoRelatorio) {
          statusSaude = 'critica';
        } else if (ultimoRelatorio.presentes >= totalMembros * 0.8) {
          statusSaude = 'excelente';
        } else if (ultimoRelatorio.presentes >= totalMembros * 0.6) {
          statusSaude = 'boa';
        } else {
          statusSaude = 'atencao';
        }

        return {
          id: celula.id,
          nome: celula.nome,
          dia_reuniao: celula.dia_semana,
          horario_reuniao: celula.horario,
          endereco: celula.endereco,
          ativa: celula.ativa,
          lider_nome: celula.lider?.nome_completo || null,
          supervisor_nome: celula.supervisor?.nome_completo || null,
          coordenador_nome: celula.coordenador?.nome_completo || null,
          pastor_rede_nome: celula.pastor_rede?.nome_completo || null,
          total_membros: totalMembros,
          ultimo_relatorio: ultimoRelatorio?.data_reuniao || null,
          status_saude: statusSaude
        } as CelulaAdmin;
      });
    }
  });

  const celulasFiltradas = celulas?.filter(celula =>
    celula.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    celula.lider_nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    celula.supervisor_nome?.toLowerCase().includes(filtro.toLowerCase())
  ) || [];

  const estatisticas = celulas ? {
    totalCelulas: celulas.length,
    celulasAtivas: celulas.filter(c => c.ativa).length,
    celulasComLider: celulas.filter(c => c.lider_nome).length,
    celulasComSupervisor: celulas.filter(c => c.supervisor_nome).length,
    totalMembros: celulas.reduce((acc, c) => acc + c.total_membros, 0)
  } : {
    totalCelulas: 0,
    celulasAtivas: 0,
    celulasComLider: 0,
    celulasComSupervisor: 0,
    totalMembros: 0
  };

  const getStatusBadge = (status: CelulaAdmin['status_saude']) => {
    const variants = {
      excelente: 'default',
      boa: 'secondary',
      atencao: 'outline',
      critica: 'destructive'
    } as const;

    const labels = {
      excelente: 'Excelente',
      boa: 'Boa',
      atencao: 'Atenção',
      critica: 'Crítica'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleExcluirCelula = async (celulaId: string, nomeCelula: string) => {
    if (!confirm(`Tem certeza que deseja excluir a célula "${nomeCelula}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('celulas')
        .delete()
        .eq('id', celulaId);

      if (error) throw error;

      toast({
        title: "Célula excluída",
        description: `A célula "${nomeCelula}" foi excluída com sucesso.`
      });

      refetch();
    } catch (error: any) {
      console.error('Erro ao excluir célula:', error);
      toast({
        title: "Erro",
        description: `Erro ao excluir célula: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando painel administrativo...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Administrativo */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Células</h1>
          <p className="text-muted-foreground">Painel administrativo completo</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCriarCelula(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Célula
          </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Células</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalCelulas}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.celulasAtivas} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Líder</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.celulasComLider}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.totalCelulas > 0 ? 
                Math.round((estatisticas.celulasComLider / estatisticas.totalCelulas) * 100) : 0
              }% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Supervisor</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.celulasComSupervisor}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.totalCelulas > 0 ? 
                Math.round((estatisticas.celulasComSupervisor / estatisticas.totalCelulas) * 100) : 0
              }% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalMembros}</div>
            <p className="text-xs text-muted-foreground">
              Média: {estatisticas.totalCelulas > 0 ? 
                Math.round(estatisticas.totalMembros / estatisticas.totalCelulas) : 0
              } por célula
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisam Atenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {celulas?.filter(c => c.status_saude === 'critica' || c.status_saude === 'atencao').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Células críticas/atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Células</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome da célula, líder ou supervisor..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Células */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Células ({celulasFiltradas.length})</CardTitle>
          <CardDescription>Gerencie todas as células da igreja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Célula</TableHead>
                  <TableHead>Líder</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Membros</TableHead>
                  <TableHead>Reunião</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Relatório</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {celulasFiltradas.map((celula) => (
                  <TableRow key={celula.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{celula.nome}</p>
                        {celula.endereco && (
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {celula.endereco}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {celula.lider_nome || (
                        <span className="text-muted-foreground italic">Sem líder</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {celula.supervisor_nome || (
                        <span className="text-muted-foreground italic">Sem supervisor</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {celula.total_membros}
                      </div>
                    </TableCell>
                    <TableCell>
                      {celula.dia_reuniao && celula.horario_reuniao ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {celula.dia_reuniao} às {celula.horario_reuniao}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Não definido</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(celula.status_saude)}
                    </TableCell>
                    <TableCell>
                      {celula.ultimo_relatorio ? (
                        format(new Date(celula.ultimo_relatorio), 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        <span className="text-muted-foreground italic">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleExcluirCelula(celula.id, celula.nome)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CriarCelulaDialog 
        open={showCriarCelula}
        onOpenChange={setShowCriarCelula}
        onSuccess={refetch}
      />

      
    </div>
  );
};