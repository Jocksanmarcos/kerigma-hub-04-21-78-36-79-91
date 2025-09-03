import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PessoasFilters {
  search: string;
  situacao: string;
  tipoPessoa: string;
  celulaId: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const usePessoasData = (filters: PessoasFilters) => {
  const { data: pessoas, isLoading, error, refetch } = useQuery({
    queryKey: ['pessoas-refactored', filters],
    queryFn: async () => {
      console.log('🔍 Carregando pessoas refatoradas com filtros:', filters);
      
      let query = supabase
        .from('pessoas')
        .select(`
          *,
          celulas!pessoas_celula_id_fkey(nome),
          profiles!pessoas_profile_id_fkey(name, level, description)
        `)
        .order(filters.sortBy || 'created_at', { ascending: filters.sortOrder === 'asc' });

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`nome_completo.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      
      if (filters.situacao) {
        query = query.eq('situacao', filters.situacao);
      }
      
      if (filters.tipoPessoa) {
        query = query.eq('tipo_pessoa', filters.tipoPessoa);
      }
      
      if (filters.celulaId) {
        query = query.eq('celula_id', filters.celulaId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro na query pessoas refatoradas:', error);
        throw error;
      }
      
      console.log('📊 Pessoas carregadas:', data?.length);
      return data || [];
    },
  });

  // Calcular estatísticas
  const stats = pessoas ? {
    total: pessoas.length,
    ativos: pessoas.filter(p => p.situacao === 'ativo').length,
    inativos: pessoas.filter(p => p.situacao === 'inativo').length,
    membros: pessoas.filter(p => p.tipo_pessoa === 'membro').length,
    visitantes: pessoas.filter(p => p.tipo_pessoa === 'visitante').length,
    lideres: pessoas.filter(p => p.tipo_pessoa === 'lider').length,
  } : null;

  return {
    pessoas: pessoas || [],
    isLoading,
    error,
    stats,
    refetch,
  };
};