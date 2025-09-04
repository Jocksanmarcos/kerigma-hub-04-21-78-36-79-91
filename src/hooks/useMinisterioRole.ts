import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIsLiderMinisterio = () => {
  return useQuery({
    queryKey: ["is-lider-ministerio"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_lider_ministerio');
      
      if (error) {
        console.error('Erro ao verificar se é líder de ministério:', error);
        return false;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};