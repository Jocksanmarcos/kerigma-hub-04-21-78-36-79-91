import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
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
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PessoaDialog } from '@/components/pessoas/PessoaDialog';
import { ExportButton } from '@/components/pessoas/ExportButton';
import { ImportButton } from '@/components/pessoas/ImportButton';
import { useFilters } from '@/hooks/useFilters';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const PessoasListV2: React.FC = () => {
  const { filters, setFilter, debouncedFilters, clearFilters } = useFilters({
    search: '',
    situacao: '',
    estado_espiritual: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pessoas, isLoading } = useQuery<any>({
    queryKey: ['pessoas-v2', JSON.stringify(debouncedFilters)],
    queryFn: async () => {
      const f: any = debouncedFilters;
      
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

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleDeletePessoa = async (pessoaId: string, nomePessoa: string) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .delete()
        .eq('id', pessoaId);

      if (error) throw error;

      toast({
        title: 'Pessoa excluída',
        description: `${nomePessoa} foi removido(a) do sistema.`,
      });

      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'pessoas-v2'
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a pessoa. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const estatisticas = pessoas ? {
    total: pessoas.length,
    ativos: pessoas.filter(p => p.situacao === 'ativo').length,
    membros: pessoas.filter(p => p.tipo_pessoa === 'membro').length,
    visitantes: pessoas.filter(p => p.tipo_pessoa === 'visitante').length,
    lideres: pessoas.filter(p => p.tipo_pessoa === 'lider').length,
  } : null;

  return (
    <div className="space-y-4">
      {/* Header com busca e ações - Mobile-First */}
      <div className="space-y-3">
        {/* Busca principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={(filters as any).search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Ações rápidas - Mobile-First */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => { setSelectedPessoa(null); setShowDialog(true); }} 
            className="flex items-center justify-center gap-2 h-12 sm:h-10"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Pessoa</span>
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-12 sm:h-10"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
            
            <ImportButton />
            <ExportButton 
              searchTerm={(filters as any).search || ''}
              statusFilter="todos"
              tipoFilter="todos"
            />
          </div>
        </div>

        {/* Filtros expansíveis */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select 
                  value={(filters as any).situacao}
                  onChange={(e) => setFilter('situacao', e.target.value)}
                  className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm"
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="afastado">Afastado</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Estado Espiritual</label>
                <select 
                  value={(filters as any).estado_espiritual}
                  onChange={(e) => setFilter('estado_espiritual', e.target.value)}
                  className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm"
                >
                  <option value="">Todos</option>
                  <option value="novo_convertido">Novo Convertido</option>
                  <option value="em_discipulado">Em Discipulado</option>
                  <option value="batizado">Batizado</option>
                  <option value="lider">Líder</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Ordenar por</label>
                <select 
                  value={(filters as any).sortBy}
                  onChange={(e) => setFilter('sortBy', e.target.value)}
                  className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm"
                >
                  <option value="nome_completo">Nome</option>
                  <option value="created_at">Data de Cadastro</option>
                  <option value="situacao">Status</option>
                  <option value="tipo_pessoa">Tipo</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilter('sortOrder', (filters as any).sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {(filters as any).sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Estatísticas rápidas - Mobile-First */}
      {estatisticas && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{estatisticas.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{estatisticas.ativos}</div>
              <div className="text-xs text-muted-foreground">Ativos</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{estatisticas.membros}</div>
              <div className="text-xs text-muted-foreground">Membros</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{estatisticas.visitantes}</div>
              <div className="text-xs text-muted-foreground">Visitantes</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-amber-600">{estatisticas.lideres}</div>
              <div className="text-xs text-muted-foreground">Líderes</div>
            </div>
          </Card>
        </div>
      )}

      {/* Lista de pessoas - Cards Mobile-First */}
      <div className="space-y-2">
        {isLoading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse flex items-center space-x-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2" />
                    <div className="h-3 bg-muted rounded w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {pessoas?.map((pessoa) => (
          <Card key={pessoa.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="font-medium">
                  {getInitials(pessoa.nome_completo)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{pessoa.nome_completo}</h3>
                  {getTipoIcon(pessoa.tipo_pessoa)}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  {getStatusIcon(pessoa.situacao)}
                  <span className="capitalize">{pessoa.situacao}</span>
                  <Badge variant={getTipoBadge(pessoa.tipo_pessoa) as any} className="text-xs">
                    {pessoa.tipo_pessoa}
                  </Badge>
                </div>
                
                {pessoa.email && (
                  <p className="text-sm text-muted-foreground truncate">{pessoa.email}</p>
                )}
                
                {pessoa.celulas?.nome && (
                  <p className="text-xs text-muted-foreground">{pessoa.celulas.nome}</p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-1">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/dashboard/pessoas/${pessoa.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSelectedPessoa(pessoa);
                  setShowDialog(true);
                }}>
                  <Edit className="h-4 w-4" />
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
            </div>
          </Card>
        ))}
      </div>

      <PessoaDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        pessoa={selectedPessoa}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedPessoa(null);
          queryClient.invalidateQueries({ 
            predicate: (query) => query.queryKey[0] === 'pessoas-v2'
          });
        }}
      />
    </div>
  );
};