import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from '@/hooks/useCurrentPerson';

export type PapelLideranca = 'lider_celula' | 'supervisor' | 'pastor_rede' | 'coordenador' | 'membro' | null;

export const usePapelLideranca = () => {
  const [papelLideranca, setPapelLideranca] = useState<PapelLideranca>(null);
  const [loading, setLoading] = useState(true);
  const { pessoa } = useCurrentPerson();

  useEffect(() => {
    const fetchPapelLideranca = async () => {
      if (!pessoa?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('pessoas')
          .select('papel_lideranca')
          .eq('id', pessoa.id)
          .single();

        if (error) {
          console.error('Erro ao buscar papel de liderança:', error);
          return;
        }

        setPapelLideranca((data?.papel_lideranca as PapelLideranca) || 'membro');
      } catch (error) {
        console.error('Erro ao buscar papel de liderança:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapelLideranca();
  }, [pessoa?.id]);

  const updatePapelLideranca = async (novoPapel: PapelLideranca) => {
    if (!pessoa?.id) return false;

    try {
      const { error } = await supabase
        .from('pessoas')
        .update({ papel_lideranca: novoPapel })
        .eq('id', pessoa.id);

      if (error) {
        console.error('Erro ao atualizar papel de liderança:', error);
        return false;
      }

      setPapelLideranca(novoPapel);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar papel de liderança:', error);
      return false;
    }
  };

  return {
    papelLideranca,
    loading,
    updatePapelLideranca,
    isLiderCelula: papelLideranca === 'lider_celula',
    isSupervisor: papelLideranca === 'supervisor',
    isPastorRede: papelLideranca === 'pastor_rede',
    isCoordenador: papelLideranca === 'coordenador',
    isMembro: papelLideranca === 'membro'
  };
};