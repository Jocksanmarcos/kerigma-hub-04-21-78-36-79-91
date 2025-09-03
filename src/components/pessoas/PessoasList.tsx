import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  UserPlus,
  Crown,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PessoaDialog } from './PessoaDialog';
import { ExportButton } from './ExportButton';
import { ImportButton } from './ImportButton';
import { PessoasListSkeleton } from './PessoasListSkeleton';
import { useFilters } from '@/hooks/useFilters';
import { PessoasFiltersBar } from './PessoasFiltersBar';
import { ViewSelector } from './ViewSelector';
import { MemberCard } from './MemberCard';
import { useToast } from '@/hooks/use-toast';
import { MobileOptimizedTable, MobileTableCard, MobileTableField } from '@/components/ui/mobile-optimized-table';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

export const PessoasList: React.FC = () => {
  const { filters, setFilter, debouncedFilters, clearFilters } = useFilters({
    search: '',
    situacao: '',
    estado_espiritual: '',
    discipulador_id: '',
    tags: [] as string[],
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'lista' | 'cards'>('lista');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pessoas, isLoading, error } = useQuery<any>({
    queryKey: ['pessoas', JSON.stringify(debouncedFilters)],
    queryFn: async () => {
      const f: any = debouncedFilters;
      console.log('🔍 Carregando pessoas com filtros:', f);
      
      let query: any = (supabase as any)
        .from('pessoas')
        .select(`
          *,
          profiles!pessoas_profile_id_fkey(name, level, description),
          celulas!pessoas_celula_id_fkey(nome)
        `)
        .order(f.sortBy || 'created_at', { ascending: f.sortOrder === 'asc' });

      if (f.search) {
        query = query.or(`nome_completo.ilike.%${f.search}%,email.ilike.%${f.search}%`);
      }
      if (f.situacao) {
        query = query.eq('situacao', f.situacao);
      }
      if (f.estado_espiritual) {
        query = query.eq('estado_espiritual', f.estado_espiritual);
      }
      if (f.discipulador_id) {
        query = query.eq('user_id', f.discipulador_id);
      }
      if (Array.isArray(f.tags) && f.tags.length > 0) {
        query = (query as any).overlaps('tags', f.tags);
      }

      const { data, error } = await query;
      console.log('📊 Resultado da query:', { data: data?.length, error });
      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }
      return data;
    }
  });

  console.log('🎯 Estado do componente:', { isLoading, pessoasCount: pessoas?.length, error });

  const getStatusIcon = (situacao: string) => {
    switch (situacao) {
      case 'ativo': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inativo': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'afastado': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'membro': return <Users className="h-4 w-4 text-blue-600" />;
      case 'visitante': return <UserPlus className="h-4 w-4 text-purple-600" />;
      case 'lider': return <Crown className="h-4 w-4 text-amber-600" />;
      default: return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      membro: 'default',
      visitante: 'secondary', 
      lider: 'destructive'
    };
    return variants[tipo as keyof typeof variants] || 'outline';
  };

  const estatisticas = pessoas ? {
    total: pessoas.length,
    ativos: pessoas.filter(p => p.situacao === 'ativo').length,
    membros: pessoas.filter(p => p.tipo_pessoa === 'membro').length,
    visitantes: pessoas.filter(p => p.tipo_pessoa === 'visitante').length,
    lideres: pessoas.filter(p => p.tipo_pessoa === 'lider').length,
  } : null;

  const handleDeletePessoa = async (pessoaId: string, nomePessoa: string) => {
    try {
      console.log('Tentando excluir pessoa:', pessoaId, nomePessoa);
      
      const { error, data } = await supabase
        .from('pessoas')
        .delete()
        .eq('id', pessoaId);

      console.log('Resultado da exclusão:', { data, error });

      if (error) throw error;

      toast({
        title: 'Pessoa excluída',
        description: `${nomePessoa} foi removido(a) do sistema.`,
      });

      // Refresh da lista
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'pessoas'
      });
    } catch (error) {
      console.error('Erro ao deletar pessoa:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a pessoa. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <PessoasListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Rápidas */}
      {estatisticas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{estatisticas.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{estatisticas.ativos}</div>
                  <div className="text-sm text-muted-foreground">Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{estatisticas.membros}</div>
                  <div className="text-sm text-muted-foreground">Membros</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{estatisticas.visitantes}</div>
                  <div className="text-sm text-muted-foreground">Visitantes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-8 w-8 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold">{estatisticas.lideres}</div>
                  <div className="text-sm text-muted-foreground">Líderes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros de Busca</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PessoasFiltersBar
            values={filters as any}
            onChange={(k, v) => setFilter(k as any, v)}
            onClear={clearFilters}
          />
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <select 
                value={(filters as any).sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value)}
                className="text-sm border border-input bg-background px-2 py-1 rounded-md"
              >
                <option value="nome_completo">Nome</option>
                <option value="created_at">Data de Cadastro</option>
                <option value="situacao">Status</option>
                <option value="tipo_pessoa">Tipo</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter('sortOrder', (filters as any).sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1"
              >
                {(filters as any).sortOrder === 'asc' ? (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    <span>Crescente</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4" />
                    <span>Decrescente</span>
                  </>
                )}
              </Button>
            </div>
            <Button onClick={() => { setSelectedPessoa(null); setShowDialog(true); }} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Adicionar Pessoa</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Pessoas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Pessoas</CardTitle>
              <CardDescription>
                Gerencie informações de membros, visitantes e líderes
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <ViewSelector viewMode={viewMode} onChange={setViewMode} />
              <div className="flex gap-2">
                <ImportButton />
                <ExportButton 
                  searchTerm={(filters as any).search || ''}
                  statusFilter={'todos'}
                  tipoFilter={'todos'}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <PessoasListSkeleton />
          ) : viewMode === 'lista' ? (
            <MobileOptimizedTable>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Nome</TableHead>
                      <TableHead className="min-w-[100px]">Tipo</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[120px] hidden md:table-cell">Perfil de Acesso</TableHead>
                      <TableHead className="min-w-[120px] hidden lg:table-cell">Célula</TableHead>
                      <TableHead className="min-w-[200px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {pessoas?.map((pessoa) => (
                    <TableRow key={pessoa.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{pessoa.nome_completo}</span>
                          <span className="text-sm text-muted-foreground">{pessoa.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTipoIcon(pessoa.tipo_pessoa)}
                          <Badge variant={getTipoBadge(pessoa.tipo_pessoa) as any}>
                            {pessoa.tipo_pessoa}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(pessoa.situacao)}
                          <span className="capitalize">{pessoa.situacao}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {pessoa.profiles ? (
                          <Badge variant="outline">
                            {pessoa.profiles.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não definido</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {pessoa.celulas?.nome || (
                          <span className="text-muted-foreground text-sm">Sem célula</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/dashboard/pessoas/${pessoa.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedPessoa(pessoa);
                            setShowDialog(true);
                          }}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja excluir ${pessoa.nome_completo}?`)) {
                                handleDeletePessoa(pessoa.id, pessoa.nome_completo);
                              }
                            }}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {pessoas?.map((pessoa) => (
                  <MobileTableCard key={pessoa.id}>
                    <MobileTableField
                      label="Nome"
                      value={
                        <div className="text-right">
                          <div className="font-medium">{pessoa.nome_completo}</div>
                          <div className="text-xs text-muted-foreground">{pessoa.email}</div>
                        </div>
                      }
                    />
                    <MobileTableField
                      label="Tipo"
                      value={
                        <div className="flex items-center justify-end gap-2">
                          {getTipoIcon(pessoa.tipo_pessoa)}
                          <Badge variant={getTipoBadge(pessoa.tipo_pessoa) as any}>
                            {pessoa.tipo_pessoa}
                          </Badge>
                        </div>
                      }
                    />
                    <MobileTableField
                      label="Status"
                      value={
                        <div className="flex items-center justify-end gap-2">
                          {getStatusIcon(pessoa.situacao)}
                          <span className="capitalize">{pessoa.situacao}</span>
                        </div>
                      }
                    />
                    {pessoa.profiles && (
                      <MobileTableField
                        label="Perfil"
                        value={
                          <Badge variant="outline">
                            {pessoa.profiles.name}
                          </Badge>
                        }
                      />
                    )}
                    {pessoa.celulas?.nome && (
                      <MobileTableField
                        label="Célula"
                        value={pessoa.celulas.nome}
                      />
                    )}
                    <div className="pt-3 flex gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link to={`/dashboard/pessoas/${pessoa.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedPessoa(pessoa);
                        setShowDialog(true);
                      }} className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja excluir ${pessoa.nome_completo}?`)) {
                            handleDeletePessoa(pessoa.id, pessoa.nome_completo);
                          }
                        }}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </MobileTableCard>
                ))}
              </div>
            </MobileOptimizedTable>
          ) : (
            <ResponsiveGrid columns={{ default: 1, sm: 2, lg: 3, xl: 4 }} gap={4}>
              {pessoas?.map((pessoa) => (
                <MemberCard
                  key={pessoa.id}
                  pessoa={pessoa}
                  onEdit={(pessoa) => {
                    setSelectedPessoa(pessoa);
                    setShowDialog(true);
                  }}
                  onDelete={handleDeletePessoa}
                />
              ))}
            </ResponsiveGrid>
          )}
        </CardContent>
      </Card>

      <PessoaDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        pessoa={selectedPessoa}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedPessoa(null);
        }}
      />
    </div>
  );
};