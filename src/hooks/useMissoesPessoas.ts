import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MissaoPessoa {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  tipo_pessoa: string;
  situacao: string;
  church_id: string;
  created_at: string;
  pai_id?: string;
  mae_id?: string;
  genero?: string;
  church?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

export const useMissoesPessoas = () => {
  return useQuery({
    queryKey: ['missoes-pessoas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select(`
          id,
          nome_completo,
          email,
          telefone,
          tipo_pessoa,
          situacao,
          church_id,
          created_at,
          pai_id,
          mae_id,
          genero,
          igrejas:church_id (
            id,
            nome,
            tipo
          )
        `)
        .eq('situacao', 'ativo')
        .order('nome_completo');

      if (error) {
        console.error('Erro ao buscar pessoas das missões:', error);
        throw error;
      }

      return data as MissaoPessoa[];
    },
  });
};

export const useCreatePessoa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pessoaData: {
      nome_completo: string;
      email: string;
      telefone?: string;
      tipo_pessoa: string;
      church_id: string;
      endereco?: string;
      cidade?: string;
      estado?: string;
      pai_id?: string;
      mae_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('pessoas')
        .insert([{
          ...pessoaData,
          situacao: 'ativo',
          pai_id: pessoaData.pai_id || null,
          mae_id: pessoaData.mae_id || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missoes-pessoas'] });
      toast.success('Pessoa cadastrada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao cadastrar pessoa:', error);
      toast.error('Erro ao cadastrar pessoa. Tente novamente.');
    },
  });
};

export const useUpdatePessoa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updateData 
    }: { 
      id: string; 
      nome_completo?: string;
      email?: string;
      telefone?: string;
      tipo_pessoa?: string;
      situacao?: string;
    }) => {
      const { data, error } = await supabase
        .from('pessoas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missoes-pessoas'] });
      toast.success('Pessoa atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar pessoa:', error);
      toast.error('Erro ao atualizar pessoa. Tente novamente.');
    },
  });
};

export const useDeletePessoa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pessoas')
        .update({ situacao: 'inativo' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missoes-pessoas'] });
      toast.success('Pessoa removida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover pessoa:', error);
      toast.error('Erro ao remover pessoa. Tente novamente.');
    },
  });
};